// ── TAB: HÍBRIDO (atleta) ─────────────────────────────────────────────────────
// Lista de testeos híbridos definidos por el coach. El atleta elige uno, ve su
// mejor marca, carga una nueva (HH:MM:SS) y revisa su historial.
import { useState } from "react";
import { Y, BORDER } from "../../lib/constants";
import { parsearTiempo, formatearTiempo, autoformatearTiempo } from "../../lib/tiempo";

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AthleteHibrido({ hybridData }) {
  const { testeos, cargandoHibrido, mejorMarca, historial, guardarMarca, borrarMarca } = hybridData;

  const [testSel, setTestSel] = useState(null);
  const [tiempoTxt, setTiempoTxt] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const testActual = testeos.find((t) => t.id === testSel) || testeos[0];

  const handleGuardar = async () => {
    setError("");
    setMensaje("");
    const segundos = parsearTiempo(tiempoTxt);
    if (!segundos) {
      setError("Tiempo inválido. Usá el formato HH:MM:SS");
      return;
    }
    setGuardando(true);
    const { ok, esPR } = await guardarMarca(testActual.id, segundos);
    setGuardando(false);
    if (!ok) {
      setError("No se pudo guardar la marca");
      return;
    }
    setTiempoTxt("");
    setMensaje(esPR ? "¡NUEVO PR! 🔥" : "Marca registrada");
  };

  const handleBorrar = async (marca) => {
    if (!window.confirm(`¿Borrar la marca ${formatearTiempo(marca.time_seconds)}?`)) return;
    await borrarMarca(marca.id);
  };

  if (cargandoHibrido && testeos.length === 0) {
    return <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>CARGANDO...</div>;
  }

  if (testeos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
        TODAVÍA NO HAY TESTEOS HÍBRIDOS
      </div>
    );
  }

  const mejor = mejorMarca(testActual.id);
  const hist = historial(testActual.id);

  return (
    <>
      {/* Resumen: mejor marca por testeo (tocar una tarjeta la selecciona) */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
        {testeos.map((t) => {
          const val = mejorMarca(t.id);
          const sel = t.id === testActual.id;
          return (
            <div
              key={t.id}
              className="card"
              style={{ cursor: "pointer", borderColor: sel ? Y : BORDER, padding: 14 }}
              onClick={() => {
                setTestSel(t.id);
                setError("");
                setMensaje("");
              }}
            >
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#7a7a7a", textTransform: "uppercase", marginBottom: 4 }}>
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 26,
                  lineHeight: 1,
                  letterSpacing: 1,
                  color: val ? (sel ? Y : "#ddd") : "#333",
                }}
              >
                {val ? formatearTiempo(val) : "—"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Carga de marca para el testeo seleccionado */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: Y, textTransform: "uppercase", marginBottom: 4 }}>
          {testActual.name}
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
          Mejor marca: <span style={{ color: "#fff" }}>{mejor ? formatearTiempo(mejor) : "sin registros"}</span>
        </div>
        <input
          className="inp"
          inputMode="numeric"
          placeholder="HH:MM:SS"
          value={tiempoTxt}
          onChange={(e) => setTiempoTxt(autoformatearTiempo(e.target.value))}
        />
        {error && <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{error}</div>}
        {mensaje && <div style={{ color: "#4ade80", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{mensaje}</div>}
        <button className="btn-y" onClick={handleGuardar} disabled={guardando || !tiempoTxt}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR MARCA"}
        </button>
      </div>

      {/* Historial */}
      {hist.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
            Historial — {testActual.name}
          </div>
          {hist.map((m) => (
            <div key={m.id} className="fila-pct" style={{ justifyContent: "space-between" }}>
              <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>{formatearFecha(m.recorded_at)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 22,
                    letterSpacing: 1,
                    color: m.time_seconds === mejor ? Y : "#fff",
                  }}
                >
                  {formatearTiempo(m.time_seconds)}
                </div>
                <button
                  onClick={() => handleBorrar(m)}
                  title="Borrar marca"
                  style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
