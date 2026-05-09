import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { hashString, mulberry32, range } from "../utils/seed";
import type { AsteroidBelt } from "../types/starSystem";
import asteroidUrl from "../assets/Asteroid.glb?url";

type BeltProps = {
  belt: AsteroidBelt;
  center: [number, number, number];
};

export default function Asteroid({ belt, center }: BeltProps) {
  const { scene } = useGLTF(asteroidUrl);
  const groupRef = useRef<THREE.Group>(null!);

  const asteroids = useMemo(() => {
    const rng = mulberry32(hashString(`asteroid-belt-${belt.id}`));
    return Array.from({ length: belt.count }, () => {
      const angle = range(rng, 0, Math.PI * 2);
      const radius = range(rng, belt.innerRadius, belt.outerRadius);
      const height = range(rng, -belt.height, belt.height);
      const scale = range(rng, 0.04, 0.16);
      return { angle, radius, height, scale };
    });
  }, [belt]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += belt.speed * delta;
  });

  return (
    <group ref={groupRef} position={new THREE.Vector3(center[0], center[1], center[2])}>
      {asteroids.map((asteroid, index) => (
        <primitive
          key={index}
          object={scene.clone(true)}
          position={new THREE.Vector3(
            Math.cos(asteroid.angle) * asteroid.radius,
            asteroid.height,
            Math.sin(asteroid.angle) * asteroid.radius
          )}
          scale={asteroid.scale}
        />
      ))}
    </group>
  );
}
