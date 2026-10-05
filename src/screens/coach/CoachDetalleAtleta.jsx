// ── VISTA: DETALLE DE ATLETA (coach) ──────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  PORCENTAJES,
  DISCIPLINAS,
  Y,
  BORDER,
} from "../../lib/constants";
import { obtenerRMDeLista, movimientosDeDisciplina, etiquetaGrupo } from "../../lib/helpers";
import SelectorGrupo from "../../components/shared/SelectorGrupo";
import SeccionNotas from "../../components/shared/SeccionNotas";
import { useNotas } from "../../hooks/useNotas";
import CobrarCuota from "./CobrarCuota";
import AsistenciaAtleta from "./AsistenciaAtleta";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const estiloTitulo = {
  fontSize: 9,
  letterSpacing: 3,
  color: "#999",
  textTransform: "uppercase",
  marginBottom: 10,
};

const formatearFecha = (iso) => {
  if (!iso) return null;
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

// Edad en años a partir de "YYYY-MM-DD"
const calcularEdad = (iso) => {
  if (!iso) return null;
  const n = new Date(iso + "T00:00:00");
  const hoy = new Date();
  let edad = hoy.getFullYear() - n.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), n.getMonth(), n.getDate())) edad--;
  return edad;
};

// Chip de disciplina: resaltado si está seleccionada, clickeable solo si el
// usuario puede editar (dueño)
const estiloChip = (seleccionado, editable) => ({
  padding: "8px 14px",
  background: seleccionado ? "#1a1500" : "#151515",
  border: `1px solid ${seleccionado ? Y : "#3a3a3a"}`,
  color: seleccionado ? Y : "#999",
  fontFamily: "'DM Mono',monospace",
  fontSize: 10,
  letterSpacing: 1,
  borderRadius: 2,
  cursor: editable ? "pointer" : "default",
  textTransform: "uppercase",
});

export default function CoachDetalleAtleta({
  atleta,
  gruposDisponibles,
  cargarRMsAtleta,
  onGuardarGrupo,
  onGuardarDisciplina,
  onAtletaActualizada,
  onVolver,
  onRevocarAcceso,
  onGuardarHybrid,
  esDueno = false, // los profes ven grupo/disciplina en modo solo lectura
  usuarioId,
  // Pago del mes actual (solo si este usuario puede manejar el pago del atleta)
  puedeVerPago = false,
  pagoDelMes,
  planes = [],
  onCobrarCuota,
  onRevertirPago,
  // Asistencia
  cargarAsistenciaAtleta,
  cargarUltimaAsistencia,
  onMarcarAsistencia,
  onQuitarAsistencia,
}) {
  const [rmsAtleta, setRmsAtleta] = useState([]);
  const [cobrando, setCobrando] = useState(false);
  const notas = useNotas(atleta.id);

  // El cobro desde el detalle siempre es del mes actual
  const hoy = new Date();
  const periodoActual = { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
  const pago = pagoDelMes?.(atleta.id);
  const nombrePlan = (planId) => planes.find((p) => p.id === planId)?.name;

  const handleCobrar = async (datos) => {
    await onCobrarCuota(atleta.id, datos, periodoActual);
    setCobrando(false);
  };

  const handleRevertir = async () => {
    if (!window.confirm(`¿Revertir el pago de ${MESES[periodoActual.mes - 1]} de ${atleta.full_name}?`)) return;
    await onRevertirPago(atleta.id, periodoActual);
  };
  const [movAtleta, setMovAtleta] = useState("Back Squat");
  const [asignandoGrupo, setAsignandoGrupo] = useState(false);

  // Cargar RMs del atleta seleccionado al entrar a la vista
  useEffect(() => {
    let activo = true;
    cargarRMsAtleta(atleta.id).then((data) => {
      if (activo) setRmsAtleta(data);
    });
    return () => {
      activo = false;
    };
  }, [atleta.id, cargarRMsAtleta]);

  const grupoActual = gruposDisponibles.find((g) => g.id === atleta.group_id);
  const movimientos = movimientosDeDisciplina(atleta.discipline);
  // Igual criterio que en la vista del propio atleta: si el movimiento
  // guardado no pertenece a la disciplina actual, se usa el primero disponible.
  const movAtletaEfectivo = movimientos.includes(movAtleta) ? movAtleta : movimientos[0];
  const rmSeleccionado = obtenerRMDeLista(rmsAtleta, movAtletaEfectivo);

  // Guardar grupo — actualiza la base de datos y refleja el cambio en pantalla al instante
  const handleGuardarGrupo = async (grupoId) => {
    await onGuardarGrupo(atleta.id, grupoId);
    onAtletaActualizada({ group_id: grupoId });
    setAsignandoGrupo(false);
  };

  // Guardar disciplina — actualiza la base de datos y refleja el cambio en pantalla al instante
  const handleGuardarDisciplina = async (disciplina) => {
    await onGuardarDisciplina(atleta.id, disciplina);
    onAtletaActualizada({ discipline: disciplina });
  };

  // Marcar / desmarcar Hybrid (complementaria: no reemplaza la disciplina)
  const handleToggleHybrid = async () => {
    const nuevoValor = !atleta.is_hybrid;
    await onGuardarHybrid(atleta.id, nuevoValor);
    onAtletaActualizada({ is_hybrid: nuevoValor });
  };

  // Revocar el acceso del atleta — pide confirmación porque bloquea su login
  // inmediatamente y vuelve a la lista, ya que deja de aparecer entre los
  // atletas aprobados.
  const handleRevocarAcceso = async () => {
    const confirmado = window.confirm(
      `¿Revocar el acceso de ${atleta.full_name}? No va a poder ingresar a la app hasta que lo vuelvas a aprobar.`,
    );
    if (!confirmado) return;
    await onRevocarAcceso(atleta.id);
    onVolver();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <button
          onClick={onVolver}
          style={{
            background: "transparent",
            border: "1px solid #3a3a3a",
            color: "#999",
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          ← VOLVER
        </button>
        <div>
          <div
            style={{
              fontSize: 9,
              color: Y,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Atleta
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            {atleta.full_name}
          </div>
        </div>

        {esDueno && (
        <button
          onClick={handleRevocarAcceso}
          style={{
            marginLeft: "auto",
            background: "#1f0f0f",
            border: "1px solid #f87171",
            color: "#f87171",
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: 1,
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Revocar acceso
        </button>
        )}
      </div>

      {/* Cuota del mes actual */}
      {puedeVerPago && (
        <div className="card" style={{ marginBottom: 16, borderColor: pago ? undefined : "#7f1d1d" }}>
          <div style={estiloTitulo}>Cuota de {MESES[periodoActual.mes - 1]}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            {pago ? (
              <div style={{ fontSize: 10, letterSpacing: 1, color: "#4ade80" }}>
                ✓ Al día — {pago.plan_id ? nombrePlan(pago.plan_id) : "monto libre"} · $
                {Number(pago.amount || 0).toLocaleString("es-AR")}
                {pago.payment_method && (
                  <span style={{ color: "#7a7a7a" }}>
                    {" "}· {pago.payment_method === "efectivo" ? "💵 Efectivo" : "🏦 Transferencia"}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 10, letterSpacing: 1, color: "#f87171" }}>Cuota pendiente</div>
            )}
            {pago ? (
              <button
                onClick={handleRevertir}
                title="Revertir pago (por si fue un error)"
                style={{
                  background: "transparent",
                  border: "1px solid #3a3a3a",
                  color: "#7a7a7a",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9,
                  padding: "5px 8px",
                  borderRadius: 2,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                ↺ Revertir
              </button>
            ) : (
              <button
                onClick={() => setCobrando((c) => !c)}
                style={{
                  background: "#0d2b1a",
                  border: "1px solid #166534",
                  color: "#4ade80",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9,
                  letterSpacing: 1,
                  padding: "7px 12px",
                  borderRadius: 2,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {cobrando ? "✕ Cerrar" : "$ Cobrar cuota"}
              </button>
            )}
          </div>
          {cobrando && !pago && (
            <CobrarCuota
              planes={planes}
              periodoTexto={MESES[periodoActual.mes - 1]}
              onConfirmar={handleCobrar}
              onCancelar={() => setCobrando(false)}
            />
          )}
        </div>
      )}

      {/* Datos personales */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={estiloTitulo}>Datos personales</div>
        {[
          ["Teléfono", atleta.phone],
          [
            "Nacimiento",
            atleta.birth_date &&
              `${formatearFecha(atleta.birth_date)} (${calcularEdad(atleta.birth_date)} años)`,
          ],
          ["Emergencia", atleta.emergency_contact],
        ].map(([label, valor]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: "1px solid #1e1e1e" }}>
            <span style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
            {label === "Teléfono" && valor ? (
              <a href={`tel:${valor}`} style={{ fontSize: 12, color: Y, textDecoration: "none" }}>{valor}</a>
            ) : (
              <span style={{ fontSize: 12, color: valor ? "#ddd" : "#555", textAlign: "right" }}>{valor || "Sin cargar"}</span>
            )}
          </div>
        ))}
        {atleta.sin_app && (
          <div style={{ fontSize: 9, color: "#60a5fa", letterSpacing: 1, marginTop: 10 }}>
            Dado de alta por un profe · no usa la app
          </div>
        )}
      </div>

      {/* Asignación de grupo */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 3,
            color: "#999",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Grupo / Horario
        </div>
        {!asignandoGrupo ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {atleta.group_id ? (
                <>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 22,
                      letterSpacing: 3,
                      color: Y,
                    }}
                  >
                    {etiquetaGrupo(grupoActual?.name) || "—"}
                  </div>
                  <div style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>
                    {grupoActual?.schedule || ""}
                  </div>
                </>
              ) : (
                <div
                  style={{ fontSize: 10, color: "#f87171", letterSpacing: 1 }}
                >
                  Sin grupo asignado
                </div>
              )}
            </div>
            {esDueno && (
            <button
              onClick={() => setAsignandoGrupo(true)}
              style={{
                background: "transparent",
                border: "1px solid #3a3a3a",
                color: "#999",
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                letterSpacing: 2,
                padding: "6px 12px",
                borderRadius: 2,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {atleta.group_id ? "Cambiar" : "Asignar"}
            </button>
            )}
          </div>
        ) : (
          <SelectorGrupo
            grupos={gruposDisponibles}
            onSeleccionar={handleGuardarGrupo}
            onCancelar={() => setAsignandoGrupo(false)}
          />
        )}
      </div>

      {/* Asignación de disciplina */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 3,
            color: "#999",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Disciplina
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {/* El dueño ve todas las opciones para asignar; el profe solo la actual */}
          {(esDueno ? DISCIPLINAS : [atleta.discipline].filter(Boolean)).map((d) => (
            <button
              key={d}
              onClick={esDueno ? () => handleGuardarDisciplina(d) : undefined}
              style={estiloChip(atleta.discipline === d, esDueno)}
            >
              {atleta.discipline === d && esDueno ? "✓ " : ""}
              {d}
            </button>
          ))}
          {!esDueno && !atleta.discipline && (
            <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1 }}>
              Sin disciplina asignada
            </div>
          )}
        </div>

        {/* Hybrid — complementaria, convive con la disciplina principal */}
        {(esDueno || atleta.is_hybrid) && (
          <>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: "#999",
                textTransform: "uppercase",
                margin: "14px 0 10px",
              }}
            >
              Complementaria
            </div>
            <button
              onClick={esDueno ? handleToggleHybrid : undefined}
              style={estiloChip(!!atleta.is_hybrid, esDueno)}
            >
              {atleta.is_hybrid && esDueno ? "✓ " : ""}
              Hybrid
            </button>
          </>
        )}
      </div>

      {/* Asistencia */}
      {cargarAsistenciaAtleta && (
        <AsistenciaAtleta
          atleta={atleta}
          grupo={grupoActual}
          cargarAsistenciaAtleta={cargarAsistenciaAtleta}
          cargarUltimaAsistencia={cargarUltimaAsistencia}
          onMarcar={onMarcarAsistencia}
          onQuitar={onQuitarAsistencia}
        />
      )}

      {/* Información que cargó el atleta (solo lectura para el profe) */}
      <SeccionNotas
        titulo="Info del atleta"
        aclaracion="La cargó el atleta desde su perfil."
        notas={notas.notasAtleta}
        cargando={notas.cargando}
        vacio="El atleta no cargó información."
      />

      {/* Notas privadas de profes */}
      <SeccionNotas
        titulo="🔒 Notas de profes"
        aclaracion="Solo las ven los profes. El atleta no las ve."
        notas={notas.notasCoach}
        cargando={notas.cargando}
        placeholder="Ej: viene de una lesión de rodilla, no hacer saltos..."
        vacio="Sin notas todavía."
        onAgregar={(texto) => notas.agregar("coach", texto)}
        puedeBorrar={(n) => esDueno || n.author_id === usuarioId}
        onBorrar={notas.borrar}
        mostrarAutor
        colorBorde="#3a2f00"
      />

      {/* Grilla de RMs */}
      {movimientos.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: "#555", fontSize: 10, letterSpacing: 2, marginBottom: 16 }}>
          SIN MOVIMIENTOS DE RM CONFIGURADOS PARA ESTA DISCIPLINA
        </div>
      ) : (
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {movimientos.map((m) => {
          const val = obtenerRMDeLista(rmsAtleta, m);
          return (
            <div
              key={m}
              className="card"
              style={{
                cursor: "pointer",
                borderColor: movAtletaEfectivo === m ? Y : BORDER,
              }}
              onClick={() => setMovAtleta(m)}
            >
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: 2,
                  color: "#7a7a7a",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {m}
              </div>
              {val ? (
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 36,
                    lineHeight: 1,
                    color: movAtletaEfectivo === m ? Y : "#ddd",
                  }}
                >
                  {val}
                  <span style={{ fontSize: 13, color: "#999", marginLeft: 3 }}>
                    kg
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 28,
                    color: "#333",
                  }}
                >
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Porcentajes del movimiento seleccionado */}
      {rmSeleccionado && (
        <div className="card">
          <div
            style={{
              fontSize: 9,
              letterSpacing: 3,
              color: "#999",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Porcentajes — {movAtletaEfectivo}
          </div>
          {PORCENTAJES.map((p) => (
            <div key={p} className="fila-pct">
              <div
                style={{
                  width: 44,
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 20,
                  color: p >= 85 ? Y : p >= 70 ? "#eee" : "#888",
                }}
              >
                {p}%
              </div>
              <div
                style={{
                  flex: 1,
                  height: 3,
                  background: "#222",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${p}%`,
                    height: "100%",
                    background: p >= 85 ? Y : p >= 70 ? "#888" : "#3a3a3a",
                  }}
                />
              </div>
              <div
                style={{
                  width: 64,
                  textAlign: "right",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 22,
                  color: p >= 85 ? Y : "#fff",
                }}
              >
                {Math.round((rmSeleccionado * p) / 100)}
                <span style={{ fontSize: 11, color: "#999", marginLeft: 2 }}>
                  kg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
