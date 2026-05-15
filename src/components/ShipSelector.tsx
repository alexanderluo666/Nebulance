import type { ShipId } from "../data/ships";
import { shipCatalog } from "../data/ships";
import ShipPreview from "./ShipPreview";

type Props = {
  selectedId: ShipId;
  onSelect: (id: ShipId) => void;
  compact?: boolean;
};

export default function ShipSelector({ selectedId, onSelect, compact = false }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <h3
        style={{
          margin: compact ? "0 0 10px" : "0 0 12px",
          color: "#00ffff",
          fontSize: "14px",
          letterSpacing: "3px",
          textAlign: "center",
        }}
      >
        SELECT SPACESHIP
      </h3>
      <p
        style={{
          margin: "0 0 16px",
          color: "#8899aa",
          fontSize: "12px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Basic hulls only — drag to rotate preview
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {shipCatalog.map((ship) => {
          const active = ship.id === selectedId;
          return (
            <button
              key={ship.id}
              type="button"
              onClick={() => onSelect(ship.id)}
              style={{
                padding: "12px",
                width: compact ? "min(220px, 44vw)" : "min(240px, 88vw)",
                background: active ? "rgba(0,255,255,0.12)" : "rgba(0,0,0,0.35)",
                border: active ? "2px solid #00ffff" : "1px solid rgba(0,255,255,0.25)",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#e8f4ff",
                fontFamily: "monospace",
                boxShadow: active ? "0 0 20px rgba(0,255,255,0.2)" : "none",
              }}
            >
              <ShipPreview shipId={ship.id} width={compact ? 180 : 200} height={compact ? 110 : 130} />
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "14px",
                  letterSpacing: "2px",
                  color: active ? "#00ffff" : "#ccddee",
                }}
              >
                {ship.label}
              </div>
              <div style={{ marginTop: "4px", fontSize: "11px", color: "#8899aa" }}>{ship.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
