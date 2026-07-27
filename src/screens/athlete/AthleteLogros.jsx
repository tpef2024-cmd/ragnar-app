// ── TAB: LOGROS (atleta) — lista de PRs compartibles ──────────────────────────
import { MOVIMIENTOS, Y } from "../../lib/constants";
import { obtenerRMDeLista, formatearTiempo } from "../../lib/helpers";

const estiloBotonCompartir = {
  background: "#1a1500",
  border: `1px solid ${Y}`,
  color: Y,
  fontFamily: "'DM Mono',monospace",
  fontSize: 9,
  letterSpacing: 1,
  padding: "8px 10px",
  borderRadius: 2,
  cursor: "pointer",
  textTransform: "uppercase",
};

export default function AthleteLogros({ registrosRM, forTimes, onCompartir }) {
  const sinLogros = registrosRM.length === 0 && forTimes.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {MOVIMIENTOS.map((m) => {
        const val = obtenerRMDeLista(registrosRM, m);
        if (!val) return null;
        return (
          <div key={m} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: Y, letterSpacing: 2 }}>{m}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff" }}>
                {val}
                <span style={{ fontSize: 13, color: "#999", marginLeft: 4 }}>kg</span>
              </div>
            </div>
            <button style={estiloBotonCompartir} onClick={() => onCompartir({ type: "rm", movement: m, value: `${val}kg` })}>
              📸 Compartir
            </button>
          </div>
        );
      })}

      {forTimes.slice(0, 5).map((ft) => (
        <div key={ft.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: Y, letterSpacing: 2 }}>
              {ft.workout_name}
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff" }}>
              {formatearTiempo(ft.time_seconds)}
            </div>
          </div>
          <button
            style={estiloBotonCompartir}
            onClick={() => onCompartir({ type: "fortime", movement: ft.workout_name, value: formatearTiempo(ft.time_seconds) })}
          >
            📸 Compartir
          </button>
        </div>
      ))}

      {sinLogros && (
        <div style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 3 }}>
          CARGÁ TUS PRIMEROS RMs
          <br />Y APARECERÁN ACÁ
        </div>
      )}
    </div>
  );
}
