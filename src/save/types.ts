import type { ShipId } from "../data/ships";

/** Canonical shipped game version. */
export const CURRENT_SAVE_VERSION = "6.0.0" as const;

export type SaveVersion =
  | "1.0.0"
  | "2.0.0"
  | "3.0.0"
  | "4.0.0"
  | "5.0.0"
  | typeof CURRENT_SAVE_VERSION;

export type ShipUpgrades = {
  laserLevel: number;
  shieldLevel: number;
  engineSpeed: number;
};

export type InventoryItemSave = {
  id: string;
  name: string;
  qty: number;
  icon: string;
};

/** Live expedition data (consolidated from scattered localStorage keys). */
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

/** v1.0.0 – v3.0.0: primitive profile fields only. */
export type LegacyPlayerStateV1 = {
  version?: "1.0.0";
  highScore: number;
  username: string;
};

export type LegacyPlayerStateV2 = {
  version: "2.0.0";
  highScore: number;
  username: string;
};

export type LegacyPlayerStateV3 = {
  version: "3.0.0";
  highScore: number;
  username: string;
};

/** v4.0.0+: progression objects and sync metadata. */
export type ModernPlayerStateV4 = {
  version: "4.0.0";
  highScore: number;
  username: string;
  shipUpgrades: ShipUpgrades;
  unlockedLevels: number[];
  lastSynced: string | null;
};

export type ModernPlayerStateV5 = {
  version: "5.0.0";
  highScore: number;
  username: string;
  shipUpgrades: ShipUpgrades;
  unlockedLevels: number[];
  lastSynced: string | null;
  playerId: string;
  session: GameSessionState;
};

/** v6.0.0: cloud sync flags + full session bridge. */
export type ModernPlayerState = {
  version: typeof CURRENT_SAVE_VERSION;
  highScore: number;
  username: string;
  shipUpgrades: ShipUpgrades;
  unlockedLevels: number[];
  lastSynced: string | null;
  pendingSync: boolean;
  playerId: string;
  session: GameSessionState;
};

/** Union of any shape we may read from storage or the API. */
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
