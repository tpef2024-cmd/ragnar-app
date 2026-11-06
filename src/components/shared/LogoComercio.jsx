// ── COMPONENTE: LOGO DE COMERCIO ──────────────────────────────────────────────
// Logo redondo; si el comercio todavía no cargó uno, muestra sus iniciales.
import { Y } from "../../lib/constants";

export default function LogoComercio({ comercio, size = 48 }) {
  const iniciales = String(comercio?.name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        background: comercio?.logo_url ? "#fff" : "#1a1500",
        border: `1px solid ${comercio?.logo_url ? "#2a2a2a" : Y}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: size * 0.42,
        color: Y,
        letterSpacing: 1,
      }}
    >
      {comercio?.logo_url ? (
        <img src={comercio.logo_url} alt={comercio.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        iniciales
      )}
    </div>
  );
}
