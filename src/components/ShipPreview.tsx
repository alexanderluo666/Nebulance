import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import type { ShipId } from "../data/ships";
import { getShipDefinition, shipCatalog } from "../data/ships";

for (const ship of shipCatalog) {
  useGLTF.preload(ship.url);
}

function PreviewModel({ shipId }: { shipId: ShipId }) {
  const def = getShipDefinition(shipId);
  const { scene } = useGLTF(def.url);
  return <primitive object={scene.clone()} scale={def.previewScale} rotation={[0, Math.PI, 0]} />;
}

type Props = {
  shipId: ShipId;
  width?: number;
  height?: number;
};

export default function ShipPreview({ shipId, width = 200, height = 130 }: Props) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(0,255,255,0.25)",
        background: "radial-gradient(circle at 50% 40%, #0a1830 0%, #020408 100%)",
      }}
    >
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} />
        <Suspense fallback={null}>
          <PreviewModel shipId={shipId} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}
