import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import asteroidUrl from "../assets/Asteroid.glb?url";

type AsteroidProps = {
  orbitRadius: number;
  height: number;
  initialAngle: number;
  orbitSpeed: number;
  scale: number;
};

export default function Asteroid({ orbitRadius, height, initialAngle, orbitSpeed, scale }: AsteroidProps) {
  const { scene } = useGLTF(asteroidUrl);
  const groupRef = useRef<THREE.Group>(null!);
  const angle = useRef(initialAngle);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    angle.current += orbitSpeed * delta;
    groupRef.current.position.set(
      Math.cos(angle.current) * orbitRadius,
      height,
      Math.sin(angle.current) * orbitRadius
    );
    groupRef.current.rotation.x += 0.01;
    groupRef.current.rotation.y += 0.007;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} />
    </group>
  );
}
