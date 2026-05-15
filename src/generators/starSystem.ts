import type { StarSystem, Moon, AsteroidBelt } from "../types/starSystem";
import {
  BODY_RADIUS_SCALE,
  galaxyConfig,
  starSystemConfig,
  starTypes,
  planetTypes,
  starNames,
  ringPalettes,
} from "../data/worldConfig";

export function createPRNG(seedStr: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 2654435761);
  }
  let a = h ^ (h >>> 16);
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeMoon(id: number, planetSize: number, random: () => number): Moon {
  return {
    id,
    name: `${starNames[Math.floor(random() * starNames.length)]}-Moon-${id}`,
    size: (random() * (5 - 1) + 1) * BODY_RADIUS_SCALE,
    orbitalRadius: (random() * (planetSize * 2.8 - planetSize * 1.4) + planetSize * 1.4),
    orbitalPeriod: random() * (18 - 6) + 6,
    inclination: random() * (starSystemConfig.inclinationRange * 2) - starSystemConfig.inclinationRange,
    color: "#d5d5d5",
    phase: random() * Math.PI * 2,
  };
}

function makeAsteroidBelt(id: number, random: () => number): AsteroidBelt {
  const innerRadius = (random() * (48 - 24) + 24) * BODY_RADIUS_SCALE;
  const thickness = (random() * (16 - 6) + 6) * BODY_RADIUS_SCALE;
  return {
    id,
    innerRadius,
    outerRadius: innerRadius + thickness,
    count: Math.floor(random() * (44 - 24) + 24),
    height: (random() * (14 - (-14)) + (-14)) * BODY_RADIUS_SCALE,
    speed: random() * (0.014 - 0.005) + 0.005,
  };
}

export function generateStarSystem(worldSystemSeed: string): StarSystem {
  const worldRandom = createPRNG(worldSystemSeed);

  const starIndex = Math.floor(worldRandom() * starTypes.length);
  const starConfig = starTypes[starIndex];
  const star: StarSystem["star"] = {
    name: `${starNames[Math.floor(worldRandom() * starNames.length)]} ${String.fromCharCode(65 + Math.floor(worldRandom() * 26))}${String.fromCharCode(65 + Math.floor(worldRandom() * 26))}${String.fromCharCode(65 + Math.floor(worldRandom() * 26))}${String.fromCharCode(65 + Math.floor(worldRandom() * 26))}`,
    type: starConfig.type,
    color: starConfig.color,
    radius: starConfig.radius,
    intensity: starConfig.intensity,
    position: [0, 0, 0],
  };

  const planetCount =
    starSystemConfig.planetCountMin +
    Math.floor(worldRandom() * (starSystemConfig.planetCountMax - starSystemConfig.planetCountMin + 1));
  let currentMinRadius = starSystemConfig.initialOrbitRadius;
  const planets = Array.from({ length: planetCount }, (_, index) => {
    const planetRandom = createPRNG(`${worldSystemSeed}-planet-${index}`);

    const type = planetTypes[Math.floor(planetRandom() * planetTypes.length)];
    const size =
      planetRandom() * (starSystemConfig.planetSizeMax - starSystemConfig.planetSizeMin) +
      starSystemConfig.planetSizeMin;
    const orbitalRadius =
      currentMinRadius +
      size / 2 +
      planetRandom() * (starSystemConfig.orbitGapRandomMax - starSystemConfig.orbitGapRandomMin) +
      starSystemConfig.orbitGapRandomMin;
    currentMinRadius = orbitalRadius + size / 2 + starSystemConfig.orbitTrailingGap;
    const orbitalPeriod =
      planetRandom() * (starSystemConfig.orbitalPeriodMax - starSystemConfig.orbitalPeriodMin) +
      starSystemConfig.orbitalPeriodMin;
    const inclination =
      planetRandom() * (starSystemConfig.inclinationRange * 2) - starSystemConfig.inclinationRange;
    const moonCount = Math.floor(planetRandom() * (starSystemConfig.moonCountMax + 1));

    const moons = Array.from({ length: moonCount }, (_, moonIndex) =>
      makeMoon(index * 10 + moonIndex, size, planetRandom)
    );

    const hasRings = planetRandom() > 1 - starSystemConfig.ringChance;
    const palette = ringPalettes[Math.floor(planetRandom() * ringPalettes.length)];
    const ringColor = palette.primary;
    const ringAccent = palette.accent;

    return {
      id: index,
      name: `${starNames[Math.floor(planetRandom() * starNames.length)]}-${index + 1}`,
      size,
      type,
      orbitalRadius,
      orbitalPeriod,
      orbitalSpeed: (Math.PI * 2) / orbitalPeriod,
      inclination,
      rotationSpeed: planetRandom() * (0.012 - 0.003) + 0.003,
      phase: planetRandom() * Math.PI * 2,
      seed: Math.floor(planetRandom() * 1000000),
      moons,
      hasRings,
      ringColor,
      ringAccent,
    };
  });

  const beltCount =
    starSystemConfig.asteroidBeltCountMin +
    Math.floor(
      worldRandom() * (starSystemConfig.asteroidBeltCountMax - starSystemConfig.asteroidBeltCountMin + 1)
    );
  const asteroidBelts = Array.from({ length: beltCount }, (_, index) =>
    makeAsteroidBelt(index, worldRandom)
  );

  return {
    seed: worldSystemSeed,
    star,
    planets,
    asteroidBelts,
  };
}

function distSq(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

export function generateGalaxy(worldSeed: string): { position: [number, number, number]; system: StarSystem }[] {
  const worldRandom = createPRNG(worldSeed);
  const systemCount =
    galaxyConfig.systemCountMin +
    Math.floor(worldRandom() * (galaxyConfig.systemCountMax - galaxyConfig.systemCountMin + 1));
  const spread = galaxyConfig.universeSpread;
  const minSep = galaxyConfig.minSystemSeparation;
  const minSepSq = minSep * minSep;
  const positions: [number, number, number][] = [[0, 0, 0]];

  for (let i = 1; i < systemCount; i++) {
    let position: [number, number, number] = [0, 0, 0];
    let placed = false;
    for (let attempt = 0; attempt < 48; attempt++) {
      const ring = Math.floor((i - 1) / 6) + 1;
      const slot = (i - 1) % 6;
      const ringCount = Math.ceil(systemCount / 6) + 1;
      const angle = (slot / 6) * Math.PI * 2 + worldRandom() * 0.4;
      const dist = ring * (spread / ringCount) * (0.65 + worldRandom() * 0.5);
      const candidate: [number, number, number] = [
        Math.cos(angle) * dist,
        (worldRandom() - 0.5) * spread * 0.12,
        Math.sin(angle) * dist,
      ];
      const ok = positions.every((p) => distSq(p, candidate) >= minSepSq);
      if (ok) {
        position = candidate;
        placed = true;
        break;
      }
    }
    if (!placed) {
      const angle = worldRandom() * Math.PI * 2;
      const dist = spread * (0.35 + worldRandom() * 0.45);
      position = [
        Math.cos(angle) * dist,
        (worldRandom() - 0.5) * spread * 0.1,
        Math.sin(angle) * dist,
      ];
    }
    positions.push(position);
  }

  return positions.map((position, i) => ({
    position,
    system: generateStarSystem(`${worldSeed}-sys-${i}`),
  }));
}
