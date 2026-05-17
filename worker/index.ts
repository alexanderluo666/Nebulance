import type { ModernPlayerState } from "../src/save/types";

export interface Env {
  DB: D1Database;
}

type SaveBody = {
  playerId?: string;
  state?: ModernPlayerState;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/save" && request.method === "POST") {
      return handleSave(request, env);
    }

    if (url.pathname === "/api/load" && request.method === "GET") {
      return handleLoad(url, env);
    }

    return json({ error: "Not found" }, 404);
  },
};

async function handleSave(request: Request, env: Env): Promise<Response> {
  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const playerId = body.playerId?.trim();
  const state = body.state;

  if (!playerId || !state || state.version !== "6.0.0") {
    return json({ ok: false, error: "playerId and v6 state required" }, 400);
  }

  const lastSynced = new Date().toISOString();
  const payload = JSON.stringify({ ...state, lastSynced, pendingSync: false });

  await env.DB.prepare(
    `INSERT INTO player_saves (player_id, data, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(player_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  )
    .bind(playerId, payload, lastSynced)
    .run();

  return json({ ok: true, lastSynced });
}

async function handleLoad(url: URL, env: Env): Promise<Response> {
  const playerId = url.searchParams.get("playerId")?.trim();
  if (!playerId) {
    return json({ ok: false, error: "playerId query required" }, 400);
  }

  const row = await env.DB.prepare(
    `SELECT data, updated_at FROM player_saves WHERE player_id = ?`
  )
    .bind(playerId)
    .first<{ data: string; updated_at: string }>();

  if (!row) {
    return json({ ok: true, state: null }, 200);
  }

  return json({
    ok: true,
    state: JSON.parse(row.data),
    lastSynced: row.updated_at,
  });
}
