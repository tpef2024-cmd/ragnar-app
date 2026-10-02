// ── TAB: GRUPOS (coach) ───────────────────────────────────────────────────────
import { Y } from "../../lib/constants";

export default function CoachGrupos({ grupos, atletas, pagadoEsteMes, verPago = () => true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {grupos.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          SIN GRUPOS CREADOS AÚN
        </div>
      )}
      {grupos.map((g) => {
        const miembros = atletas.filter((a) => a.group_id === g.id);
        return (
          <div key={g.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: Y, letterSpacing: 3 }}>
                {g.name}
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
    </div>
  );
}
