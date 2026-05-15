import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Ship from "./Ship";
import Planet from "./Planet";
import Star from "./Star";
import Asteroid from "./Asteroid";
import { generateGalaxy } from "../generators/starSystem";
import { generateStations } from "../generators/stations";
import { backgroundStarsConfig, sceneScaleConfig } from "../data/worldConfig";
import { gameAudio } from "../systems/audio";
import SpaceStation from "./SpaceStation";
import StationProximity from "./StationProximity";
import type { StationProximityState } from "../types/station";

function GalaxyFog({ seed }: { seed: string }) {
  const fogTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const numSeed = useMemo(() => seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [seed]);

  const colors = ["#5511aa", "#1188aa", "#770088", "#0099aa", "#440077"];
  const fogCount = 6;
  const scale = sceneScaleConfig.galaxyFogScale;

  const random = (s: number) => {
    return Math.sin(s * 12.9898) * 43758.5453 - Math.floor(Math.sin(s * 12.9898) * 43758.5453);
  };

  return (
    <group>
      {Array.from({ length: fogCount }).map((_, i) => {
        const x = (random(numSeed + i * 1.1) - 0.5) * scale * 0.5;
        const y = (random(numSeed + i * 1.2) - 0.5) * scale * 0.2;
        const z = (random(numSeed + i * 1.3) - 0.5) * scale * 0.5;
        const s = scale * (0.6 + random(numSeed + i * 1.4) * 0.4);
        const spriteColor = colors[(numSeed + i) % colors.length];
        return (
          <sprite key={i} position={[x, y, z]} scale={[s, s, 1]}>
            <spriteMaterial map={fogTexture} color={spriteColor} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.6} />
          </sprite>
        );
      })}
    </group>
  );
}

export default function SpaceScene({
  worldSeed,
  dockOpen = false,
  onStationProximityChange,
}: {
  worldSeed: string;
  dockOpen?: boolean;
  onStationProximityChange?: (state: StationProximityState) => void;
}) {
  const savedPos = localStorage.getItem("nebulance_shipPos");
  const savedRot = localStorage.getItem("nebulance_shipRot");

  const parsedPos = savedPos ? JSON.parse(savedPos) : { x: 0, y: 80, z: 220 };
  const distFromHome = Math.hypot(parsedPos.x, parsedPos.y, parsedPos.z);
  // Saved positions in deep space are reset near the origin galaxy.
  const initialPos = distFromHome > 4000 ? { x: 0, y: 80, z: 220 } : parsedPos;
  const initialRot = savedRot ? JSON.parse(savedRot) : { _x: 0, _y: 0, _z: 0 };

  const shipPos = useRef(new THREE.Vector3(initialPos.x, initialPos.y, initialPos.z));
  const shipRot = useRef(new THREE.Euler(initialRot._x, initialRot._y, initialRot._z));

  const galaxy = useMemo(() => generateGalaxy(worldSeed), [worldSeed]);
  const stations = useMemo(() => generateStations(worldSeed), [worldSeed]);

  useEffect(() => {
    gameAudio.start();
    return () => gameAudio.stop();
  }, []);

  return (
    <Canvas camera={{ position: [0, 18, 42], fov: 60, far: sceneScaleConfig.cameraFar }}>
      <fog attach="fog" args={["#030308", sceneScaleConfig.fogNear, sceneScaleConfig.fogFar]} />
      <ambientLight intensity={sceneScaleConfig.ambientLightIntensity} />
      <hemisphereLight color="#a8b8ff" groundColor="#1a1020" intensity={0.35} />
      <directionalLight position={[40, 40, 20]} intensity={1.4} />
      <directionalLight position={[-30, 15, -60]} intensity={0.9} />

      <Stars
        radius={backgroundStarsConfig.radius}
        depth={backgroundStarsConfig.depth}
        count={backgroundStarsConfig.count}
        factor={backgroundStarsConfig.factor}
        saturation={backgroundStarsConfig.saturation}
        fade={backgroundStarsConfig.fade}
        speed={backgroundStarsConfig.speed}
      />

      {galaxy.map((item) => (
        <group key={item.system.seed} position={item.position}>
          <GalaxyFog seed={item.system.seed} />
          <Star star={item.system.star} systemPosition={item.position} />
          {item.system.planets.map((planet) => (
            <Planet key={planet.id} planet={planet} center={[0, 0, 0]} systemPosition={item.position} />
          ))}
          {item.system.asteroidBelts.map((belt) => (
            <Asteroid key={belt.id} belt={belt} center={[0, 0, 0]} />
          ))}
        </group>
      ))}

      {stations.map((station) => (
        <SpaceStation key={station.id} station={station} />
      ))}

      {onStationProximityChange && (
        <StationProximity shipPos={shipPos} stations={stations} onChange={onStationProximityChange} />
      )}

      <Ship position={shipPos} rotation={shipRot} controlsPaused={dockOpen} />
    </Canvas>
  );
}
