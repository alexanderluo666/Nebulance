import * as THREE from "three";

type StarCoronaProps = {
  radius: number;
  color: string;
};

/** Minimal halo — avoids heavy ring geometry and additive overdraw. */
export default function StarCorona({ radius, color }: StarCoronaProps) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.35, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.035}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
