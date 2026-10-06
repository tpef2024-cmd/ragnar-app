// ── TAB: GRUPOS (coach) ───────────────────────────────────────────────────────
// Con 11 horarios × 5 frecuencias hay 55 grupos: por defecto se muestran solo
// los que tienen atletas, ordenados de mañana a noche.
import { useState } from "react";
import { Y } from "../../lib/constants";
import { etiquetaGrupo, ordenarGrupos } from "../../lib/helpers";

export default function CoachGrupos({ grupos, atletas, pagadoEsteMes, verPago = () => true }) {
  const [verVacios, setVerVacios] = useState(false);
  const ordenados = ordenarGrupos(grupos);
  const conMiembros = (g) => atletas.some((a) => a.group_id === g.id);
  const visibles = verVacios ? ordenados : ordenados.filter(conMiembros);
  const cantVacios = ordenados.length - ordenados.filter(conMiembros).length;
  const sinGrupo = atletas.filter((a) => !a.group_id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {grupos.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          SIN GRUPOS CREADOS AÚN
        </div>
      )}
      {visibles.map((g) => {
        const miembros = atletas.filter((a) => a.group_id === g.id);
        return (
          <div key={g.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: miembros.length ? 10 : 0 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: miembros.length ? Y : "#555", letterSpacing: 3 }}>
                {etiquetaGrupo(g.name)}
              </div>
              <div style={{ fontSize: 9, color: "#999", letterSpacing: 2 }}>{miembros.length} atletas</div>
            </div>
            {miembros.map((a) => (
              <div key={a.id} style={{ fontSize: 11, color: "#ccc", padding: "4px 0", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between" }}>
                {a.full_name}
                {verPago(a) && (
                  <span className={pagadoEsteMes(a.id) ? "badge-ok" : "badge-no"}>
                    {pagadoEsteMes(a.id) ? "AL DÍA" : "DEBE"}
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {sinGrupo.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#f87171", letterSpacing: 3 }}>
              Sin grupo
            </div>
            <div style={{ fontSize: 9, color: "#999", letterSpacing: 2 }}>{sinGrupo.length} atletas</div>
          </div>
          {sinGrupo.map((a) => (
            <div key={a.id} style={{ fontSize: 11, color: "#ccc", padding: "4px 0", borderBottom: "1px solid #1e1e1e" }}>
              {a.full_name}
            </div>
          ))}
        </div>
      )}

      {cantVacios > 0 && (
        <button
          onClick={() => setVerVacios((v) => !v)}
          style={{ background: "none", border: "none", color: "#7a7a7a", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", textDecoration: "underline", cursor: "pointer", padding: 8 }}
        >
          {verVacios ? "Ocultar grupos vacíos" : `Ver grupos vacíos (${cantVacios})`}
        </button>
      )}
    </div>
  );
}
