// ── TAB: RMs (atleta) — carga de 1RM y tabla de porcentajes ──────────────────
import { useState } from "react";
import { MOVIMIENTOS, PORCENTAJES, Y } from "../../lib/constants";
import { obtenerRMDeLista } from "../../lib/helpers";

export default function AthleteRM({ registrosRM, movSeleccionado, onCambiarMovimiento, onGuardarRM, guardando }) {
  const [nuevoRM, setNuevoRM] = useState("");
  const rmActual = obtenerRMDeLista(registrosRM, movSeleccionado);

  // Función de guardado de RM — delega en el hook, limpia el input al terminar
  const handleGuardar = async () => {
    const ok = await onGuardarRM(movSeleccionado, nuevoRM);
    if (ok) setNuevoRM("");
  };

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {MOVIMIENTOS.map((m) => (
          <button key={m} className={`mov ${movSeleccionado === m ? "on" : ""}`} onClick={() => onCambiarMovimiento(m)}>
            {m}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 2 }}>
            1RM — {movSeleccionado}
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, lineHeight: 1, color: rmActual ? Y : "#333" }}>
            {rmActual || "—"}
            {rmActual && <span style={{ fontSize: 20, color: "#fff", marginLeft: 6 }}>kg</span>}
          </div>
        </div>

        {rmActual ? (
          <>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 8 }}>
              Porcentajes
            </div>
            {PORCENTAJES.map((p) => (
              <div key={p} className="fila-pct">
                <div style={{ width: 44, fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: p >= 85 ? Y : p >= 70 ? "#eee" : "#888" }}>
                  {p}%
                </div>
                <div style={{ flex: 1, height: 3, background: "#222", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${p}%`, height: "100%", background: p >= 85 ? Y : p >= 70 ? "#888" : "#3a3a3a" }} />
                </div>
                <div style={{ width: 64, textAlign: "right", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: p >= 85 ? Y : "#fff" }}>
                  {Math.round((rmActual * p) / 100)}
                  <span style={{ fontSize: 11, color: "#999", marginLeft: 2 }}>kg</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>Sin RM registrado para este movimiento.</div>
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 10 }}>
          {rmActual ? "Actualizar" : "Cargar"} RM — {movSeleccionado}
        </div>
        <input className="inp" type="number" placeholder="kg" value={nuevoRM} onChange={(e) => setNuevoRM(e.target.value)} />
        <button className="btn-y" onClick={handleGuardar} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR RM"}
        </button>
      </div>
    </>
  );
}
