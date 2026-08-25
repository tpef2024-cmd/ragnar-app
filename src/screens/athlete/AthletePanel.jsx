// ── PANTALLA: PANEL ATLETA ────────────────────────────────────────────────────
import { lazy, Suspense } from "react";
import AthleteResumen from "./AthleteResumen";
import AthleteRM from "./AthleteRM";
import AthleteForTime from "./AthleteForTime";
import AthleteReps from "./AthleteReps";
import AthleteLogros from "./AthleteLogros";
import AthletePerfil from "./AthletePerfil";

// Carga diferida: html5-qrcode es una librería pesada (~350kb) que solo hace
// falta cuando el atleta entra a la pestaña de Asistencia — así no infla el
// bundle inicial para todo el resto de la app.
const AthleteAsistencia = lazy(() => import("./AthleteAsistencia"));

export default function AthletePanel({
  tabAtleta,
  movSeleccionado,
  onCambiarMovimiento,
  onIrARM,
  perfil,
  usuario,
  athleteData,
  attendanceData,
  guardando,
}) {
  const {
    registrosRM,
    forTimes,
    repsRecords,
    gruposDisponibles,
    guardarRM,
    guardarFT,
    guardarReps,
    setLogro,
  } = athleteData;
  const { asistenciaHoy, historialAsistencia, registrarAsistencia } =
    attendanceData;

  return (
    <>
      {tabAtleta === "perfil" && (
        <AthletePerfil
          perfil={perfil}
          usuario={usuario}
          gruposDisponibles={gruposDisponibles}
        />
      )}
      {tabAtleta === "resumen" && (
        <AthleteResumen registrosRM={registrosRM} discipline={perfil?.discipline} onIrARM={onIrARM} />
      )}
      {tabAtleta === "asistencia" && (
        <Suspense
          fallback={
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#555",
                fontSize: 11,
              }}
            >
              Cargando...
            </div>
          }
        >
          <AthleteAsistencia
            asistenciaHoy={asistenciaHoy}
            historialAsistencia={historialAsistencia}
            onRegistrarAsistencia={registrarAsistencia}
          />
        </Suspense>
      )}
      {tabAtleta === "rm" && (
        <AthleteRM
          registrosRM={registrosRM}
          discipline={perfil?.discipline}
          movSeleccionado={movSeleccionado}
          onCambiarMovimiento={onCambiarMovimiento}
          onGuardarRM={guardarRM}
          guardando={guardando}
        />
      )}
      {tabAtleta === "fortime" && (
        <AthleteForTime
          forTimes={forTimes}
          onGuardarFT={guardarFT}
          guardando={guardando}
        />
      )}
      {tabAtleta === "reps" && (
        <AthleteReps
          repsRecords={repsRecords}
          onGuardarReps={guardarReps}
          guardando={guardando}
        />
      )}
      {tabAtleta === "logros" && (
        <AthleteLogros
          registrosRM={registrosRM}
          forTimes={forTimes}
          repsRecords={repsRecords}
          discipline={perfil?.discipline}
          onCompartir={setLogro}
        />
      )}
    </>
  );
}
