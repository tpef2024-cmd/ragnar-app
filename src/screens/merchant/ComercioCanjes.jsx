// ── TAB: CANJES (comercio Ragnero) ────────────────────────────────────────────
// Historial de cupones canjeados en el comercio, con totales del mes.
import { Y } from "../../lib/constants";
import { fechaHora, hoyAR } from "../../lib/fechas";

export default function ComercioCanjes({ canjes, onRecargar }) {
  const mesActual = hoyAR().slice(0, 7); // "2026-11"
  const delMes = canjes.filter(
    (c) => new Date(c.redeemed_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).slice(0, 7) === mesActual,
  ).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16, maxWidth: 480 }}>
        {[
          { label: "Este mes", val: delMes, color: Y },
          { label: "Total", val: canjes.length, color: "#fff" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, lineHeight: 1, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: "#999", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase" }}>Cupones canjeados</div>
        <button className="btn-salir" style={{ padding: "4px 10px", fontSize: 9 }} onClick={onRecargar}>
          Actualizar
        </button>
      </div>

      {canjes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#555", fontSize: 10, letterSpacing: 2 }}>
          TODAVÍA NO HAY CANJES
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {canjes.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: Y, width: 54 }}>{c.percentage}%</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#fff" }}>{c.atleta}</div>
                <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.title}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 9, color: "#999", letterSpacing: 1 }}>
                <div>{fechaHora(c.redeemed_at)}</div>
                <div style={{ color: "#555" }}>{c.short_code}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
