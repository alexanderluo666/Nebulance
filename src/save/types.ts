import type { ShipId } from "../data/ships";

/** Canonical save format version. */
export const CURRENT_SAVE_VERSION = "6.0.0" as const;

export type SaveVersion =
  | "1.0.0"
  | "2.0.0"
  | "3.0.0"
  | "4.0.0"
  | "5.0.0"
  | typeof CURRENT_SAVE_VERSION;

/** v6.0.0 ship upgrade progression. */
export type ShipUpgrades = {
  laserLevel: number;
  shieldLevel: number;
};

/**
 * Canonical v6.0.0 player profile synced with Cloudflare D1.
 * Legacy v1–v3 payloads only carried `highScore`; migration injects the rest.
 */
export type ModernPlayerState = {
  version: typeof CURRENT_SAVE_VERSION;
  highScore: number;
  shipUpgrades: ShipUpgrades;
  lastSynced: string | null;
  pendingSync: boolean;
  /** Stable id for D1 row key. */
  playerId: string;
  /** Extended Nebulance runtime (also persisted locally). */
  username: string;
  unlockedLevels: number[];
  session: GameSessionState;
};

export type InventoryItemSave = {
  id: string;
  name: string;
  qty: number;
  icon: string;
};

export type GameSessionState = {
  worldSeed: string;
  shipId: ShipId;
  ownedShipIds: ShipId[];
  balance: number;
  shipPos: { x: number; y: number; z: number } | null;
  shipRot: { _x: number; _y: number; _z: number } | null;
  energy: number;
  inventory: InventoryItemSave[];
  docked: boolean;
  dockStationId: string | null;
};

/** v1.0.0 – v3.0.0: primitive profile only. */
export type LegacyPlayerState = {
  version?: "1.0.0" | "2.0.0" | "3.0.0";
  highScore?: number;
  username?: string;
};

export type UnknownSavePayload = Record<string, unknown>;

export type CloudSaveRequest = {
  playerId: string;
  state: ModernPlayerState;
};

export type CloudSaveResponse = {
  ok: boolean;
  lastSynced: string;
};

export type SyncResult =
  | { ok: true; lastSynced: string }
  | { ok: false; reason: "offline" | "http" | "network" | "parse"; error?: string };

/** @deprecated Use LegacyPlayerState */
export type LegacyPlayerStateV1 = LegacyPlayerState;
export type LegacyPlayerStateV2 = LegacyPlayerState & { version: "2.0.0" };
export type LegacyPlayerStateV3 = LegacyPlayerState & { version: "3.0.0" };
