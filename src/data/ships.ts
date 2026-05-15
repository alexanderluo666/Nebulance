import spaceship1Url from "../assets/Spaceship1.glb?url";
import spaceship2Url from "../assets/Spaceship2.glb?url";

export type ShipId = "spaceship1" | "spaceship2";

export const SHIP_STORAGE_KEY = "nebulance_shipId";

export type ShipDefinition = {
  id: ShipId;
  label: string;
  description: string;
  url: string;
  previewScale: number;
};

export const shipCatalog: ShipDefinition[] = [
  {
    id: "spaceship1",
    label: "Basic Mk.I",
    description: "Balanced starter hull",
    url: spaceship1Url,
    previewScale: 0.1,
  },
  {
    id: "spaceship2",
    label: "Basic Mk.II",
    description: "Compact agile frame",
    url: spaceship2Url,
    previewScale: 0.1,
  },
];

export function getShipDefinition(id: ShipId): ShipDefinition {
  return shipCatalog.find((s) => s.id === id) ?? shipCatalog[0];
}

export function getShipModelUrl(id: ShipId): string {
  return getShipDefinition(id).url;
}

export function loadSavedShipId(): ShipId {
  const saved = localStorage.getItem(SHIP_STORAGE_KEY);
  if (saved === "spaceship2") return "spaceship2";
  return "spaceship1";
}

export function saveShipId(id: ShipId) {
  localStorage.setItem(SHIP_STORAGE_KEY, id);
}
