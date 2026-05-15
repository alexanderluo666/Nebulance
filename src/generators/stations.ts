import type { SpaceStationData } from "../types/station";
import { stationConfig } from "../data/worldConfig";
import { createPRNG } from "./starSystem";

export function generateStations(worldSeed: string): SpaceStationData[] {
  const random = createPRNG(`${worldSeed}-stations`);
  const count =
    stationConfig.countMin +
    Math.floor(random() * (stationConfig.countMax - stationConfig.countMin + 1));
  const minSepSq = stationConfig.minSeparation * stationConfig.minSeparation;
  const positions: [number, number, number][] = [];

  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate: [number, number, number] = [
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
      ];
      const ok = positions.every((p) => {
        const dx = p[0] - candidate[0];
        const dy = p[1] - candidate[1];
        const dz = p[2] - candidate[2];
        return dx * dx + dy * dy + dz * dz >= minSepSq;
      });
      if (ok) {
        positions.push(candidate);
        placed = true;
        break;
      }
    }
    if (!placed) {
      positions.push([
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
      ]);
    }
  }

  return positions.map((position, index) => ({
    id: `station-${index}`,
    name: `Station ${String.fromCharCode(65 + index)}${index + 1}`,
    position,
    rotation: [0, random() * Math.PI * 2, 0],
  }));
}
