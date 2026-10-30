// ── TAB: HÍBRIDO (coach) ──────────────────────────────────────────────────────
// Dos secciones:
//  1) Tabla de marcas: elige un testeo, ve el ranking (mejor marca por atleta)
//     y puede cargar la marca de un atleta con la fecha del testeo.
//  2) Administrar testeos: crear, renombrar y activar/desactivar.
//     Desactivar oculta el testeo a los atletas sin perder las marcas.
import { useState } from "react";
import { Y, BORDER } from "../../lib/constants";
import { parsearTiempo, formatearTiempo, autoformatearTiempo } from "../../lib/tiempo";

import { fechaISO } from "../../lib/helpers";

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });

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

export default function CoachHibrido({ hybridData, atletas = [] }) {
  const {
    testeos,
    ranking,
    borrarMarca,
    guardarMarcaAtleta,
    crearTesteo,
    renombrarTesteo,
    alternarActivoTesteo,
  } = hybridData;

  const [vista, setVista] = useState("tabla"); // "tabla" | "testeos"
  const [testSel, setTestSel] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [error, setError] = useState("");

  // Formulario "Cargar marca" (el profe carga el tiempo de un atleta)
  const [cargandoMarca, setCargandoMarca] = useState(false);
  const [atletaMarca, setAtletaMarca] = useState("");
  const [tiempoMarca, setTiempoMarca] = useState("");
  const [fechaMarca, setFechaMarca] = useState(() => fechaISO());
  const [errorMarca, setErrorMarca] = useState("");
  const [mensajeMarca, setMensajeMarca] = useState("");
  const [guardandoMarca, setGuardandoMarca] = useState(false);

  // Solo los atletas con Hybrid activado, por nombre
  const atletasHybrid = atletas
    .filter((a) => a.is_hybrid)
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "es"));

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

  const abrirCargaMarca = () => {
    setCargandoMarca((v) => !v);
    setErrorMarca("");
    setMensajeMarca("");
  };

  const handleGuardarMarca = async () => {
    setErrorMarca("");
    setMensajeMarca("");
    if (!atletaMarca) return setErrorMarca("Elegí un atleta");
    const segundos = parsearTiempo(tiempoMarca);
    if (!segundos) return setErrorMarca("Tiempo inválido. Usá el formato HH:MM:SS");
    if (!fechaMarca || fechaMarca > fechaISO()) return setErrorMarca("Elegí una fecha válida (no futura)");

    setGuardandoMarca(true);
    const { ok, esPR } = await guardarMarcaAtleta(atletaMarca, testActual.id, segundos, fechaMarca);
    setGuardandoMarca(false);
    if (!ok) return setErrorMarca("No se pudo guardar la marca");

    const nombre = atletasHybrid.find((a) => a.id === atletaMarca)?.full_name || "el atleta";
    setMensajeMarca(`✓ ${formatearTiempo(segundos)} cargado para ${nombre}${esPR ? " — ¡NUEVO PR!" : ""}`);
    // Se mantiene el testeo y la fecha para cargar varios seguidos
    setAtletaMarca("");
    setTiempoMarca("");
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
                    onClick={() => {
                      setTestSel(t.id);
                      setMensajeMarca("");
                      setErrorMarca("");
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Cargar la marca de un atleta en este testeo */}
              <div className="card" style={{ marginBottom: 12, borderColor: cargandoMarca ? Y : undefined }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase" }}>
                    Cargar marca — {testActual.name}
                  </div>
                  <button style={cargandoMarca ? botonChico() : botonChico(Y, Y)} onClick={abrirCargaMarca}>
                    {cargandoMarca ? "✕ Cerrar" : "+ Cargar"}
                  </button>
                </div>

                {cargandoMarca && (
                  <div style={{ marginTop: 14 }}>
                    {atletasHybrid.length === 0 ? (
                      <div style={{ fontSize: 10, color: "#7a7a7a", letterSpacing: 1, lineHeight: 1.6 }}>
                        No hay atletas con Hybrid activado. Se activa desde el detalle del atleta.
                      </div>
                    ) : (
                      <>
                        <select
                          className="inp"
                          value={atletaMarca}
                          onChange={(e) => setAtletaMarca(e.target.value)}
                          style={{ fontSize: 14, colorScheme: "dark" }}
                        >
                          <option value="">Elegí un atleta…</option>
                          {atletasHybrid.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.full_name || "(sin nombre)"}
                            </option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="inp"
                            inputMode="numeric"
                            placeholder="HH:MM:SS"
                            value={tiempoMarca}
                            onChange={(e) => setTiempoMarca(autoformatearTiempo(e.target.value))}
                            onKeyDown={(e) => e.key === "Enter" && handleGuardarMarca()}
                            style={{ flex: 1 }}
                          />
                          <input
                            className="inp"
                            type="date"
                            value={fechaMarca}
                            max={fechaISO()}
                            onChange={(e) => setFechaMarca(e.target.value)}
                            style={{ flex: 1, fontSize: 14, colorScheme: "dark" }}
                          />
                        </div>
                        {errorMarca && (
                          <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{errorMarca}</div>
                        )}
                        <button className="btn-y" onClick={handleGuardarMarca} disabled={guardandoMarca}>
                          {guardandoMarca ? <span className="spin">◌</span> : "GUARDAR MARCA"}
                        </button>
                      </>
                    )}
                    {mensajeMarca && (
                      <div style={{ color: "#4ade80", fontSize: 10, letterSpacing: 1, marginTop: 10 }}>{mensajeMarca}</div>
                    )}
                  </div>
                )}
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "#fff" }}>{m.profiles?.full_name || "(sin nombre)"}</div>
                        <div style={{ fontSize: 8, color: "#7a7a7a", letterSpacing: 1 }}>{formatearFecha(m.recorded_at)}</div>
                      </div>
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
