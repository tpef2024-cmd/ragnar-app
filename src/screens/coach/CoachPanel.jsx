// ── PANTALLA: PANEL COACH ─────────────────────────────────────────────────────
import CoachAtletas from "./CoachAtletas";
import CoachSolicitudes from "./CoachSolicitudes";
import CoachPagos from "./CoachPagos";
import CoachGrupos from "./CoachGrupos";
import CoachTienda from "./CoachTienda";
import CoachPromos from "./CoachPromos";
import CoachDetalleAtleta from "./CoachDetalleAtleta";
import { puedeManejarPago } from "../../lib/helpers";

export default function CoachPanel({
  tabCoach,
  coachData,
  tienda,
  promociones,
  atletaSeleccionado,
  onSeleccionarAtleta,
  onVolverALista,
  onAtletaActualizada,
  esDueno = false,
}) {
  const {
    atletas,
    pendientes,
    revocados,
    planes,
    grupos,
    gruposDisponibles,
    pagadoEsteMes,
    periodoPagos,
    setPeriodoPagos,
    pagosPeriodo,
    pagadoEnPeriodo,
    ingresosPeriodo,
    cobrarCuota,
    revertirPago,
    guardarPrecioPlan,
    guardarGrupoAtleta,
    guardarDisciplinaAtleta,
    guardarHybridAtleta,
    cargarRMsAtleta,
    aprobarAtleta,
    rechazarAtleta,
    revocarAtleta,
    reactivarAtleta,
  } = coachData;

  // Atletas cuyo pago puede ver este usuario: todos para un dueño, solo
  // Kids/Teens para un profe. Las estadísticas de pago se calculan sobre
  // ese subconjunto (un profe no puede saber si pagó un atleta de Crossfit).
  const verPago = (a) => puedeManejarPago(esDueno, a);
  const atletasConPago = atletas.filter(verPago);
  const alDia = atletasConPago.filter((a) => pagadoEsteMes(a.id)).length;
  const deben = atletasConPago.length - alDia;
  const sufijoProfe = esDueno ? "" : " · Kids/Teens";

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
          { label: `Al día${sufijoProfe}`, val: alDia, color: "#4ade80" },
          { label: `Deben${sufijoProfe}`, val: deben, color: "#f87171" },
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
              verPago={verPago}
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
                onGuardarHybrid={guardarHybridAtleta}
                esDueno={esDueno}
              />
            </div>
          )}
        </div>
      )}

      {/* Solicitudes, Tienda y Promos: solo dueños (además de ocultar la tab,
          se chequea acá por si se llega por otro camino) */}
      {tabCoach === "solicitudes" && esDueno && (
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
          atletas={atletasConPago}
          esDueno={esDueno}
          pagos={pagosPeriodo}
          planes={planes}
          periodo={periodoPagos}
          onCambiarPeriodo={setPeriodoPagos}
          pagadoEnPeriodo={pagadoEnPeriodo}
          ingresosPeriodo={ingresosPeriodo}
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
          verPago={verPago}
        />
      )}

      {tabCoach === "tienda" && esDueno && <CoachTienda tienda={tienda} />}

      {tabCoach === "promos" && esDueno && <CoachPromos promociones={promociones} />}
    </>
  );
}
