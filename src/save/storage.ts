import { createFreshModernState } from "./defaults";
import { applySessionToLegacyKeys, readUnifiedOrLegacyBlob } from "./legacyBridge";
import { migratePlayerState } from "./migratePlayerState";
import { queueCloudSync } from "./sync";
import type { GameSessionState, ModernPlayerState } from "./types";

let cachedState: ModernPlayerState | null = null;

export function loadPlayerState(): ModernPlayerState {
  const raw = readUnifiedOrLegacyBlob();
  const migrated = migratePlayerState(raw);
  cachedState = migrated;
  applySessionToLegacyKeys(migrated);
  return migrated;
}

export function getCachedPlayerState(): ModernPlayerState | null {
  return cachedState;
}

export function persistPlayerState(state: ModernPlayerState, options?: { syncCloud?: boolean }): ModernPlayerState {
  const next: ModernPlayerState = {
    ...state,
    version: "6.0.0",
  };
  cachedState = next;
  applySessionToLegacyKeys(next);

  if (options?.syncCloud !== false) {
    void queueCloudSync(next);
  }

  return next;
}

export function patchPlayerState(
  patch: Partial<Omit<ModernPlayerState, "session">> & { session?: Partial<GameSessionState> },
  options?: { syncCloud?: boolean }
): ModernPlayerState {
  const base = cachedState ?? loadPlayerState();
  const merged: ModernPlayerState = {
    ...base,
    ...patch,
    shipUpgrades: patch.shipUpgrades ? { ...base.shipUpgrades, ...patch.shipUpgrades } : base.shipUpgrades,
    unlockedLevels: patch.unlockedLevels ? [...patch.unlockedLevels] : base.unlockedLevels,
    session: {
      ...base.session,
      ...patch.session,
    },
  };

  return persistPlayerState(merged, options);
}

export function resetPlayerStateForNewExpedition(worldSeed: string, shipId: GameSessionState["shipId"]): ModernPlayerState {
  const previous = cachedState ?? loadPlayerState();
  const fresh = createFreshModernState({
    highScore: previous.highScore,
    username: previous.username,
    playerId: previous.playerId,
    worldSeed,
    shipId,
  });
  return persistPlayerState(fresh, { syncCloud: true });
}

export function clearExpeditionKeys(): void {
  localStorage.removeItem("nebulance_shipPos");
  localStorage.removeItem("nebulance_shipRot");
  localStorage.removeItem("nebulance_energy");
  localStorage.removeItem("nebulance_inventory");
  localStorage.removeItem("nebulance_docked");
  localStorage.removeItem("nebulance_balance");
  localStorage.removeItem("nebulance_ownedShips");
  localStorage.removeItem("nebulance_dockStationId");
}

export function registerSyncRetryOnReconnect(): () => void {
  const handler = () => {
    void retryPendingFromCache();
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}

async function retryPendingFromCache(): Promise<void> {
  const state = cachedState ?? loadPlayerState();
  if (!state.pendingSync) return;
  const { retryPendingCloudSync } = await import("./sync");
  await retryPendingCloudSync(() => cachedState ?? loadPlayerState());
}
