import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import Ship from "./Ship";
import Planet from "./Planet";
import Star from "./Star";
import Asteroid from "./Asteroid";
import { generateGalaxy } from "../types/starSystem";

export default function SpaceScene() {
  const shipPos = useRef(new THREE.Vector3(0, 8, 28));
  const shipRot = useRef(new THREE.Euler(0, 0, 0));

  const galaxy = useMemo(() => generateGalaxy(), []);

  return (
    <Canvas camera={{ position: [0, 18, 42], fov: 60 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[40, 40, 20]} intensity={1.2} />
      <directionalLight position={[-30, 15, -60]} intensity={0.8} />

      <Stars radius={350} depth={150} count={15000} factor={8} fade speed={0.4} />

      {galaxy.map((item) => (
        <group key={item.system.seed} position={item.position}>
          <Star star={item.system.star} />
          {item.system.planets.map((planet) => (
            <Planet key={planet.id} planet={planet} center={[0, 0, 0]} />
          ))}
          {item.system.asteroidBelts.map((belt) => (
            <Asteroid key={belt.id} belt={belt} center={[0, 0, 0]} />
          ))}
        </group>
      ))}

      <Ship position={shipPos} rotation={shipRot} />
    </Canvas>
  );
}
