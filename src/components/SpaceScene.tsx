import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

type PlanetProps = {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
};

function Planet({ position, size, color, speed }: PlanetProps) {
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

export default function SpaceScene() {
  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 75 }}>
      <ambientLight intensity={1.5} />

      <pointLight position={[10, 10, 10]} intensity={2} />

      <Planet
        position={[0, 0, 0]}
        size={2}
        color="orange"
        speed={0.003}
      />

      <Planet
        position={[5, 0, -3]}
        size={1}
        color="skyblue"
        speed={0.01}
      />

      <Planet
        position={[-6, 1, -5]}
        size={1.5}
        color="purple"
        speed={0.005}
      />

      <OrbitControls />
    </Canvas>
  );
}
