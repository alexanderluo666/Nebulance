/// <reference types="@cloudflare/workers-types" />

/** Cloudflare Pages + D1 bindings */
export interface Env {
  DB: D1Database;
}

export interface ShipUpgrades {
  laserLevel: number;
  shieldLevel: number;
}

/** Canonical v6.0.0 save payload (additional game fields stored in `data` JSON). */
export interface ModernPlayerState {
  version: string;
  highScore: number;
  shipUpgrades: ShipUpgrades;
  lastSynced: string;
  pendingSync?: boolean;
  playerId?: string;
  username?: string;
  unlockedLevels?: number[];
  session?: Record<string, unknown>;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

const DEFAULT_UPGRADES: ShipUpgrades = { laserLevel: 1, shieldLevel: 1 };
const CURRENT_VERSION = "6.0.0";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Server-side migration fallback: legacy v1–v3 payloads often only include highScore.
 * Never resets an existing high score.
 */
export function migratePlayerState(data: unknown): ModernPlayerState {
  let raw: Record<string, unknown> = {};

  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        raw = parsed as Record<string, unknown>;
      }
    } catch {
      raw = {};
    }
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    raw = { ...(data as Record<string, unknown>) };
  }

  const version =
    typeof raw.version === "string" && raw.version.trim().length > 0
      ? raw.version.trim()
      : "1.0.0";

  const highScore = readNumber(raw.highScore, 0);

  let shipUpgrades: ShipUpgrades = { ...DEFAULT_UPGRADES };
  if (raw.shipUpgrades && typeof raw.shipUpgrades === "object") {
    const su = raw.shipUpgrades as Record<string, unknown>;
    shipUpgrades = {
      laserLevel: readNumber(su.laserLevel, DEFAULT_UPGRADES.laserLevel),
      shieldLevel: readNumber(su.shieldLevel, DEFAULT_UPGRADES.shieldLevel),
    };
  } else if (compareLegacyVersion(version) < compareLegacyVersion("4.0.0")) {
    shipUpgrades = { ...DEFAULT_UPGRADES };
  }

  const playerId =
    typeof raw.playerId === "string" && raw.playerId.trim().length > 0
      ? raw.playerId.trim()
      : crypto.randomUUID();

  const lastSynced =
    typeof raw.lastSynced === "string" && raw.lastSynced.length > 0
      ? raw.lastSynced
      : new Date().toISOString();

  return {
    ...raw,
    version: CURRENT_VERSION,
    highScore,
    shipUpgrades,
    lastSynced,
    pendingSync: false,
    playerId,
  };
}

function compareLegacyVersion(v: string): number {
  const parts = v.split(".").map((n) => parseInt(n, 10) || 0);
  return parts[0] * 1_000_000 + (parts[1] ?? 0) * 1_000 + (parts[2] ?? 0);
}

/** CORS preflight for browser POST from Vite localhost. */
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const migrated = migratePlayerState(body);
  const playerId = migrated.playerId;
  if (!playerId) {
    return jsonResponse({ ok: false, error: "playerId required after migration" }, 400);
  }

  const lastSynced = new Date().toISOString();
  const payload: ModernPlayerState = { ...migrated, lastSynced, pendingSync: false };
  const dataJson = JSON.stringify(payload);

  // D1 upsert into `players` table
  await context.env.DB.prepare(
    `INSERT INTO players (player_id, data, high_score, last_synced, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(player_id) DO UPDATE SET
       data = excluded.data,
       high_score = excluded.high_score,
       last_synced = excluded.last_synced,
       updated_at = excluded.updated_at`
  )
    .bind(playerId, dataJson, payload.highScore, lastSynced, lastSynced)
    .run();

  return jsonResponse({ ok: true, lastSynced });
};
