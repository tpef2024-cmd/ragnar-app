// ── TAB: REPS / AMRAP (atleta) ────────────────────────────────────────────────
// Para ejercicios o circuitos donde el resultado es una cantidad lograda en
// un tiempo fijo (ej: "2 min de Burpee" -> 45 repeticiones), en vez de un
// peso (RM) o un tiempo total (For Time).
import { useState } from "react";
import { Y } from "../../lib/constants";

export default function AthleteReps({ repsRecords, onGuardarReps, guardando }) {
  const [ejercicio, setEjercicio] = useState("");
  const [timeCap, setTimeCap] = useState("");
  const [resultado, setResultado] = useState("");

  const handleGuardar = async () => {
    const ok = await onGuardarReps(ejercicio, timeCap, resultado);
    if (ok) {
      setEjercicio("");
      setTimeCap("");
      setResultado("");
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 10 }}>
          Nuevo PR
        </div>
        <input className="inp" placeholder="Ejercicio o circuito (ej: Burpee, Circuito)" value={ejercicio} onChange={(e) => setEjercicio(e.target.value)} />
        <input className="inp" placeholder="Tiempo fijo (ej: 2 min, 10 min)" value={timeCap} onChange={(e) => setTimeCap(e.target.value)} />
        <input className="inp" type="number" placeholder="Repeticiones / rondas logradas" value={resultado} onChange={(e) => setResultado(e.target.value)} />
        <button className="btn-y" onClick={handleGuardar} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR PR ⚡"}
        </button>
      </div>

      {repsRecords.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {repsRecords.map((r) => (
            <div key={r.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: Y }}>
                  {r.exercise}
                </div>
                <div style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>
                  {r.time_cap} · {new Date(r.recorded_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "#fff" }}>
                {r.result}
                <span style={{ fontSize: 13, color: "#999", marginLeft: 4 }}>reps</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
