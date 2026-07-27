// ── VISTA: DETALLE DE ATLETA (coach) ──────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  MOVIMIENTOS,
  PORCENTAJES,
  DISCIPLINAS,
  Y,
  BORDER,
} from "../../lib/constants";
import { obtenerRMDeLista } from "../../lib/helpers";
import SelectorGrupo from "../../components/shared/SelectorGrupo";

export default function CoachDetalleAtleta({
  atleta,
  gruposDisponibles,
  cargarRMsAtleta,
  onGuardarGrupo,
  onGuardarDisciplina,
  onAtletaActualizada,
  onVolver,
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
  const rmSeleccionado = obtenerRMDeLista(rmsAtleta, movAtleta);

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
          {DISCIPLINAS.map((d) => (
            <button
              key={d}
              onClick={() => handleGuardarDisciplina(d)}
              style={{
                padding: "8px 14px",
                background: atleta.discipline === d ? "#1a1500" : "#151515",
                border: `1px solid ${atleta.discipline === d ? Y : "#3a3a3a"}`,
                color: atleta.discipline === d ? Y : "#999",
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                letterSpacing: 1,
                borderRadius: 2,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {atleta.discipline === d ? "✓ " : ""}
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de RMs */}
      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {MOVIMIENTOS.map((m) => {
          const val = obtenerRMDeLista(rmsAtleta, m);
          return (
            <div
              key={m}
              className="card"
              style={{
                cursor: "pointer",
                borderColor: movAtleta === m ? Y : BORDER,
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
                    color: movAtleta === m ? Y : "#ddd",
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
            Porcentajes — {movAtleta}
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
