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
  hasRings: boolean;
  ringColor: string;
  ringAccent?: string;
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
