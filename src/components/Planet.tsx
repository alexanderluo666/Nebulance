import { MeshProps } from "@react-three/fiber";

type Props = MeshProps & {
  size: number;
  color: string;
};

export default function Planet({ size, color, ...props }: Props) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
