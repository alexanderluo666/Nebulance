import type { CloudSaveResponse, ModernPlayerState, SyncResult } from "./types";
import { PLAYER_STATE_STORAGE_KEY, applySessionToLegacyKeys } from "./legacyBridge";

/**
 * Local dev:  http://localhost:8788/api/save  (VITE_API_URL=http://localhost:8788)
 * Production: /api/save                        (VITE_API_URL empty → same-origin)
 */
export function getSaveApiUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:8788";
  const normalized = String(base).replace(/\/$/, "");
  return normalized ? `${normalized}/api/save` : "/api/save";
}

function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (error instanceof TypeError) return true;
  return false;
}

function persistPendingLocal(state: ModernPlayerState): ModernPlayerState {
  const pending: ModernPlayerState = { ...state, pendingSync: true };
  applySessionToLegacyKeys(pending);
  return pending;
}

function persistSyncedLocal(state: ModernPlayerState, lastSynced: string): ModernPlayerState {
  const synced: ModernPlayerState = { ...state, lastSynced, pendingSync: false };
  applySessionToLegacyKeys(synced);
  return synced;
}

/**
 * POST v6 player state to Cloudflare Worker `/api/save`.
 * Never throws — falls back to localStorage with pendingSync: true.
 */
export async function syncPlayerStateToCloud(state: ModernPlayerState): Promise<SyncResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    persistPendingLocal(state);
    return { ok: false, reason: "offline", error: "Browser is offline" };
  }

  const playerState: ModernPlayerState = { ...state, pendingSync: false };

  // If running locally: http://localhost:8788/api/save
  // If running in production: /api/save (same-origin)
  const targetUrl = getSaveApiUrl();

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerState),
    });

    if (!response.ok) {
      persistPendingLocal(state);
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
      persistPendingLocal(state);
      return { ok: false, reason: "parse", error: "Invalid JSON from save API" };
    }

    const lastSynced = body?.lastSynced ?? new Date().toISOString();
    persistSyncedLocal(state, lastSynced);
    return { ok: true, lastSynced };
  } catch (error) {
    persistPendingLocal(state);
    return {
      ok: false,
      reason: isOfflineError(error) ? "offline" : "network",
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}

let syncInFlight: Promise<SyncResult> | null = null;

/** Coalesced cloud push — safe to call from autosave / game loop. */
export function queueCloudSync(state: ModernPlayerState): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = syncPlayerStateToCloud(state).finally(() => {
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
  return localStorage.getItem(PLAYER_STATE_STORAGE_KEY);
}
