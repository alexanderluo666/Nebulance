export type StarType = "Red Dwarf" | "Yellow Star" | "Blue Giant" | "White Star" | "Orange Star";

export type PlanetType =
  | "Desert"
  | "Ice"
  | "Ocean"
  | "Lava"
  | "Gas giant"
  | "Dead moon"
  | "Forest"
  | "Toxic";

export type Moon = {
  id: number;
  name: string;
  size: number;
  orbitalRadius: number;
  orbitalPeriod: number;
  inclination: number;
  color: string;
  phase: number;
};

export type Planet = {
  id: number;
  name: string;
  size: number;
  type: PlanetType;
  orbitalRadius: number;
  orbitalPeriod: number;
  orbitalSpeed: number;
  inclination: number;
  rotationSpeed: number;
  phase: number;
  seed: number;
  moons: Moon[];
};

export type AsteroidBelt = {
  id: number;
  innerRadius: number;
  outerRadius: number;
  count: number;
  height: number;
  speed: number;
};

export type Star = {
  name: string;
  type: StarType;
  color: string;
  radius: number;
  intensity: number;
  position: [number, number, number];
};

export type StarSystem = {
  seed: string;
  star: Star;
  planets: Planet[];
  asteroidBelts: AsteroidBelt[];
};

const starTypes: Array<{ type: StarType; color: string; radius: number; intensity: number }> = [
  { type: "Red Dwarf", color: "#ff9966", radius: 4.5, intensity: 1.8 },
  { type: "Yellow Star", color: "#fff3b0", radius: 6.8, intensity: 2.4 },
  { type: "Blue Giant", color: "#89d5ff", radius: 9.2, intensity: 3.6 },
  { type: "White Star", color: "#ffffff", radius: 7.6, intensity: 2.8 },
  { type: "Orange Star", color: "#ffb74d", radius: 6.2, intensity: 2.2 },
];

const planetTypes: PlanetType[] = [
  "Desert",
  "Ice",
  "Ocean",
  "Lava",
  "Gas giant",
  "Dead moon",
  "Forest",
  "Toxic",
];

const starNames = ["Aether", "Nova", "Vortex", "Orion", "Zephos", "Eclipse", "Titan", "Nyx"];

function makeMoon(id: number, planetSize: number): Moon {
  return {
    id,
    name: `${starNames[Math.floor(Math.random() * starNames.length)]}-Moon-${id}`,
    size: Math.random() * (5 - 1) + 1,
    orbitalRadius: Math.random() * (planetSize * 2.8 - planetSize * 1.4) + planetSize * 1.4,
    orbitalPeriod: Math.random() * (18 - 6) + 6,
    inclination: Math.random() * (0.18 - (-0.18)) + (-0.18),
    color: "#d5d5d5",
    phase: Math.random() * (Math.PI * 2 - 0) + 0,
  };
}

function makeAsteroidBelt(id: number): AsteroidBelt {
  const innerRadius = Math.random() * (48 - 24) + 24;
  const thickness = Math.random() * (16 - 6) + 6;
  return {
    id,
    innerRadius,
    outerRadius: innerRadius + thickness,
    count: Math.floor(Math.random() * (44 - 24) + 24),
    height: Math.random() * (14 - (-14)) + (-14),
    speed: Math.random() * (0.014 - 0.005) + 0.005,
  };
}

export function generateStarSystem(): StarSystem {
  const starIndex = Math.floor(Math.random() * starTypes.length);
  const starConfig = starTypes[starIndex];
  const star: Star = {
    name: `${starNames[Math.floor(Math.random() * starNames.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    type: starConfig.type,
    color: starConfig.color,
    radius: starConfig.radius,
    intensity: starConfig.intensity,
    position: [0, 0, 0],
  };

  const planetCount = Math.max(3, Math.floor(Math.random() * 5) + 3);
  let currentMinRadius = 18;
  const planets = Array.from({ length: planetCount }, (_, index) => {
    const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
    const size = Math.random() * (40 - 10) + 10;
    const orbitalRadius = currentMinRadius + size / 2 + Math.random() * 15 + 10; // spacing
    currentMinRadius = orbitalRadius + size / 2 + 15; // update min for next
    const orbitalPeriod = Math.random() * (110 - 22) + 22;
    const inclination = Math.random() * (0.18 - (-0.18)) + (-0.18);
    const moonCount = Math.floor(Math.random() * 3);

    const moons = Array.from({ length: moonCount }, (_, moonIndex) =>
      makeMoon(index * 10 + moonIndex, size)
    );

    return {
      id: index,
      name: `${starNames[Math.floor(Math.random() * starNames.length)]}-${index + 1}`,
      size,
      type,
      orbitalRadius,
      orbitalPeriod,
      orbitalSpeed: (Math.PI * 2) / orbitalPeriod,
      inclination,
      rotationSpeed: Math.random() * (0.012 - 0.003) + 0.003,
      phase: Math.random() * (Math.PI * 2 - 0) + 0,
      seed: Math.floor(Math.random() * 1000000),
      moons,
    };
  });

  const asteroidBelts = Array.from({ length: Math.max(1, Math.floor(Math.random() * 2)) }, (_, index) =>
    makeAsteroidBelt(index)
  );

  return {
    seed: Math.random().toString(36).substring(2, 15),
    star,
    planets,
    asteroidBelts,
  };
}

export function generateGalaxy(): { position: [number, number, number]; system: StarSystem }[] {
  const systemCount = 10 + Math.floor(Math.random() * 10); // 10-20 systems
  return Array.from({ length: systemCount }, () => {
    const position: [number, number, number] = [
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
    ];
    return { position, system: generateStarSystem() };
  });
}
