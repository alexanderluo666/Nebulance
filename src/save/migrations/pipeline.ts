import { createDefaultSession, DEFAULT_SHIP_UPGRADES, DEFAULT_UNLOCKED_LEVELS, DEFAULT_USERNAME } from "../defaults";
import type {
  GameSessionState,
  LegacyPlayerStateV2,
  LegacyPlayerStateV3,
  ModernPlayerState,
  ModernPlayerStateV4,
  ModernPlayerStateV5,
  ShipUpgrades,
  UnknownSavePayload,
} from "../types";
import { CURRENT_SAVE_VERSION } from "../types";
import type { SaveVersion } from "../types";
import { compareVersions, normalizeVersion } from "../versions";

function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === "undefined" || trimmed === "null") return fallback;
  return trimmed;
}

function readShipUpgrades(raw: unknown): ShipUpgrades {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SHIP_UPGRADES };
  const o = raw as Record<string, unknown>;
  return {
    laserLevel: readNumber(o.laserLevel, DEFAULT_SHIP_UPGRADES.laserLevel),
    shieldLevel: readNumber(o.shieldLevel, DEFAULT_SHIP_UPGRADES.shieldLevel),
    engineSpeed: readNumber(o.engineSpeed, DEFAULT_SHIP_UPGRADES.engineSpeed),
  };
}

function readUnlockedLevels(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [...DEFAULT_UNLOCKED_LEVELS];
  const levels = raw.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  return levels.length > 0 ? [...new Set(levels)].sort((a, b) => a - b) : [...DEFAULT_UNLOCKED_LEVELS];
}

function readSession(raw: unknown, fallbackSeed: string): GameSessionState {
  if (!raw || typeof raw !== "object") return createDefaultSession(fallbackSeed);
  const o = raw as Record<string, unknown>;
  const base = createDefaultSession(readString(o.worldSeed, fallbackSeed));
  return {
    ...base,
    worldSeed: readString(o.worldSeed, base.worldSeed),
    shipId: (typeof o.shipId === "string" ? o.shipId : base.shipId) as GameSessionState["shipId"],
    ownedShipIds: Array.isArray(o.ownedShipIds)
      ? (o.ownedShipIds.filter((id) => typeof id === "string") as GameSessionState["ownedShipIds"])
      : base.ownedShipIds,
    balance: readNumber(o.balance, base.balance),
    energy: readNumber(o.energy, base.energy),
    shipPos:
      o.shipPos && typeof o.shipPos === "object"
        ? (o.shipPos as GameSessionState["shipPos"])
        : base.shipPos,
    shipRot:
      o.shipRot && typeof o.shipRot === "object"
        ? (o.shipRot as GameSessionState["shipRot"])
        : base.shipRot,
    inventory: Array.isArray(o.inventory)
      ? (o.inventory as GameSessionState["inventory"])
      : base.inventory,
    docked: o.docked === true,
    dockStationId: typeof o.dockStationId === "string" ? o.dockStationId : null,
  };
}

export function migrateV1ToV2(data: UnknownSavePayload): LegacyPlayerStateV2 {
  return {
    version: "2.0.0",
    highScore: readNumber(data.highScore, 0),
    username: readString(data.username, DEFAULT_USERNAME),
  };
}

export function migrateV2ToV3(data: LegacyPlayerStateV2): LegacyPlayerStateV3 {
  return {
    version: "3.0.0",
    highScore: data.highScore,
    username: data.username.trim() || DEFAULT_USERNAME,
  };
}

export function migrateV3ToV4(data: LegacyPlayerStateV3, raw: UnknownSavePayload): ModernPlayerStateV4 {
  return {
    version: "4.0.0",
    highScore: data.highScore,
    username: data.username,
    shipUpgrades: readShipUpgrades(raw.shipUpgrades),
    unlockedLevels: readUnlockedLevels(raw.unlockedLevels),
    lastSynced: typeof raw.lastSynced === "string" ? raw.lastSynced : null,
  };
}

export function migrateV4ToV5(
  data: ModernPlayerStateV4,
  raw: UnknownSavePayload,
  sessionSeed: string
): ModernPlayerStateV5 {
  return {
    ...data,
    version: "5.0.0",
    playerId:
      typeof raw.playerId === "string" && raw.playerId.length > 0
        ? raw.playerId
        : crypto.randomUUID(),
    session: readSession(raw.session, sessionSeed),
  };
}

export function migrateV5ToV6(data: ModernPlayerStateV5, raw: UnknownSavePayload): ModernPlayerState {
  return {
    version: CURRENT_SAVE_VERSION,
    highScore: data.highScore,
    username: data.username,
    shipUpgrades: { ...data.shipUpgrades },
    unlockedLevels: [...data.unlockedLevels],
    lastSynced: data.lastSynced,
    pendingSync: raw.pendingSync === true,
    playerId: data.playerId,
    session: { ...data.session },
  };
}

function snapshotPrimitives(raw: UnknownSavePayload, fallback: LegacyPlayerStateV2): LegacyPlayerStateV2 {
  return {
    version: "2.0.0",
    highScore: readNumber(raw.highScore, fallback.highScore),
    username: readString(raw.username, fallback.username),
  };
}

/** Run the full non-destructive upgrade ladder toward v6.0.0. */
export function runMigrationPipeline(raw: UnknownSavePayload, sessionSeed: string): ModernPlayerState {
  const startVersion = normalizeVersion(raw.version);

  let cursor: SaveVersion = startVersion;
  let v2 = snapshotPrimitives(raw, migrateV1ToV2(raw));
  if (compareVersions(cursor, "2.0.0") < 0) {
    v2 = migrateV1ToV2(raw);
    cursor = "2.0.0";
  }

  let v3 = migrateV2ToV3(v2);
  if (compareVersions(startVersion, "3.0.0") >= 0) {
    v3 = {
      version: "3.0.0",
      highScore: readNumber(raw.highScore, v2.highScore),
      username: readString(raw.username, v2.username),
    };
  }
  if (compareVersions(cursor, "3.0.0") < 0) cursor = "3.0.0";

  let v4 = migrateV3ToV4(v3, raw);
  if (compareVersions(startVersion, "4.0.0") >= 0) {
    v4 = {
      version: "4.0.0",
      highScore: readNumber(raw.highScore, v3.highScore),
      username: readString(raw.username, v3.username),
      shipUpgrades: readShipUpgrades(raw.shipUpgrades),
      unlockedLevels: readUnlockedLevels(raw.unlockedLevels),
      lastSynced: typeof raw.lastSynced === "string" ? raw.lastSynced : null,
    };
  }
  if (compareVersions(cursor, "4.0.0") < 0) cursor = "4.0.0";

  let v5: ModernPlayerStateV5 =
    compareVersions(startVersion, "5.0.0") >= 0
      ? {
          version: "5.0.0",
          highScore: v4.highScore,
          username: v4.username,
          shipUpgrades: v4.shipUpgrades,
          unlockedLevels: v4.unlockedLevels,
          lastSynced: v4.lastSynced,
          playerId:
            typeof raw.playerId === "string" && raw.playerId.length > 0
              ? raw.playerId
              : crypto.randomUUID(),
          session: readSession(raw.session, sessionSeed),
        }
      : migrateV4ToV5(v4, raw, sessionSeed);
  if (compareVersions(cursor, "5.0.0") < 0) cursor = "5.0.0";

  return migrateV5ToV6(v5, raw);
}
