import spaceship1Url from "../assets/Spaceship1.glb?url";
import spaceship2Url from "../assets/Spaceship2.glb?url";
import spaceship3Url from "../assets/Spaceship3.glb?url";
import spaceship4Url from "../assets/Spaceship4.glb?url";
import spaceship5Url from "../assets/Spaceship5.glb?url";

export type ShipId = "spaceship1" | "spaceship2" | "spaceship3" | "spaceship4" | "spaceship5";

export const SHIP_STORAGE_KEY = "nebulance_shipId";
export const OWNED_SHIPS_STORAGE_KEY = "nebulance_ownedShips";

export const STARTER_SHIP_IDS: ShipId[] = ["spaceship1", "spaceship2"];

export type ShipDefinition = {
  id: ShipId;
  label: string;
  description: string;
  url: string;
  /** In-world model scale (GLB sources vary widely in size). */
  worldScale: number;
  previewScale: number;
  /** Third-person camera offset [x, y, z] in ship-local space. */
  cameraOffset: [number, number, number];
  /** Nebulance Dollars; only set for premium hulls sold at stations. */
  price?: number;
};

export const starterShipCatalog: ShipDefinition[] = [
  {
    id: "spaceship1",
    label: "Basic Mk.I",
    description: "Balanced starter hull",
    url: spaceship1Url,
    worldScale: 0.1,
    previewScale: 0.1,
    cameraOffset: [0, 2, 10],
  },
  {
    id: "spaceship2",
    label: "Basic Mk.II",
    description: "Compact agile frame",
    url: spaceship2Url,
    worldScale: 0.1,
    previewScale: 0.1,
    cameraOffset: [0, 2, 10],
  },
];

export const premiumShipCatalog: ShipDefinition[] = [
  {
    id: "spaceship3",
    label: "Nebulaster Mk.III",
    description: "Reinforced patrol chassis",
    url: spaceship3Url,
    worldScale: 0.32,
    previewScale: 0.26,
    cameraOffset: [0, 2.8, 13],
    price: 100,
  },
  {
    id: "spaceship4",
    label: "Ghostrider Mk.IV",
    description: "High-thrust strike frame",
    url: spaceship4Url,
    worldScale: 0.048,
    previewScale: 0.042,
    cameraOffset: [0, 3.5, 16],
    price: 200,
  },
  {
    id: "spaceship5",
    label: "Haloist Mk.V",
    description: "Heavy command hull",
    url: spaceship5Url,
    worldScale: 0.07,
    previewScale: 0.06,
    cameraOffset: [0, 3.2, 15],
    price: 250,
  },
];

/** Full catalog: starters + station-only premium hulls. */
export const shipCatalog: ShipDefinition[] = [...starterShipCatalog, ...premiumShipCatalog];

export function getShipDefinition(id: ShipId): ShipDefinition {
  return shipCatalog.find((s) => s.id === id) ?? starterShipCatalog[0];
}

export function getShipModelUrl(id: ShipId): string {
  return getShipDefinition(id).url;
}

export function isStarterShip(id: ShipId): boolean {
  return STARTER_SHIP_IDS.includes(id);
}

export function isPremiumShip(id: ShipId): boolean {
  return !isStarterShip(id);
}

export function loadOwnedShipIds(): ShipId[] {
  const owned = new Set<ShipId>(STARTER_SHIP_IDS);
  const saved = localStorage.getItem(OWNED_SHIPS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as ShipId[];
      for (const id of parsed) {
        if (shipCatalog.some((s) => s.id === id)) owned.add(id);
      }
    } catch {
      /* ignore */
    }
  }
  return [...owned];
}

export function saveOwnedShipIds(ids: ShipId[]) {
  const premium = ids.filter(isPremiumShip);
  localStorage.setItem(OWNED_SHIPS_STORAGE_KEY, JSON.stringify(premium));
}

export function loadSavedShipId(): ShipId {
  const saved = localStorage.getItem(SHIP_STORAGE_KEY) as ShipId | null;
  const owned = loadOwnedShipIds();
  if (saved && owned.includes(saved)) return saved;
  return "spaceship1";
}

export function saveShipId(id: ShipId) {
  localStorage.setItem(SHIP_STORAGE_KEY, id);
}
