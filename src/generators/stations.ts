import type { SpaceStationData } from "../types/station";
import { defaultSpawn, stationConfig } from "../data/worldConfig";
import { createPRNG } from "./starSystem";

function distSq(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

function withinSpawnBox(position: [number, number, number]) {
  const h = stationConfig.nearSpawnHalfExtent;
  return (
    Math.abs(position[0] - defaultSpawn.x) <= h &&
    Math.abs(position[1] - defaultSpawn.y) <= h &&
    Math.abs(position[2] - defaultSpawn.z) <= h
  );
}

function placeHomeStation(random: () => number): [number, number, number] {
  // Ahead of default spawn along -Z (ship forward), clearly in view
  return [
    defaultSpawn.x + (random() - 0.5) * 24,
    defaultSpawn.y + (random() - 0.5) * 12,
    defaultSpawn.z - (28 + random() * 14),
  ];
}

export function generateStations(worldSeed: string): SpaceStationData[] {
  const random = createPRNG(`${worldSeed}-stations`);
  const count =
    stationConfig.countMin +
    Math.floor(random() * (stationConfig.countMax - stationConfig.countMin + 1));
  const minSepSq = stationConfig.minSeparation * stationConfig.minSeparation;
  const positions: [number, number, number][] = [placeHomeStation(random)];

  for (let i = 1; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate: [number, number, number] = [
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
        (random() - 0.5) * stationConfig.spawnVolume,
      ];
      const ok =
        positions.every((p) => distSq(p, candidate) >= minSepSq) && !withinSpawnBox(candidate);
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
    name: index === 0 ? "Station Alpha" : `Station ${String.fromCharCode(65 + index)}${index + 1}`,
    position,
    rotation: [0, random() * Math.PI * 2, 0],
    isHome: index === 0,
  }));
}

export function getHomeStation(stations: SpaceStationData[]): SpaceStationData | undefined {
  return stations.find((s) => s.isHome) ?? stations[0];
}

/** Ship pose for a new game: behind home station, facing it. */
export function getNewGameShipPose(homeStation: SpaceStationData) {
  const [sx, sy, sz] = homeStation.position;
  return {
    position: { x: sx, y: sy + 6, z: sz + 42 },
    rotation: { _x: 0, _y: 0, _z: 0 },
  };
}
