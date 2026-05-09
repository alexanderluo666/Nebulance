import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import Ship from "./Ship";
import Planet from "./Planet";
import Asteroid from "./Asteroid";

type PlanetType =
  | "Desert"
  | "Ice"
  | "Ocean"
  | "Lava"
  | "Gas giant"
  | "Dead moon"
  | "Forest"
  | "Toxic";

type PlanetData = {
  position: [number, number, number];
  size: number;
  type: PlanetType;
  rotationSpeed: number;
  moons: Array<{
    size: number;
    distance: number;
    speed: number;
    color: string;
    initialAngle: number;
  }>;
  seed: number;
};

type AsteroidData = {
  orbitRadius: number;
  height: number;
  initialAngle: number;
  orbitSpeed: number;
  scale: number;
};

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

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function SpaceScene() {
  const shipPos = useRef(new THREE.Vector3(0, 0, 0));
  const shipRot = useRef(new THREE.Euler(0, 0, 0));

  const planets = useMemo<PlanetData[]>(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
      const size = randomRange(6, 16);
      const angle = (index / 6) * Math.PI * 2;
      const radius = randomRange(35, 120);
      const y = randomRange(-10, 15);
      const moonCount = Math.floor(randomRange(0, 3));

      return {
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius * 1.1],
        size,
        type,
        rotationSpeed: randomRange(0.002, 0.008),
        moons: Array.from({ length: moonCount }, () => ({
          size: randomRange(0.8, 2.2),
          distance: randomRange(size * 1.6, size * 3.3),
          speed: randomRange(0.2, 0.65),
          color: "#d5d5d5",
          initialAngle: Math.random() * Math.PI * 2,
        })),
        seed: Math.random() * 1000,
      };
    });
  }, []);

  const asteroids = useMemo<AsteroidData[]>(() => {
    return Array.from({ length: 60 }, () => ({
      orbitRadius: randomRange(45, 240),
      height: randomRange(-25, 25),
      initialAngle: Math.random() * Math.PI * 2,
      orbitSpeed: randomRange(0.02, 0.09) * (Math.random() > 0.5 ? 1 : -1),
      scale: randomRange(0.04, 0.18),
    }));
  }, []);

  return (
    <Canvas camera={{ position: [0, 8, 18], fov: 60 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[40, 40, 20]} intensity={1.2} />
      <directionalLight position={[-30, 15, -60]} intensity={0.8} />

      <Stars radius={350} depth={150} count={15000} factor={8} fade speed={0.4} />

      <mesh position={[130, 60, -220]}>
        <sphereGeometry args={[55, 32, 32]} />
        <meshBasicMaterial color="#ff8a65" transparent opacity={0.1} />
      </mesh>
      <mesh position={[-170, -40, -320]}>
        <sphereGeometry args={[75, 32, 32]} />
        <meshBasicMaterial color="#ba68c8" transparent opacity={0.08} />
      </mesh>
      <mesh position={[210, -90, -420]}>
        <sphereGeometry args={[65, 32, 32]} />
        <meshBasicMaterial color="#81c784" transparent opacity={0.05} />
      </mesh>

      <Ship position={shipPos} rotation={shipRot} />

      {planets.map((planet, idx) => (
        <Planet key={idx} position={planet.position} size={planet.size} type={planet.type} rotationSpeed={planet.rotationSpeed} moons={planet.moons} seed={planet.seed} />
      ))}

      {asteroids.map((asteroid, idx) => (
        <Asteroid key={idx} orbitRadius={asteroid.orbitRadius} height={asteroid.height} initialAngle={asteroid.initialAngle} orbitSpeed={asteroid.orbitSpeed} scale={asteroid.scale} />
      ))}
    </Canvas>
  );
}
