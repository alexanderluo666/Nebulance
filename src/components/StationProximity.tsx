import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { SpaceStationData, StationProximityState } from "../types/station";
import { stationConfig } from "../data/worldConfig";

type Props = {
  shipPos: React.RefObject<THREE.Vector3>;
  stations: SpaceStationData[];
  onChange: (state: StationProximityState) => void;
};

export default function StationProximity({ shipPos, stations, onChange }: Props) {
  const lastKey = useRef("");
  const shipVec = useRef(new THREE.Vector3());
  const stationVec = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!shipPos.current) return;
    shipVec.current.copy(shipPos.current);

    let nearest: SpaceStationData | null = null;
    let nearestDist = Infinity;

    for (const station of stations) {
      stationVec.current.set(station.position[0], station.position[1], station.position[2]);
      const d = shipVec.current.distanceTo(stationVec.current);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = station;
      }
    }

    const near = nearest !== null && nearestDist <= stationConfig.proximityRange;
    const key = `${near}-${near ? nearest!.id : ""}`;
    if (key !== lastKey.current) {
      lastKey.current = key;
      onChange({ near, station: near ? nearest : null, distance: nearestDist });
    }
  });

  return null;
}
