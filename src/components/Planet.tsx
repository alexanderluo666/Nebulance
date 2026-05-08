import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type PlanetProps = {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
};

export default function Planet({
  position,
  size,
  color,
  speed,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += speed;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
