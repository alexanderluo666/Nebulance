import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import spaceshipUrl from "../assets/Spaceship.glb?url";

type InputKeys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  q: boolean;
  e: boolean;
  shift: boolean;
  left: boolean;
  right: boolean;
};

function CameraController({ ship, rotation }: { ship: React.RefObject<THREE.Object3D>; rotation: React.RefObject<THREE.Euler> }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!ship.current || !rotation.current) return;

    const offset = new THREE.Vector3(0, 2, 10);
    offset.applyEuler(rotation.current);

    const targetPos = new THREE.Vector3().copy(ship.current.position).add(offset);

    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(ship.current.position);
  });

  return null;
}

export default function Ship({ position, rotation }: { position: React.RefObject<THREE.Vector3>; rotation: React.RefObject<THREE.Euler> }) {
  const ref = useRef<THREE.Object3D>(null!);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const tempAccel = useRef(new THREE.Vector3(0, 0, 0));
  const keys = useRef<InputKeys>({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    shift: false,
    left: false,
    right: false,
  });

  const mouseSensitivity = 0.002;
  const [mouseDeltaX, setMouseDeltaX] = useState(0);
  const [mouseDeltaY, setMouseDeltaY] = useState(0);

  const { scene } = useGLTF(spaceshipUrl);

  useEffect(() => {
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;

    const down = (e: KeyboardEvent) => {
      if (e.key === "w") keys.current.w = true;
      if (e.key === "s") keys.current.s = true;
      if (e.key === "a") keys.current.a = true;
      if (e.key === "d") keys.current.d = true;
      if (e.key === "q") keys.current.q = true;
      if (e.key === "e") keys.current.e = true;

      if (e.key === "Shift") keys.current.shift = true;

      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };

    const up = (e: KeyboardEvent) => {
      if (e.key === "w") keys.current.w = false;
      if (e.key === "s") keys.current.s = false;
      if (e.key === "a") keys.current.a = false;
      if (e.key === "d") keys.current.d = false;
      if (e.key === "q") keys.current.q = false;
      if (e.key === "e") keys.current.e = false;

      if (e.key === "Shift") keys.current.shift = false;

      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };

    const move = (e: MouseEvent) => {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      setMouseDeltaX(deltaX);
      setMouseDeltaY(deltaY);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || !position.current || !rotation.current) return;

    const accelerationStrength = 0.012;
    const maxSpeed = keys.current.shift ? 1.2 : 0.55;
    const rollSpeed = 0.06;

    rotation.current.y -= mouseDeltaX * mouseSensitivity;
    rotation.current.x -= mouseDeltaY * mouseSensitivity;
    rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));

    setMouseDeltaX(0);
    setMouseDeltaY(0);

    if (keys.current.left) {
      rotation.current.z += rollSpeed;
    } else if (keys.current.right) {
      rotation.current.z -= rollSpeed;
    } else {
      rotation.current.z *= 0.96;
    }

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(rotation.current);
    const right = new THREE.Vector3(1, 0, 0).applyEuler(rotation.current);
    const up = new THREE.Vector3(0, 1, 0);

    tempAccel.current.set(0, 0, 0);
    if (keys.current.w) tempAccel.current.add(forward);
    if (keys.current.s) tempAccel.current.addScaledVector(forward, -1);
    if (keys.current.a) tempAccel.current.addScaledVector(right, -1);
    if (keys.current.d) tempAccel.current.add(right);
    if (keys.current.q) tempAccel.current.add(up);
    if (keys.current.e) tempAccel.current.addScaledVector(up, -1);

    if (tempAccel.current.lengthSq() > 0) {
      tempAccel.current.normalize().multiplyScalar(accelerationStrength);
      velocity.current.addScaledVector(tempAccel.current, delta * 60);
    }

    velocity.current.multiplyScalar(0.98);
    if (velocity.current.length() > maxSpeed) {
      velocity.current.setLength(maxSpeed);
    }

    position.current.addScaledVector(velocity.current, delta * 60);
    ref.current.position.copy(position.current);
    ref.current.rotation.copy(rotation.current);
  });

  return (
    <>
      <primitive ref={ref} object={scene} scale={0.1} />
      <CameraController ship={ref} rotation={rotation} />
    </>
  );
}
