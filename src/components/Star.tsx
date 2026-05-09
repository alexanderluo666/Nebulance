import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import type { Star as StarType } from "../types/starSystem";

type Props = {
  star: StarType;
};

export default function Star({ star }: Props) {
  const starRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!starRef.current) return;
    starRef.current.rotation.y += 0.0015;
  });

  return (
    <>
      <pointLight color={star.color} intensity={star.intensity} distance={300} decay={2} />
      <mesh ref={starRef} position={star.position}>
        <sphereGeometry args={[star.radius, 32, 32]} />
        <meshBasicMaterial color={star.color} toneMapped={false} />
      </mesh>
      <mesh position={star.position}>
        <sphereGeometry args={[star.radius * 2.5, 32, 32]} />
        <meshBasicMaterial color={star.color} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </>
  );
}
