// ── COMPONENTE: AVISO DE INACTIVIDAD ──────────────────────────────────────────
// Se muestra antes de cerrar sesión por inactividad, dando al usuario la
// oportunidad de seguir conectado con un solo click.
import { Y } from "../../lib/constants";

export default function InactivityWarningModal({ segundosRestantes, onSeguirConectado }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#0d0d0d",
          border: `1px solid ${Y}`,
          borderRadius: 4,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 9, color: Y, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          Sesión por inactividad
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#fff", marginBottom: 6 }}>
          Tu sesión va a cerrar en
        </div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: Y, lineHeight: 1, marginBottom: 18 }}>
          {segundosRestantes}s
        </div>
        <button
          className="btn-y"
          onClick={onSeguirConectado}
          style={{ marginTop: 0 }}
        >
          SEGUIR CONECTADO
        </button>
      </div>
    </div>
  );
}
