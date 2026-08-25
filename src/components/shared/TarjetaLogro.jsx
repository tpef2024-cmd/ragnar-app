// ── COMPONENTE: TARJETA DE LOGRO (para compartir) ────────────────────────────
import { Y } from "../../lib/constants";

export default function TarjetaLogro({ logro, nombreAtleta, onCerrar }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div
          style={{
            background: "#0d0d0d",
            border: `2px solid ${Y}`,
            borderRadius: 4,
            padding: 32,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {/* Fondo con patrón diagonal */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg,${Y}08 0px,${Y}08 1px,transparent 1px,transparent 12px)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 36,
                letterSpacing: 8,
                color: Y,
                lineHeight: 1,
              }}
            >
              RAGNAR
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 11,
              letterSpacing: 6,
              color: Y,
              marginBottom: 4,
            }}
          >
            RAGNAR CROSS TRAINING
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 64,
              lineHeight: 1,
              color: "#fff",
              textShadow: `0 0 40px ${Y}66`,
              marginBottom: 4,
            }}
          >
            {logro.value}
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 20,
              color: Y,
              letterSpacing: 4,
              marginBottom: 14,
            }}
          >
            {logro.movement}
          </div>
          <div style={{ width: 50, height: 2, background: Y, margin: "0 auto 14px" }} />
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: "#b3b3b3",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            {logro.type === "rm"
              ? "NUEVO RÉCORD PERSONAL"
              : logro.type === "reps"
                ? "NUEVO PR — REPS"
                : "NUEVO PR — FOR TIME"}
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#ccc" }}>
            {nombreAtleta}
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              color: "#7a7a7a",
              letterSpacing: 3,
            }}
          >
            {new Date()
              .toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
              .toUpperCase()}
          </div>
        </div>
        <button
          onClick={onCerrar}
          style={{
            width: "100%",
            padding: 12,
            background: "transparent",
            border: "1px solid #444",
            borderRadius: 2,
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: "#b3b3b3",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
