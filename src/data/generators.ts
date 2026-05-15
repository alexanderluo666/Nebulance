import type { Planet } from "../types/planet";
import { starNames, BODY_RADIUS_SCALE } from "./worldConfig";

const legacyColors = ["#4fc3f7", "#81c784", "#ff8a65", "#ba68c8", "#ffd54f"];

/** Legacy planet list generator; parameters driven by worldConfig. */
export function generatePlanets(count: number): Planet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `${starNames[i % starNames.length]}-${i}`,
    size: (Math.random() * 1.5 + 0.5) * BODY_RADIUS_SCALE,
    color: legacyColors[Math.floor(Math.random() * legacyColors.length)]!,
    orbitRadius: (i * 4 + 4) * BODY_RADIUS_SCALE,
  }));
}
