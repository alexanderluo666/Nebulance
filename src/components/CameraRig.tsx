import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig({ target }: { target: React.RefObject<THREE.Object3D> }) {
  const { camera } = useThree();
  const offset = useRef(new THREE.Vector3(0, 3, 10));

  useFrame(() => {
    if (!target.current) return;

    const desiredPosition = target.current.position.clone().add(offset.current);

    camera.position.lerp(desiredPosition, 0.08);
    camera.lookAt(target.current.position);
  });

  return null;
}
