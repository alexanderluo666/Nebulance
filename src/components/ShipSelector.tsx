import type { ShipId } from "../data/ships";
import {
  premiumShipCatalog,
  starterShipCatalog,
  shipCatalog,
  getShipDefinition,
} from "../data/ships";
import { formatPrice } from "../data/economy";
import ShipPreview from "./ShipPreview";

type Props = {
  selectedId: ShipId;
  onSelect: (id: ShipId) => void;
  compact?: boolean;
  /** When true, shows premium hulls with lock/price (space station hangar only). */
  hangar?: boolean;
  ownedShipIds?: ShipId[];
  balance?: number;
  onPurchase?: (id: ShipId) => void;
};

function LockBadge({ price }: { price: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(2, 6, 14, 0.72)",
        borderRadius: "8px",
        gap: "6px",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: "28px", lineHeight: 1 }}>🔒</span>
      <span
        style={{
          fontSize: "13px",
          letterSpacing: "2px",
          color: "#ffcc66",
          fontWeight: "bold",
        }}
      >
        {formatPrice(price)}
      </span>
    </div>
  );
}

function ShipCard({
  ship,
  active,
  locked,
  compact,
  canAfford,
  onActivate,
}: {
  ship: ReturnType<typeof getShipDefinition>;
  active: boolean;
  locked: boolean;
  compact: boolean;
  canAfford: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={locked && !canAfford}
      style={{
        position: "relative",
        padding: "12px",
        width: compact ? "min(220px, 44vw)" : "min(240px, 88vw)",
        background: active ? "rgba(0,255,255,0.12)" : "rgba(0,0,0,0.35)",
        border: active ? "2px solid #00ffff" : locked ? "1px solid rgba(255,200,80,0.35)" : "1px solid rgba(0,255,255,0.25)",
        borderRadius: "10px",
        cursor: locked ? (canAfford ? "pointer" : "not-allowed") : "pointer",
        color: "#e8f4ff",
        fontFamily: "monospace",
        boxShadow: active ? "0 0 20px rgba(0,255,255,0.2)" : "none",
        opacity: locked && !canAfford ? 0.75 : 1,
      }}
    >
      <div style={{ position: "relative" }}>
        <ShipPreview shipId={ship.id} width={compact ? 180 : 200} height={compact ? 110 : 130} />
        {locked && ship.price !== undefined && <LockBadge price={ship.price} />}
      </div>
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
      {locked && ship.price !== undefined && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            letterSpacing: "2px",
            color: canAfford ? "#66ff99" : "#ff8866",
          }}
        >
          {canAfford ? `TAP TO BUY — ${formatPrice(ship.price)}` : `NEED ${formatPrice(ship.price)}`}
        </div>
      )}
    </button>
  );
}

export default function ShipSelector({
  selectedId,
  onSelect,
  compact = false,
  hangar = false,
  ownedShipIds = [],
  balance = 0,
  onPurchase,
}: Props) {
  const catalog = hangar ? shipCatalog : starterShipCatalog;

  const handleShipClick = (shipId: ShipId) => {
    if (!hangar) {
      onSelect(shipId);
      return;
    }
    const def = getShipDefinition(shipId);
    const owned = ownedShipIds.includes(shipId);
    if (!owned && def.price !== undefined) {
      if (balance >= def.price) onPurchase?.(shipId);
      return;
    }
    if (owned) onSelect(shipId);
  };

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
        {hangar ? "HANGAR — SPACESHIPS" : "SELECT SPACESHIP"}
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
        {hangar
          ? "Starter hulls are free. Premium frames unlock with Nebulance Dollars (N$)."
          : "Basic hulls only — drag to rotate preview"}
      </p>
      {hangar && (
        <p
          style={{
            margin: "0 0 14px",
            textAlign: "center",
            fontSize: "13px",
            color: "#ffcc66",
            letterSpacing: "2px",
          }}
        >
          BALANCE: {formatPrice(balance)}
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {catalog.map((ship) => {
          const owned = ownedShipIds.includes(ship.id);
          const locked = hangar && !owned && ship.price !== undefined;
          const canAfford = ship.price !== undefined && balance >= ship.price;
          return (
            <ShipCard
              key={ship.id}
              ship={ship}
              active={ship.id === selectedId}
              locked={locked}
              compact={compact}
              canAfford={canAfford}
              onActivate={() => handleShipClick(ship.id)}
            />
          );
        })}
      </div>
      {hangar && premiumShipCatalog.length > 0 && (
        <p style={{ margin: "16px 0 0", fontSize: "10px", color: "#556677", textAlign: "center" }}>
          Premium hulls are station-exclusive and cannot be selected at expedition start.
        </p>
      )}
    </div>
  );
}
