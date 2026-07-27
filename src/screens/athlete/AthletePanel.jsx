// ── PANTALLA: PANEL ATLETA ────────────────────────────────────────────────────
import AthleteResumen from "./AthleteResumen";
import AthleteRM from "./AthleteRM";
import AthleteForTime from "./AthleteForTime";
import AthleteLogros from "./AthleteLogros";
import AthletePerfil from "./AthletePerfil";

export default function AthletePanel({
  tabAtleta,
  movSeleccionado,
  onCambiarMovimiento,
  onIrARM,
  perfil,
  usuario,
  athleteData,
  guardando,
}) {
  const { registrosRM, forTimes, gruposDisponibles, guardarRM, guardarFT, setLogro } = athleteData;

  return (
    <>
      {tabAtleta === "perfil" && (
        <AthletePerfil perfil={perfil} usuario={usuario} gruposDisponibles={gruposDisponibles} />
      )}
      {tabAtleta === "resumen" && <AthleteResumen registrosRM={registrosRM} onIrARM={onIrARM} />}
      {tabAtleta === "rm" && (
        <AthleteRM
          registrosRM={registrosRM}
          movSeleccionado={movSeleccionado}
          onCambiarMovimiento={onCambiarMovimiento}
          onGuardarRM={guardarRM}
          guardando={guardando}
        />
      )}
      {tabAtleta === "fortime" && (
        <AthleteForTime forTimes={forTimes} onGuardarFT={guardarFT} guardando={guardando} />
      )}
      {tabAtleta === "logros" && (
        <AthleteLogros registrosRM={registrosRM} forTimes={forTimes} onCompartir={setLogro} />
      )}
    </>
  );
}
