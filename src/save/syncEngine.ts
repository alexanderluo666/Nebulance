import { migratePlayerState } from "./migratePlayerState";
import { getCachedPlayerState, loadPlayerState, persistPlayerState } from "./storage";
import { queueCloudSync, retryPendingCloudSync, syncPlayerStateToCloud } from "./sync";
import type { ModernPlayerState, SyncResult } from "./types";

const SYNC_TICK_MS = 30_000;

/**
 * Version-resilient sync orchestrator for the React game loop.
 * - Loads & migrates legacy localStorage / API payloads
 * - POSTs v6 state to Cloudflare Worker
 * - Falls back to localStorage + pendingSync on offline / server errors
 */
export class PlayerSyncEngine {
  private state: ModernPlayerState | null = null;
  private tickTimer: number | null = null;
  private unregisterOnline: (() => void) | null = null;

  /** Boot: read storage, migrate to v6, apply locally. Never throws. */
  bootstrap(): ModernPlayerState {
    try {
      this.state = loadPlayerState();
    } catch {
      this.state = migratePlayerState({});
      persistPlayerState(this.state, { syncCloud: false });
    }
    return this.state;
  }

  getState(): ModernPlayerState {
    return this.state ?? getCachedPlayerState() ?? this.bootstrap();
  }

  /** Persist to localStorage immediately (no network). */
  saveLocal(state: ModernPlayerState): ModernPlayerState {
    this.state = persistPlayerState(state, { syncCloud: false });
    return this.state;
  }

  /** POST migrated v6 state to Cloudflare; offline-safe. */
  async syncToCloud(state: ModernPlayerState = this.getState()): Promise<SyncResult> {
    try {
      const result = await syncPlayerStateToCloud(state);
      this.state = getCachedPlayerState() ?? state;
      return result;
    } catch (error) {
      const fallback: ModernPlayerState = { ...state, pendingSync: true };
      this.state = persistPlayerState(fallback, { syncCloud: false });
      return {
        ok: false,
        reason: "network",
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  /** Local write first, then async cloud push (non-blocking for game loop). */
  saveAndSync(state: ModernPlayerState): ModernPlayerState {
    this.state = persistPlayerState(state, { syncCloud: false });
    void this.syncToCloud(this.state);
    return this.state;
  }

  /** Game-loop tick: retry pending cloud sync when online. */
  tick(): void {
    const current = this.getState();
    if (!current.pendingSync) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    void queueCloudSync(current).then(() => {
      this.state = getCachedPlayerState();
    });
  }

  /** Start background sync tick + online retry listener. */
  startBackgroundSync(): () => void {
    this.stopBackgroundSync();

    const onOnline = () => this.tick();
    window.addEventListener("online", onOnline);
    this.unregisterOnline = () => window.removeEventListener("online", onOnline);

    this.tickTimer = window.setInterval(() => this.tick(), SYNC_TICK_MS);

    return () => this.stopBackgroundSync();
  }

  stopBackgroundSync(): void {
    if (this.tickTimer !== null) {
      window.clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.unregisterOnline?.();
    this.unregisterOnline = null;
  }

  async retryPending(): Promise<SyncResult | null> {
    return retryPendingCloudSync(() => this.getState());
  }
}

/** Singleton used by the React app / game loop. */
export const playerSyncEngine = new PlayerSyncEngine();

export { migratePlayerState, syncPlayerStateToCloud, queueCloudSync };
