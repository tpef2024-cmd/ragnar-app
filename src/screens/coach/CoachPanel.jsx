// ── PANTALLA: PANEL COACH ─────────────────────────────────────────────────────
import CoachAtletas from "./CoachAtletas";
import CoachSolicitudes from "./CoachSolicitudes";
import CoachPagos from "./CoachPagos";
import CoachGrupos from "./CoachGrupos";
import CoachTienda from "./CoachTienda";
import CoachPromos from "./CoachPromos";
import CoachDetalleAtleta from "./CoachDetalleAtleta";

export default function CoachPanel({
  tabCoach,
  coachData,
  tienda,
  promociones,
  atletaSeleccionado,
  onSeleccionarAtleta,
  onVolverALista,
  onAtletaActualizada,
}) {
  const {
    atletas,
    pendientes,
    revocados,
    pagos,
    planes,
    grupos,
    gruposDisponibles,
    pagadoEsteMes,
    ingresosDelMes,
    cobrarCuota,
    revertirPago,
    guardarPrecioPlan,
    guardarGrupoAtleta,
    guardarDisciplinaAtleta,
    cargarRMsAtleta,
    aprobarAtleta,
    rechazarAtleta,
    revocarAtleta,
    reactivarAtleta,
  } = coachData;

  const alDia = atletas.filter((a) => pagadoEsteMes(a.id)).length;
  const deben = atletas.length - alDia;

  return (
    <>
      {/* Estadísticas rápidas */}
      <div
        className="grid-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Atletas", val: atletas.length, color: "#fff" },
          { label: "Al día", val: alDia, color: "#4ade80" },
          { label: "Deben", val: deben, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 38,
                lineHeight: 1,
                color: s.color,
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 8,
                letterSpacing: 2,
                color: "#999",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Lista + detalle de atleta.
          - Desktop: ambas conviven siempre lado a lado (ver .coach-master-detail en globalStyles).
          - Mobile: se navega entre una y otra según tabCoach (clase view-atletas / view-detalle_atleta) */}
      {(tabCoach === "atletas" || tabCoach === "detalle_atleta") && (
        <div className={`coach-master-detail view-${tabCoach}`}>
          <div className="coach-list-pane">
            <CoachAtletas
              atletas={atletas}
              pagadoEsteMes={pagadoEsteMes}
              onSeleccionarAtleta={onSeleccionarAtleta}
            />
          </div>
          {atletaSeleccionado && (
            <div className="coach-detail-pane">
              <CoachDetalleAtleta
                atleta={atletaSeleccionado}
                gruposDisponibles={gruposDisponibles}
                cargarRMsAtleta={cargarRMsAtleta}
                onGuardarGrupo={guardarGrupoAtleta}
                onGuardarDisciplina={guardarDisciplinaAtleta}
                onAtletaActualizada={onAtletaActualizada}
                onVolver={onVolverALista}
                onRevocarAcceso={revocarAtleta}
              />
            </div>
          )}
        </div>
      )}

      {tabCoach === "solicitudes" && (
        <CoachSolicitudes
          pendientes={pendientes}
          revocados={revocados}
          onAprobar={aprobarAtleta}
          onRechazar={rechazarAtleta}
          onReactivar={reactivarAtleta}
        />
      )}

      {tabCoach === "pagos" && (
        <CoachPagos
          atletas={atletas}
          pagos={pagos}
          planes={planes}
          pagadoEsteMes={pagadoEsteMes}
          ingresosDelMes={ingresosDelMes}
          onCobrarCuota={cobrarCuota}
          onRevertirPago={revertirPago}
          onGuardarPrecioPlan={guardarPrecioPlan}
        />
      )}
      {tabCoach === "grupos" && (
        <CoachGrupos
          grupos={grupos}
          atletas={atletas}
          pagadoEsteMes={pagadoEsteMes}
        />
      )}

      {tabCoach === "tienda" && <CoachTienda tienda={tienda} />}

      {tabCoach === "promos" && <CoachPromos promociones={promociones} />}
    </>
  );
}
