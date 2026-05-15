import type { SpaceStationData } from "../types/station";

type Props = {
  station: SpaceStationData | null;
  visible: boolean;
};

export default function StationPrompt({ station, visible }: Props) {
  if (!visible || !station) return null;

  const outer: React.CSSProperties = {
    position: "absolute",
    top: "38%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 25,
    pointerEvents: "none",
    fontFamily: "monospace",
    textAlign: "center",
    animation: "stationPromptIn 0.45s ease-out",
  };

  const card: React.CSSProperties = {
    padding: "14px 28px",
    background: "rgba(4, 12, 24, 0.88)",
    border: "1px solid rgba(0, 255, 255, 0.5)",
    borderRadius: "8px",
    boxShadow: "0 0 24px rgba(0, 255, 255, 0.15)",
  };

  const title: React.CSSProperties = {
    color: "#00ffff",
    fontSize: "18px",
    letterSpacing: "4px",
    marginBottom: "8px",
    textShadow: "0 0 12px rgba(0,255,255,0.4)",
  };

  return (
    <>
      <div style={outer}>
        <div style={card}>
          <div style={title}>SPACE STATION</div>
          <div style={{ color: "#aabbcc", fontSize: "12px", marginBottom: "6px" }}>{station.name}</div>
          <div style={{ color: "#88ffcc", fontSize: "13px", letterSpacing: "2px" }}>
            Press <span style={{ color: "#00ffff", fontWeight: "bold" }}>E</span> to dock and resupply
          </div>
        </div>
      </div>
      <style>{`
        @keyframes stationPromptIn {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
