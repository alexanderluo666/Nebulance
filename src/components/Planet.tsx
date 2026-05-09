import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type PlanetType =
  | "Desert"
  | "Ice"
  | "Ocean"
  | "Lava"
  | "Gas giant"
  | "Dead moon"
  | "Forest"
  | "Toxic";

type MoonData = {
  size: number;
  distance: number;
  speed: number;
  color: string;
  initialAngle: number;
};

type PlanetProps = {
  position: [number, number, number];
  size: number;
  type: PlanetType;
  rotationSpeed: number;
  moons: MoonData[];
  seed: number;
};

const typeConfig: Record<PlanetType, { color: string; atmosphere: string; roughness: number; metalness: number; terrain: number; emissive: string }> = {
  Desert: { color: "#d9b27c", atmosphere: "#f4d5a2", roughness: 0.8, metalness: 0.05, terrain: 0.18, emissive: "#000000" },
  Ice: { color: "#cce7ff", atmosphere: "#9dd7ff", roughness: 0.6, metalness: 0.03, terrain: 0.08, emissive: "#bfe8ff" },
  Ocean: { color: "#1a66cc", atmosphere: "#72b1ff", roughness: 0.3, metalness: 0.1, terrain: 0.05, emissive: "#3465ff" },
  Lava: { color: "#ff533a", atmosphere: "#ffb57a", roughness: 0.9, metalness: 0.15, terrain: 0.3, emissive: "#bb2200" },
  "Gas giant": { color: "#d8a84e", atmosphere: "#ffe4aa", roughness: 0.4, metalness: 0.05, terrain: 0.1, emissive: "#f6d68b" },
  "Dead moon": { color: "#8b8b8b", atmosphere: "#cccccc", roughness: 1.0, metalness: 0.0, terrain: 0.12, emissive: "#444444" },
  Forest: { color: "#197d3b", atmosphere: "#72c96b", roughness: 0.8, metalness: 0.05, terrain: 0.16, emissive: "#1f3f1e" },
  Toxic: { color: "#76ff03", atmosphere: "#b8ff59", roughness: 0.7, metalness: 0.02, terrain: 0.22, emissive: "#5dd300" },
};

function noise(seed: number) {
  return Math.sin(seed * 12.9898) * 43758.5453 - Math.floor(Math.sin(seed * 12.9898) * 43758.5453);
}

function createTerrainGeometry(size: number, type: PlanetType, seed: number) {
  const geometry = new THREE.SphereGeometry(size, 64, 64);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();
  const config = typeConfig[type];

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const normal = vertex.clone().normalize();
    const variation = Math.sin(normal.x * 8 + normal.y * 6 + normal.z * 10 + seed) * 0.5;
    const detail = Math.sin(normal.x * 15 + normal.y * 9 + normal.z * 12 - seed * 0.7) * 0.25;
    const random = noise((normal.x + normal.y + normal.z) * 10 + seed) * 0.35;
    const displacement = (variation + detail + random) * config.terrain * size * 0.15;
    const radius = size + displacement;
    vertex.normalize().multiplyScalar(radius);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

function Moon({ parentPosition, moon }: { parentPosition: [number, number, number]; moon: MoonData }) {
  const ref = useRef<THREE.Mesh>(null!);
  const angle = useRef(moon.initialAngle);

  useFrame((_, delta) => {
    if (!ref.current) return;

    angle.current += moon.speed * delta;
    ref.current.position.set(
      parentPosition[0] + Math.cos(angle.current) * moon.distance,
      parentPosition[1] + moon.distance * 0.18,
      parentPosition[2] + Math.sin(angle.current) * moon.distance
    );
    ref.current.rotation.y += 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[moon.size, 16, 16]} />
      <meshStandardMaterial color={moon.color} roughness={1} metalness={0.02} />
    </mesh>
  );
}

export default function Planet({ position, size, type, rotationSpeed, moons, seed }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => createTerrainGeometry(size, type, seed), [size, type, seed]);
  const config = typeConfig[type];

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += rotationSpeed;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={config.color} roughness={config.roughness} metalness={config.metalness} emissive={config.emissive} />
      </mesh>
      <mesh geometry={geometry.clone()} scale={1.08}>
        <meshBasicMaterial color={config.atmosphere} transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      {moons.map((moon, index) => (
        <Moon key={index} parentPosition={position} moon={moon} />
      ))}
    </group>
  );
}
