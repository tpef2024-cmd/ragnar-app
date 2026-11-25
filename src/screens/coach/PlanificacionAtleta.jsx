// ── SECCIÓN: PLANIFICACIÓN DE UN ATLETA (ficha del atleta, coach) ─────────────
// El profe habilita la tab Planificación del atleta hasta una fecha (cuando
// avisa que se va de vacaciones o no puede venir) y le sube PDFs individuales.
// Pasada la fecha, al atleta se le vuelve a poner gris la tab sola.
import { useState, useRef } from "react";
import { Y } from "../../lib/constants";
import { hoyAR, fechaCorta, fechaHora } from "../../lib/fechas";
import { usePlanificacionCoach, MAX_PDF_MB } from "../../hooks/usePlanificacion";

// "2026-11-24" + 14 → "2026-12-08" (en UTC para no correr el día)
const sumarDias = (iso, n) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const estiloTitulo = {
  fontSize: 9,
  letterSpacing: 3,
  color: "#999",
  textTransform: "uppercase",
  marginBottom: 10,
};

const estiloBotonChico = (color = "#7a7a7a", borde = "#3a3a3a") => ({
  background: "transparent",
  border: `1px solid ${borde}`,
  color,
  fontFamily: "'DM Mono',monospace",
  fontSize: 9,
  letterSpacing: 1,
  padding: "7px 10px",
  borderRadius: 2,
  cursor: "pointer",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

export default function PlanificacionAtleta({ atleta, usuarioId }) {
  const plan = usePlanificacionCoach(atleta.id, usuarioId, true);
  const hoy = hoyAR();
  const [fecha, setFecha] = useState("");
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { ok, texto }
  const inputArchivo = useRef(null);

  // Fecha propuesta en el selector: la vigente, o dos semanas desde hoy
  const fechaElegida = fecha || (plan.habilitado ? plan.hasta : sumarDias(hoy, 14));

  const sinCambios = ocupado || (plan.habilitado && fechaElegida === plan.hasta);

  const avisar = (ok, texto) => setMensaje({ ok, texto });

  const handleHabilitar = async () => {
    if (fechaElegida < hoy) return avisar(false, "La fecha tiene que ser hoy o más adelante.");
    setOcupado(true);
    const ok = await plan.habilitar(fechaElegida);
    setOcupado(false);
    setFecha("");
    avisar(ok, ok ? `Habilitada hasta el ${fechaCorta(fechaElegida)}.` : "No se pudo guardar. Probá de nuevo.");
  };

  const handleQuitar = async () => {
    if (!window.confirm(`¿Quitarle la planificación a ${atleta.full_name}? Los PDFs no se borran.`)) return;
    setOcupado(true);
    const ok = await plan.quitar();
    setOcupado(false);
    avisar(ok, ok ? "Planificación deshabilitada." : "No se pudo guardar. Probá de nuevo.");
  };

  const elegirArchivo = (e) => {
    const f = e.target.files?.[0] || null;
    setArchivo(f);
    setMensaje(null);
    if (f && !titulo) setTitulo(f.name.replace(/\.pdf$/i, ""));
  };

  const handleSubir = async () => {
    if (!archivo) return;
    setOcupado(true);
    const error = await plan.subir(archivo, titulo);
    setOcupado(false);
    if (error) return avisar(false, error);
    setArchivo(null);
    setTitulo("");
    if (inputArchivo.current) inputArchivo.current.value = "";
    avisar(true, "PDF subido.");
  };

  const handleBorrar = async (p) => {
    if (!window.confirm(`¿Borrar "${p.title}"? No se puede deshacer.`)) return;
    const ok = await plan.borrar(p);
    if (!ok) avisar(false, "No se pudo borrar. Probá de nuevo.");
  };

  if (atleta.sin_app) {
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={estiloTitulo}>Planificación</div>
        <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>
          Este atleta no usa la app, así que no puede ver planificaciones.
        </div>
      </div>
    );
  }

  const vencida = plan.hasta && !plan.habilitado;

  return (
    <div className="card" style={{ marginBottom: 16, borderColor: plan.habilitado ? Y : undefined }}>
      <div style={estiloTitulo}>Planificación</div>

      {plan.cargando ? (
        <div style={{ fontSize: 10, color: "#999", letterSpacing: 2 }}>CARGANDO...</div>
      ) : (
        <>
          {/* Estado */}
          <div style={{ fontSize: 11, letterSpacing: 1, marginBottom: 10, color: plan.habilitado ? "#4ade80" : "#bbb" }}>
            {plan.habilitado
              ? `✓ Habilitada hasta el ${fechaCorta(plan.hasta)}`
              : vencida
                ? `No habilitada (venció el ${fechaCorta(plan.hasta)})`
                : "No habilitada — el atleta ve la tab en gris"}
          </div>

          {/* Habilitar / cambiar fecha / quitar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 9, color: "#999", letterSpacing: 1, textTransform: "uppercase" }}>Hasta</span>
            <input
              type="date"
              className="inp"
              value={fechaElegida}
              min={hoy}
              onChange={(e) => setFecha(e.target.value)}
              style={{ width: "auto", padding: "6px 8px", fontSize: 12, colorScheme: "dark" }}
            />
            <button
              onClick={handleHabilitar}
              disabled={sinCambios}
              style={{ ...estiloBotonChico("#4ade80", "#166534"), opacity: sinCambios ? 0.4 : 1 }}
            >
              {plan.habilitado ? "Cambiar fecha" : "Habilitar"}
            </button>
            {plan.hasta && (
              <button onClick={handleQuitar} disabled={ocupado} style={estiloBotonChico()}>
                Quitar
              </button>
            )}
          </div>

          {/* Subir PDF */}
          <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Subir PDF (máx. {MAX_PDF_MB} MB)
            </div>
            <input
              ref={inputArchivo}
              type="file"
              accept="application/pdf,.pdf"
              onChange={elegirArchivo}
              style={{ fontSize: 11, color: "#bbb", marginBottom: 8, maxWidth: "100%" }}
            />
            {archivo && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="inp"
                  placeholder="Título (ej. Semana 1 — vacaciones)"
                  value={titulo}
                  maxLength={120}
                  onChange={(e) => setTitulo(e.target.value)}
                  style={{ flex: 1, padding: "6px 8px", fontSize: 12 }}
                />
                <button onClick={handleSubir} disabled={ocupado} style={estiloBotonChico(Y, Y)}>
                  {ocupado ? "Subiendo..." : "Subir"}
                </button>
              </div>
            )}
          </div>

          {mensaje && (
            <div style={{ fontSize: 10, letterSpacing: 1, marginBottom: 10, color: mensaje.ok ? "#4ade80" : "#f87171" }}>
              {mensaje.texto}
            </div>
          )}

          {/* PDFs subidos */}
          {plan.planes.length === 0 ? (
            <div style={{ fontSize: 10, color: "#7a7a7a", letterSpacing: 1 }}>Todavía no hay PDFs para este atleta.</div>
          ) : (
            plan.planes.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 0",
                  borderTop: "1px solid #1f1f1f",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#fff", overflowWrap: "anywhere" }}>📄 {p.title}</div>
                  <div style={{ fontSize: 9, color: "#999", marginTop: 3 }}>{fechaHora(p.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ ...estiloBotonChico("#fff"), textDecoration: "none" }}>
                      Ver
                    </a>
                  )}
                  <button onClick={() => handleBorrar(p)} style={estiloBotonChico("#f87171", "#7f1d1d")}>
                    Borrar
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
