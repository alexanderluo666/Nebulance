import type { ShipId } from "../data/ships";
import ShipSelector from "./ShipSelector";

type Props = {
  homeStationName: string;
  selectedShipId: ShipId;
  onSelectShip: (id: ShipId) => void;
  onLaunch: () => void;
};

const panel: React.CSSProperties = {
  maxWidth: "560px",
  width: "92vw",
  maxHeight: "85vh",
  overflow: "auto",
  padding: "28px 32px",
  background: "rgba(4, 12, 24, 0.95)",
  border: "2px solid #00ffff",
  borderRadius: "10px",
  boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)",
  fontFamily: "monospace",
  color: "#e8f4ff",
};

const sectionTitle: React.CSSProperties = {
  color: "#00ffff",
  fontSize: "14px",
  letterSpacing: "3px",
  margin: "0 0 12px",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  padding: "6px 0",
  fontSize: "13px",
  borderBottom: "1px solid rgba(0,255,255,0.1)",
};

export default function GuideMenu({ homeStationName, selectedShipId, onSelectShip, onLaunch }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle, #0b1a2e 0%, #000000 100%)",
      }}
    >
      <div style={panel}>
        <h2 style={{ margin: "0 0 8px", color: "#00ffff", fontSize: "1.75rem", letterSpacing: "4px" }}>
          PILOT GUIDE
        </h2>
        <p style={{ margin: "0 0 24px", color: "#8899aa", fontSize: "13px" }}>
          Welcome to Nebulance. Review controls, then launch toward your nearest station.
        </p>

        <h3 style={sectionTitle}>CONTROLS</h3>
        <div style={{ marginBottom: "24px" }}>
          {[
            ["W / S", "Thrust forward / backward"],
            ["A / D", "Strafe left / right"],
            ["↑ / ↓", "Pitch up / down"],
            ["← / →", "Turn left / right"],
            ["Z / C", "Roll left / right"],
            ["Shift", "Boost (uses energy)"],
            ["Space", "Fire laser"],
            ["E", "Dock / inventory (near station)"],
            ["ESC", "Pause / quit menu"],
          ].map(([key, desc]) => (
            <div key={key} style={row}>
              <span style={{ color: "#00ffff", minWidth: "72px" }}>{key}</span>
              <span style={{ color: "#aabbcc", textAlign: "right" }}>{desc}</span>
            </div>
          ))}
        </div>

        <h3 style={sectionTitle}>FIRST MISSION</h3>
        <p style={{ margin: "0 0 12px", fontSize: "13px", lineHeight: 1.6, color: "#ccddee" }}>
          A <strong style={{ color: "#00ffff" }}>Space Station</strong> ({homeStationName}) is nearby and
          visible from spawn. Fly toward it, then press <strong style={{ color: "#00ffff" }}>E</strong> to
          dock and resupply fuel.
        </p>
        <ul style={{ margin: "0 0 24px", paddingLeft: "20px", fontSize: "13px", color: "#aabbcc", lineHeight: 1.7 }}>
          <li>Look for the ISS structure ahead of you at launch</li>
          <li>Dock to refill boost energy and collect fuel cells</li>
          <li>Explore star systems beyond the station when ready</li>
        </ul>

        <div style={{ marginBottom: "24px" }}>
          <ShipSelector selectedId={selectedShipId} onSelect={onSelectShip} compact />
        </div>

        <button
          type="button"
          onClick={onLaunch}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
            letterSpacing: "4px",
            textTransform: "uppercase",
            background: "rgba(0,255,255,0.2)",
            border: "2px solid #00ffff",
            color: "#00ffff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Launch
        </button>
      </div>
    </div>
  );
}
