import type { CloudSaveResponse, ModernPlayerState, SyncResult } from "./types";
import { applySessionToLegacyKeys } from "./legacyBridge";

const DEFAULT_SAVE_API_URL = "https://your-worker-subdomain.workers.dev/api/save";

export function getSaveApiUrl(): string {
  return import.meta.env.VITE_SAVE_API_URL ?? DEFAULT_SAVE_API_URL;
}

function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (error instanceof TypeError) return true;
  return false;
}

/**
 * POST modern v6 state to the Cloudflare Worker.
 * On failure, persists locally and marks pendingSync without throwing.
 */
export async function syncPlayerStateToCloud(state: ModernPlayerState): Promise<SyncResult> {
  const payload = {
    playerId: state.playerId,
    state: {
      ...state,
      pendingSync: false,
    },
  };

  try {
    const response = await fetch(getSaveApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });

    if (!response.ok) {
      const offlineMarked: ModernPlayerState = {
        ...state,
        pendingSync: true,
      };
      applySessionToLegacyKeys(offlineMarked);
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
      body = null;
    }

    const lastSynced = body?.lastSynced ?? new Date().toISOString();
    const synced: ModernPlayerState = {
      ...state,
      lastSynced,
      pendingSync: false,
    };
    applySessionToLegacyKeys(synced);

    return { ok: true, lastSynced };
  } catch (error) {
    const offlineMarked: ModernPlayerState = {
      ...state,
      pendingSync: true,
    };
    applySessionToLegacyKeys(offlineMarked);

    return {
      ok: false,
      reason: isOfflineError(error) ? "offline" : "network",
      error: error instanceof Error ? error.message : "Unknown sync error",
    };
  }
}

let syncInFlight: Promise<SyncResult> | null = null;

/** Debounced cloud push – safe to call from the game loop / autosave hooks. */
export function queueCloudSync(state: ModernPlayerState): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = syncPlayerStateToCloud(state).finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

/** Retry any save flagged pendingSync (e.g. after reconnect). */
export async function retryPendingCloudSync(
  loader: () => ModernPlayerState
): Promise<SyncResult | null> {
  const state = loader();
  if (!state.pendingSync) return null;
  return queueCloudSync(state);
}
