// ── TAB: RESUMEN (atleta) ─────────────────────────────────────────────────────
import { MOVIMIENTOS, Y, BORDER } from "../../lib/constants";
import { obtenerRMDeLista } from "../../lib/helpers";

export default function AthleteResumen({ registrosRM, onIrARM }) {
  const hayRMs = MOVIMIENTOS.some((m) => obtenerRMDeLista(registrosRM, m));

  return (
    <>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
        {MOVIMIENTOS.map((m) => {
          const val = obtenerRMDeLista(registrosRM, m);
          return (
            <div
              key={m}
              className="card"
              style={{ cursor: "pointer", borderColor: val ? "#3a3a3a" : BORDER }}
              onClick={() => onIrARM(m)}
            >
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#7a7a7a", textTransform: "uppercase", marginBottom: 4 }}>
                {m}
              </div>
              {val ? (
                <>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, lineHeight: 1, color: Y }}>
                    {val}
                    <span style={{ fontSize: 14, color: "#999", marginLeft: 3 }}>kg</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {[70, 80, 90].map((pct) => (
                      <div key={pct} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#999", padding: "2px 0", borderTop: "1px solid #222" }}>
                        <span style={{ color: pct === 90 ? "#ccc" : "#888" }}>{pct}%</span>
                        <span style={{ color: pct === 90 ? Y : "#aaa", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13 }}>
                          {Math.round((val * pct) / 100)}kg
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#333", lineHeight: 1 }}>—</div>
              )}
            </div>
          );
        })}
      </div>
      {!hayRMs && (
        <div style={{ textAlign: "center", padding: 40, color: "#444", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 3 }}>
          SIN RMs REGISTRADOS AÚN
          <br />
          <span style={{ fontSize: 11, color: "#333" }}>Andá a ⚡ RMs para cargar</span>
        </div>
      )}
    </>
  );
}
