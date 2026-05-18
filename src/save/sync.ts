import { migratePlayerState } from "./migratePlayerState";
import type { CloudSaveResponse, ModernPlayerState, SyncResult } from "./types";
import { LEGACY_MONOLITH_KEY, PLAYER_STATE_STORAGE_KEY, applySessionToLegacyKeys } from "./legacyBridge";

/**
 * Local dev:  http://localhost:8788/api/save  (VITE_API_URL=http://localhost:8788)
 * Production: /api/save                        (VITE_API_URL="" → same-origin Pages Function)
 */
export function getSaveApiUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  const normalized = String(base).replace(/\/$/, "");
  return normalized ? `${normalized}/api/save` : "/api/save";
}

function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (error instanceof TypeError) return true;
  return false;
}

/** Offline queue: primary monolith key used by the save pipeline spec. */
function writeLocalFallback(rawState: unknown): ModernPlayerState {
  const migrated = migratePlayerState(rawState);
  const pending: ModernPlayerState = { ...migrated, pendingSync: true };
  const serialized = JSON.stringify(pending);

  localStorage.setItem(LEGACY_MONOLITH_KEY, serialized);
  localStorage.setItem(PLAYER_STATE_STORAGE_KEY, serialized);
  applySessionToLegacyKeys(pending);

  return pending;
}

function writeLocalSuccess(state: ModernPlayerState, lastSynced: string): ModernPlayerState {
  const synced: ModernPlayerState = { ...state, lastSynced, pendingSync: false };
  const serialized = JSON.stringify(synced);

  localStorage.setItem(LEGACY_MONOLITH_KEY, serialized);
  localStorage.setItem(PLAYER_STATE_STORAGE_KEY, serialized);
  applySessionToLegacyKeys(synced);

  return synced;
}

/**
 * POST player state to the Cloudflare Pages Function at `/api/save`.
 * Never throws — queues to localStorage with pendingSync on failure.
 */
export async function syncGameStateToServer(currentState: unknown): Promise<SyncResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    writeLocalFallback(currentState);
    return { ok: false, reason: "offline", error: "Browser is offline" };
  }

  const migrated = migratePlayerState(currentState);
  const targetUrl = getSaveApiUrl();

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(migrated),
    });

    if (!response.ok) {
      writeLocalFallback(currentState);
      return {
        ok: false,
        reason: "http",
        error: `Save API responded with ${response.status}`,
      };
    }

    let body: CloudSaveResponse | null = null;
    try {
      body = (await response.json()) as CloudSaveResponse;
    } catch {
      writeLocalFallback(currentState);
      return { ok: false, reason: "parse", error: "Invalid JSON from save API" };
    }

    const lastSynced = body?.lastSynced ?? new Date().toISOString();
    writeLocalSuccess(migrated, lastSynced);
    return { ok: true, lastSynced };
  } catch (error) {
    writeLocalFallback(currentState);
    return {
      ok: false,
      reason: isOfflineError(error) ? "offline" : "network",
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}

/** @alias syncGameStateToServer */
export async function syncPlayerStateToCloud(state: ModernPlayerState): Promise<SyncResult> {
  return syncGameStateToServer(state);
}

let syncInFlight: Promise<SyncResult> | null = null;

export function queueCloudSync(state: ModernPlayerState): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = syncGameStateToServer(state).finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}

export async function retryPendingCloudSync(
  loader: () => ModernPlayerState
): Promise<SyncResult | null> {
  const state = loader();
  if (!state.pendingSync) return null;
  return queueCloudSync(state);
}

export function readLocalPlayerStateRaw(): string | null {
  return (
    localStorage.getItem(LEGACY_MONOLITH_KEY) ??
    localStorage.getItem(PLAYER_STATE_STORAGE_KEY)
  );
}
