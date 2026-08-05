import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useAthleteData } from "./hooks/useAthleteData";
import { useAttendance } from "./hooks/useAttendance";
import { useCoachData } from "./hooks/useCoachData";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import { globalStyles } from "./styles/globalStyles";
import { Y } from "./lib/constants";

import LoginScreen from "./screens/LoginScreen";
import EstadoCuentaScreen from "./screens/EstadoCuentaScreen";
import AppShell from "./components/layout/AppShell";
import AthletePanel from "./screens/athlete/AthletePanel";
import CoachPanel from "./screens/coach/CoachPanel";
import TarjetaLogro from "./components/shared/TarjetaLogro";
import InactivityWarningModal from "./components/shared/InactivityWarningModal";

const TABS_ATLETA = [
  ["resumen", "📊 Resumen"],
  ["asistencia", "📷 Asistencia"],
  ["rm", "⚡ RMs"],
  ["fortime", "⏱ For Time"],
  ["logros", "🏆 Logros"],
  ["perfil", "👤 Perfil"],
];

const TABS_COACH = [
  ["atletas", "Atletas"],
  ["solicitudes", "Solicitudes"],
  ["pagos", "Pagos"],
  ["grupos", "Grupos"],
];

export default function App() {
  const { pantalla, usuario, perfil, cargando, login, registrar, logout } =
    useAuth();

  // ── ESTADOS DE NAVEGACIÓN ────────────────────────────────────────────────
  const [tabAtleta, setTabAtleta] = useState("resumen");
  const [movSeleccionado, setMovSeleccionado] = useState("Back Squat");
  const [tabCoach, setTabCoach] = useState("atletas");
  const [atletaSeleccionado, setAtletaSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── DATOS ─────────────────────────────────────────────────────────────────
  const athleteDataRaw = useAthleteData(usuario, pantalla === "athlete");
  const attendanceData = useAttendance(usuario, pantalla === "athlete");
  const coachData = useCoachData(usuario, pantalla === "coach");

  // Envuelve las acciones de guardado para mostrar el spinner mientras corren
  const athleteData = {
    ...athleteDataRaw,
    guardarRM: async (mov, valor) => {
      setGuardando(true);
      const ok = await athleteDataRaw.guardarRM(mov, valor);
      setGuardando(false);
      return ok;
    },
    guardarFT: async (nombre, tiempo) => {
      setGuardando(true);
      const ok = await athleteDataRaw.guardarFT(nombre, tiempo);
      setGuardando(false);
      return ok;
    },
  };

  // ── CIERRE DE SESIÓN POR INACTIVIDAD ─────────────────────────────────────
  const sesionActiva = pantalla === "athlete" || pantalla === "coach";
  const { avisoVisible, segundosRestantes, seguirConectado } =
    useInactivityLogout(sesionActiva, logout);

  // ── NAVEGACIÓN: volver al inicio al clickear el logo ────────────────────
  const handleLogoClick = () => {
    if (pantalla === "athlete") setTabAtleta("resumen");
    if (pantalla === "coach") {
      setTabCoach("atletas");
      setAtletaSeleccionado(null);
    }
  };

  // Seleccionar atleta desde el panel coach (lista -> detalle)
  const handleSeleccionarAtleta = (atleta) => {
    setAtletaSeleccionado(atleta);
    setTabCoach("detalle_atleta");
  };

  // Volver a la lista de atletas desde el detalle
  const handleVolverALista = () => {
    setTabCoach("atletas");
    setAtletaSeleccionado(null);
  };

  // Actualizar en pantalla el atleta seleccionado tras guardar grupo/disciplina
  // (la base de datos ya se actualizó; esto solo refleja el cambio sin recargar todo)
  const handleAtletaActualizada = (patch) => {
    setAtletaSeleccionado((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  // Ir directo a cargar un RM desde el resumen del atleta
  const handleIrARM = (movimiento) => {
    setMovSeleccionado(movimiento);
    setTabAtleta("rm");
  };

  // ── PANTALLA DE CARGA ─────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{globalStyles}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 48,
              letterSpacing: 8,
              color: Y,
              lineHeight: 1,
            }}
          >
            RAGNAR
          </div>
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: "#999",
              letterSpacing: 4,
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  // ── PANTALLA: LOGIN ────────────────────────────────────────────────────────
  if (pantalla === "login") {
    return (
      <>
        <style>{globalStyles}</style>
        <LoginScreen onLogin={login} onRegistro={registrar} />
      </>
    );
  }

  // ── PANTALLA: CUENTA PENDIENTE DE APROBACIÓN O REVOCADA ──────────────────
  if (pantalla === "pendiente" || pantalla === "revocado") {
    return (
      <>
        <style>{globalStyles}</style>
        <EstadoCuentaScreen estado={pantalla} onSalir={logout} />
      </>
    );
  }

  // ── PANTALLA: ATLETA O COACH (dentro del shell responsive) ───────────────
  return (
    <>
      <style>{globalStyles}</style>
      <AppShell
        rolLabel={pantalla === "athlete" ? "Atleta" : "Coach"}
        nombreUsuario={perfil?.full_name || usuario?.email || "Admin"}
        tabs={pantalla === "athlete" ? TABS_ATLETA : TABS_COACH}
        tabActivo={
          pantalla === "athlete"
            ? tabAtleta
            : tabCoach === "detalle_atleta"
              ? "atletas"
              : tabCoach
        }
        onCambiarTab={pantalla === "athlete" ? setTabAtleta : setTabCoach}
        onLogoClick={handleLogoClick}
        onSalir={logout}
        badges={
          pantalla === "coach" && coachData.pendientes.length > 0
            ? { solicitudes: coachData.pendientes.length }
            : {}
        }
      >
        {pantalla === "athlete" && (
          <AthletePanel
            tabAtleta={tabAtleta}
            movSeleccionado={movSeleccionado}
            onCambiarMovimiento={setMovSeleccionado}
            onIrARM={handleIrARM}
            perfil={perfil}
            usuario={usuario}
            athleteData={athleteData}
            attendanceData={attendanceData}
            guardando={guardando}
          />
        )}

        {pantalla === "coach" && (
          <CoachPanel
            tabCoach={tabCoach}
            coachData={coachData}
            atletaSeleccionado={atletaSeleccionado}
            onSeleccionarAtleta={handleSeleccionarAtleta}
            onVolverALista={handleVolverALista}
            onAtletaActualizada={handleAtletaActualizada}
          />
        )}
      </AppShell>

      {/* Tarjeta de logro (overlay) */}
      {athleteData.logro && (
        <TarjetaLogro
          logro={athleteData.logro}
          nombreAtleta={perfil?.full_name}
          onCerrar={() => athleteData.setLogro(null)}
        />
      )}

      {/* Aviso de inactividad (overlay) */}
      {avisoVisible && (
        <InactivityWarningModal
          segundosRestantes={segundosRestantes}
          onSeguirConectado={seguirConectado}
        />
      )}
    </>
  );
}
