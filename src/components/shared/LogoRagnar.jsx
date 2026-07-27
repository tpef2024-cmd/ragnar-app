// ── COMPONENTE: LOGO RAGNAR ───────────────────────────────────────────────────
// Usa el logo oficial del gimnasio (perro + mancuerna) junto al texto estilizado.
import { Y } from "../../lib/constants";

export default function LogoRagnar({ size = "normal" }) {
  const iconSize = size === "large" ? 56 : 38;
  const fontSize = size === "large" ? 30 : 22;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/logo-icon.png"
        alt="Ragnar Cross Training"
        style={{ height: iconSize, width: iconSize, objectFit: "contain", borderRadius: 4 }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize,
            letterSpacing: 4,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          RAGNAR
        </div>
        <div
          style={{
            fontSize: size === "large" ? 9 : 8,
            letterSpacing: 3,
            color: Y,
            textTransform: "uppercase",
            lineHeight: 1.4,
          }}
        >
          Cross Training
        </div>
      </div>
    </div>
  );
}
