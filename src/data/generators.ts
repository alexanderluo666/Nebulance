import type { Planet } from "../types/planet";

const names = [
  "Aether",
  "Nova",
  "Vortex",
  "Orion",
  "Zephos",
  "Eclipse",
  "Titan",
  "Nyx",
];

const colors = [
  "#4fc3f7",
  "#81c784",
  "#ff8a65",
  "#ba68c8",
  "#ffd54f",
];

export function generatePlanets(count: number): Planet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: names[Math.floor(Math.random() * names.length)] + "-" + i,
    size: Math.random() * 1.5 + 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    orbitRadius: i * 4 + 4,
  }));
}
