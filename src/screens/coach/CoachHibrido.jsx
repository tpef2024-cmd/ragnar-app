// ── TAB: HÍBRIDO (coach) ──────────────────────────────────────────────────────
// Dos secciones:
//  1) Tabla de marcas: elige un testeo y ve el ranking (mejor marca por atleta).
//  2) Administrar testeos: crear, renombrar y activar/desactivar.
//     Desactivar oculta el testeo a los atletas sin perder las marcas.
import { useState } from "react";
import { Y, BORDER } from "../../lib/constants";
import { formatearTiempo } from "../../lib/tiempo";

function Titulo({ children }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", margin: "4px 0 12px" }}>
      {children}
    </div>
  );
}

const botonChico = (color = "#999", borde = "#3a3a3a") => ({
  background: "transparent",
  border: `1px solid ${borde}`,
  color,
  fontFamily: "'DM Mono',monospace",
  fontSize: 9,
  letterSpacing: 1,
  padding: "6px 10px",
  borderRadius: 2,
  cursor: "pointer",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

export default function CoachHibrido({ hybridData }) {
  const { testeos, ranking, borrarMarca, crearTesteo, renombrarTesteo, alternarActivoTesteo } = hybridData;

  const [vista, setVista] = useState("tabla"); // "tabla" | "testeos"
  const [testSel, setTestSel] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [error, setError] = useState("");

  const testActual = testeos.find((t) => t.id === testSel) || testeos[0];
  const filas = testActual ? ranking(testActual.id) : [];

  const handleCrear = async () => {
    setError("");
    const err = await crearTesteo(nuevoNombre);
    if (err) setError(err);
    else setNuevoNombre("");
  };

  const handleRenombrar = async (id) => {
    setError("");
    const err = await renombrarTesteo(id, nombreEdit);
    if (err) setError(err);
    else setEditandoId(null);
  };

  const handleBorrarMarca = async (m) => {
    const nombre = m.profiles?.full_name || "este atleta";
    if (!window.confirm(`¿Borrar la marca ${formatearTiempo(m.time_seconds)} de ${nombre}?`)) return;
    await borrarMarca(m.id);
  };

  return (
    <>
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
        {[
          ["tabla", "Tabla de marcas"],
          ["testeos", "Testeos"],
        ].map(([k, l]) => (
          <button key={k} className={`tab ${vista === k ? "on" : ""}`} onClick={() => setVista(k)}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TABLA DE MARCAS ─────────────────────────────────────────────── */}
      {vista === "tabla" && (
        <>
          {testeos.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
              NO HAY TESTEOS CREADOS
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {testeos.map((t) => (
                  <button
                    key={t.id}
                    className={`mov ${t.id === testActual.id ? "on" : ""}`}
                    style={{ opacity: t.active ? 1 : 0.5 }}
                    onClick={() => setTestSel(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              <div className="card">
                <Titulo>
                  Ranking — {testActual.name} ({filas.length} atleta{filas.length === 1 ? "" : "s"})
                </Titulo>
                {filas.length === 0 ? (
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, padding: "12px 0" }}>SIN MARCAS CARGADAS</div>
                ) : (
                  filas.map((m, i) => (
                    <div key={m.id} className="fila-pct">
                      <div
                        style={{
                          width: 28,
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 20,
                          color: i < 3 ? Y : "#666",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: 12, color: "#fff" }}>{m.profiles?.full_name || "(sin nombre)"}</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color: i === 0 ? Y : "#fff" }}>
                        {formatearTiempo(m.time_seconds)}
                      </div>
                      <button
                        onClick={() => handleBorrarMarca(m)}
                        title="Borrar marca"
                        style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── ADMINISTRAR TESTEOS ─────────────────────────────────────────── */}
      {vista === "testeos" && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <Titulo>Nuevo testeo</Titulo>
            <input
              className="inp"
              placeholder="Ej: 5km Run"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCrear()}
            />
            <button className="btn-y" onClick={handleCrear} disabled={!nuevoNombre.trim()}>
              AGREGAR TESTEO
            </button>
          </div>

          {error && <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {testeos.map((t) => (
              <div key={t.id} className="card" style={{ display: "flex", alignItems: "center", gap: 8, padding: 14 }}>
                {editandoId === t.id ? (
                  <>
                    <input
                      className="inp"
                      style={{ marginBottom: 0, fontSize: 14, flex: 1 }}
                      value={nombreEdit}
                      autoFocus
                      onChange={(e) => setNombreEdit(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenombrar(t.id)}
                    />
                    <button style={botonChico("#4ade80", "#4ade80")} onClick={() => handleRenombrar(t.id)}>
                      OK
                    </button>
                    <button style={botonChico()} onClick={() => setEditandoId(null)}>
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: t.active ? "#fff" : "#666" }}>{t.name}</div>
                      <div style={{ fontSize: 9, letterSpacing: 1, color: t.active ? "#4ade80" : "#7a7a7a" }}>
                        {t.active ? "Visible para atletas" : "Oculto"}
                      </div>
                    </div>
                    <button
                      style={botonChico()}
                      onClick={() => {
                        setEditandoId(t.id);
                        setNombreEdit(t.name);
                        setError("");
                      }}
                    >
                      Editar
                    </button>
                    <button
                      style={t.active ? botonChico("#f87171", "#f87171") : botonChico(Y, Y)}
                      onClick={() => alternarActivoTesteo(t.id, !t.active)}
                    >
                      {t.active ? "Ocultar" : "Activar"}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
