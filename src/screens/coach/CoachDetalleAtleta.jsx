// ── VISTA: DETALLE DE ATLETA (coach) ──────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  PORCENTAJES,
  DISCIPLINAS,
  Y,
  BORDER,
} from "../../lib/constants";
import { obtenerRMDeLista, movimientosDeDisciplina } from "../../lib/helpers";
import SelectorGrupo from "../../components/shared/SelectorGrupo";

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
  esDueno = false, // los profes ven el detalle en modo solo lectura
}) {
  const [rmsAtleta, setRmsAtleta] = useState([]);
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
                    {grupoActual?.name || "—"}
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
