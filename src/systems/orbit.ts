import * as THREE from "three";

export function computeOrbitPosition(
  center: [number, number, number],
  radius: number,
  phase: number,
  inclination: number
): THREE.Vector3 {
  const position = new THREE.Vector3(
    Math.cos(phase) * radius,
    0,
    Math.sin(phase) * radius
  );
  position.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
  return position.add(new THREE.Vector3(center[0], center[1], center[2]));
}
