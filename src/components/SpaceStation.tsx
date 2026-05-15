import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import type { SpaceStationData } from "../types/station";
import { stationConfig } from "../data/worldConfig";
import stationModelUrl from "../assets/International Space Station.glb?url";

useGLTF.preload(stationModelUrl);

type Props = {
  station: SpaceStationData;
};

export default function SpaceStation({ station }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(stationModelUrl);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={groupRef} position={station.position} rotation={station.rotation}>
      <primitive object={scene.clone()} scale={stationConfig.modelScale} />
      <pointLight color="#aaccff" intensity={0.4} distance={80} decay={2} />
    </group>
  );
}
