import * as THREE from "three";

type PlanetRingsProps = {
  size: number;
  ringColor: string;
  ringAccent?: string;
};

export default function PlanetRings({ size, ringColor, ringAccent = "#ffffff" }: PlanetRingsProps) {
  const tilt = Math.PI / 2 + 0.18;
  return (
    <group rotation={[tilt, 0.12, 0.04]}>
      <mesh>
        <ringGeometry args={[size * 1.45, size * 2.05, 128]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, 0.08, 0]}>
        <ringGeometry args={[size * 1.58, size * 2.18, 128]} />
        <meshBasicMaterial
          color={ringAccent}
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, -0.05, 0]}>
        <ringGeometry args={[size * 1.72, size * 2.35, 96]} />
        <meshBasicMaterial
          color={ringColor}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
