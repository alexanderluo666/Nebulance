import { STARTER_SHIP_IDS, type ShipId } from "../data/ships";
import { startingBalance } from "../data/economy";
import { defaultInventory } from "../data/worldConfig";
import type { GameSessionState, ModernPlayerState, ShipUpgrades } from "./types";
import { CURRENT_SAVE_VERSION } from "./types";

export const DEFAULT_USERNAME = "Pilot";

export const DEFAULT_SHIP_UPGRADES: ShipUpgrades = {
  laserLevel: 1,
  shieldLevel: 1,
};

export const DEFAULT_UNLOCKED_LEVELS: number[] = [1];

export function createDefaultSession(worldSeed: string, shipId: ShipId = "spaceship1"): GameSessionState {
  return {
    worldSeed,
    shipId,
    ownedShipIds: [...STARTER_SHIP_IDS],
    balance: startingBalance,
    shipPos: null,
    shipRot: null,
    energy: 100,
    inventory: defaultInventory.map((item) => ({ ...item })),
    docked: false,
    dockStationId: null,
  };
}

export function createFreshModernState(
  overrides: Partial<Pick<ModernPlayerState, "username" | "highScore" | "playerId">> & {
    worldSeed?: string;
    shipId?: ShipId;
  } = {}
): ModernPlayerState {
  const playerId = overrides.playerId ?? crypto.randomUUID();
  const worldSeed = overrides.worldSeed ?? String(Math.floor(100000 + Math.random() * 900000));

  return {
    version: CURRENT_SAVE_VERSION,
    highScore: overrides.highScore ?? 0,
    username: overrides.username ?? DEFAULT_USERNAME,
    shipUpgrades: { ...DEFAULT_SHIP_UPGRADES },
    unlockedLevels: [...DEFAULT_UNLOCKED_LEVELS],
    lastSynced: null,
    pendingSync: false,
    playerId,
    session: createDefaultSession(worldSeed, overrides.shipId ?? "spaceship1"),
  };
}
