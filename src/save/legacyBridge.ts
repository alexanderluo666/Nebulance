import { BALANCE_STORAGE_KEY, loadBalance } from "../data/economy";
import {
  isPremiumShip,
  loadOwnedShipIds,
  loadSavedShipId,
  OWNED_SHIPS_STORAGE_KEY,
  SHIP_STORAGE_KEY,
} from "../data/ships";
import { defaultInventory } from "../data/worldConfig";
import type { GameSessionState, ModernPlayerState, UnknownSavePayload } from "./types";

/** Unified v6 blob key. */
export const PLAYER_STATE_STORAGE_KEY = "nebulance_playerState";

/** Very old monolithic save key (v1 era). */
export const LEGACY_MONOLITH_KEY = "nebulance_save";

const SCATTERED_KEYS = {
  shipPos: "nebulance_shipPos",
  shipRot: "nebulance_shipRot",
  energy: "nebulance_energy",
  inventory: "nebulance_inventory",
  docked: "nebulance_docked",
  dockStationId: "nebulance_dockStationId",
  worldSeed: "nebulance_worldSeed",
} as const;

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Pull primitive + scattered expedition keys into one migration-friendly object. */
export function collectLegacyLocalStoragePayload(): UnknownSavePayload {
  const payload: UnknownSavePayload = {};

  const monolith = readJson<UnknownSavePayload>(LEGACY_MONOLITH_KEY);
  if (monolith) Object.assign(payload, monolith);

  if (localStorage.getItem(SCATTERED_KEYS.worldSeed)) {
    payload.worldSeed = localStorage.getItem(SCATTERED_KEYS.worldSeed);
  }

  const session: Partial<GameSessionState> = {
    worldSeed: localStorage.getItem(SCATTERED_KEYS.worldSeed) ?? "",
    shipId: loadSavedShipId(),
    ownedShipIds: loadOwnedShipIds(),
    balance: loadBalance(),
    energy: parseFloat(localStorage.getItem(SCATTERED_KEYS.energy) ?? "100"),
    shipPos: readJson(SCATTERED_KEYS.shipPos),
    shipRot: readJson(SCATTERED_KEYS.shipRot),
    inventory: readJson(SCATTERED_KEYS.inventory) ?? defaultInventory.map((i) => ({ ...i })),
    docked: localStorage.getItem(SCATTERED_KEYS.docked) === "true",
    dockStationId: localStorage.getItem(SCATTERED_KEYS.dockStationId),
  };

  payload.session = session;

  return payload;
}

/** Mirror session fields back to existing per-key writers across the codebase. */
export function applySessionToLegacyKeys(state: ModernPlayerState): void {
  const { session } = state;
  localStorage.setItem(PLAYER_STATE_STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(SCATTERED_KEYS.worldSeed, session.worldSeed);
  localStorage.setItem(SHIP_STORAGE_KEY, session.shipId);
  localStorage.setItem(
    OWNED_SHIPS_STORAGE_KEY,
    JSON.stringify(session.ownedShipIds.filter((id) => isPremiumShip(id)))
  );
  localStorage.setItem(BALANCE_STORAGE_KEY, String(Math.max(0, session.balance)));
  localStorage.setItem(SCATTERED_KEYS.energy, String(session.energy));
  localStorage.setItem(SCATTERED_KEYS.inventory, JSON.stringify(session.inventory));
  localStorage.setItem(SCATTERED_KEYS.docked, session.docked ? "true" : "false");

  if (session.dockStationId) {
    localStorage.setItem(SCATTERED_KEYS.dockStationId, session.dockStationId);
  } else {
    localStorage.removeItem(SCATTERED_KEYS.dockStationId);
  }

  if (session.shipPos) {
    localStorage.setItem(SCATTERED_KEYS.shipPos, JSON.stringify(session.shipPos));
  }
  if (session.shipRot) {
    localStorage.setItem(SCATTERED_KEYS.shipRot, JSON.stringify(session.shipRot));
  }
}

export function readUnifiedOrLegacyBlob(): unknown {
  const unified = localStorage.getItem(PLAYER_STATE_STORAGE_KEY);
  if (unified) return unified;

  const legacy = localStorage.getItem(LEGACY_MONOLITH_KEY);
  if (legacy) return legacy;

  return collectLegacyLocalStoragePayload();
}
