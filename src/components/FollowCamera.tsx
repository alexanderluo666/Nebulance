import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type Props = {
  target: React.RefObject<THREE.Object3D>;
};

export default function FollowCamera({ target }: Props) {
  const { camera } = useThree();

  const offset = useRef(new THREE.Vector3(0, 5, 12));

  useFrame(() => {
    if (!target.current) return;

    const shipPos = target.current.position;

    // camera follows behind ship
    const desiredPosition = new THREE.Vector3().copy(shipPos).add(offset.current);

    camera.position.lerp(desiredPosition, 0.08);
    camera.lookAt(shipPos);
  });

  return null;
}
