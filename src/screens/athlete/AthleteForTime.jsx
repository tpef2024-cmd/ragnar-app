// ── TAB: FOR TIME (atleta) ────────────────────────────────────────────────────
import { useState } from "react";
import { Y } from "../../lib/constants";
import { formatearTiempo } from "../../lib/helpers";

export default function AthleteForTime({ forTimes, onGuardarFT, guardando }) {
  const [nombre, setNombre] = useState("");
  const [tiempo, setTiempo] = useState("");

  const handleGuardar = async () => {
    const ok = await onGuardarFT(nombre, tiempo);
    if (ok) {
      setNombre("");
      setTiempo("");
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 10 }}>
          Nuevo PR
        </div>
        <input className="inp" placeholder="Workout (ej: Fran, Murph...)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input className="inp" placeholder="Tiempo (ej: 4:32)" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
        <button className="btn-y" onClick={handleGuardar} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR PR ⚡"}
        </button>
      </div>

      {forTimes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forTimes.map((ft) => (
            <div key={ft.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: Y }}>
                  {ft.workout_name}
                </div>
                <div style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>
                  {new Date(ft.recorded_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff" }}>
                {formatearTiempo(ft.time_seconds)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
