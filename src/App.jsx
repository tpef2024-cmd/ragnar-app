import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useAthleteData } from "./hooks/useAthleteData";
import { useAttendance } from "./hooks/useAttendance";
import { useCoachData } from "./hooks/useCoachData";
import { useTiendaCoach } from "./hooks/useTienda";
import { usePromocionCoach } from "./hooks/usePromocion";
import { useHybridData } from "./hooks/useHybridData";
import { useRagnerosAdmin } from "./hooks/useRagnerosAdmin";
import { useInactivityLogout } from "./hooks/useInactivityLogout";
import { globalStyles } from "./styles/globalStyles";
import { Y } from "./lib/constants";

import LoginScreen from "./screens/LoginScreen";
import EstadoCuentaScreen from "./screens/EstadoCuentaScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import AppShell from "./components/layout/AppShell";
import AthletePanel from "./screens/athlete/AthletePanel";
import CoachPanel from "./screens/coach/CoachPanel";
import AthleteBeneficios from "./screens/athlete/AthleteBeneficios";
import MerchantPanel from "./screens/merchant/MerchantPanel";
import { TABS_COMERCIO, esTabComercio } from "./screens/merchant/tabsComercio";
import TarjetaLogro from "./components/shared/TarjetaLogro";
import InactivityWarningModal from "./components/shared/InactivityWarningModal";

const TABS_ATLETA = [
  ["resumen", "📊 Resumen"],
  ["asistencia", "📷 Asistencia"],
  ["rm", "⚡ RMs"],
  ["fortime", "⏱ For Time"],
  ["reps", "🔥 Reps"],
  ["hibrido", "🔁 Híbrido"],
  ["logros", "🏆 Logros"],
  ["beneficios", "🎟 Beneficios"],
  ["perfil", "👤 Perfil"],
];

// Tabs que ve un profe (coach sin is_owner). El dueño ve TABS_COACH completo.
const TABS_PROFE = ["atletas", "pagos", "grupos", "hibrido"];

const TABS_COACH = [
  ["atletas", "Atletas"],
  ["solicitudes", "Solicitudes"],
  ["pagos", "Pagos"],
  ["grupos", "Grupos"],
  ["tienda", "Tienda"],
  ["promos", "Promos"],
  ["hibrido", "Híbrido"],
  ["ragneros", "Ragneros"],
];

export default function App() {
  const {
    pantalla,
    usuario,
    perfil,
    comercio,
    recargarComercio,
    cargando,
    login,
    registrar,
    registrarComercio,
    logout,
    enviarRecuperacion,
    actualizarPassword,
    actualizarPerfil,
  } = useAuth();

  // ── PROFES QUE TAMBIÉN ENTRENAN ──────────────────────────────────────────
  // Un coach puede pasar a la vista de atleta (sus propios RMs, asistencia,
  // logros) y volver. `modo` es lo que se muestra; `pantalla` sigue siendo
  // su rol real. Se recuerda la última vista elegida en este dispositivo.
  const [vistaCoach, setVistaCoach] = useState(() => {
    try {
      return localStorage.getItem("ragnar_vista_coach") === "athlete" ? "athlete" : "coach";
    } catch {
      return "coach";
    }
  });
  const modo = pantalla === "coach" ? vistaCoach : pantalla;
  const cambiarVistaCoach = () => {
    const nueva = vistaCoach === "coach" ? "athlete" : "coach";
    setVistaCoach(nueva);
    try {
      localStorage.setItem("ragnar_vista_coach", nueva);
    } catch {
      // sin storage (modo privado): la vista elegida vale solo para esta sesión
    }
  };

  // ── ESTADOS DE NAVEGACIÓN ────────────────────────────────────────────────
  const [tabAtleta, setTabAtleta] = useState("resumen");
  const [movSeleccionado, setMovSeleccionado] = useState("Back Squat");
  const [tabCoach, setTabCoach] = useState("atletas");
  const [tabComercio, setTabComercio] = useState("escanear");
  const [atletaSeleccionado, setAtletaSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── DATOS ─────────────────────────────────────────────────────────────────
  const athleteDataRaw = useAthleteData(usuario, modo === "athlete");
  const attendanceData = useAttendance(usuario, modo === "athlete");
  // Dueño = coach con is_owner. Los profes no cargan tienda ni promos.
  const esDueno = pantalla === "coach" && !!perfil?.is_owner;
  const coachData = useCoachData(usuario, pantalla === "coach");
  const tienda = useTiendaCoach(usuario, esDueno);
  const promociones = usePromocionCoach(usuario, esDueno);
  // Comercios Ragneros y descuentos: los administran solo los dueños
  const ragnerosData = useRagnerosAdmin(usuario, esDueno && modo === "coach");
  const tabsCoach = esDueno
    ? TABS_COACH
    : TABS_COACH.filter(([key]) => TABS_PROFE.includes(key));

  // Híbrido: los testeos los administran dueño y profes; la tab del atleta
  // solo aparece si tiene la disciplina complementaria Hybrid (is_hybrid).
  // En vista coach trae todos los testeos (incluso ocultos) y las marcas de todos.
  const hybridData = useHybridData(
    usuario,
    modo === "athlete" || modo === "coach",
    modo === "coach",
  );
  // Un atleta (o profe en su vista de atleta) con comercio Ragnero aprobado
  // suma las tabs de comercio: Escanear / Canjes / Mi comercio.
  const tieneComercio = comercio?.status === "approved";
  const tabsAtleta = [
    ...(perfil?.is_hybrid ? TABS_ATLETA : TABS_ATLETA.filter(([key]) => key !== "hibrido")),
    ...(tieneComercio ? TABS_COMERCIO : []),
  ];

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
    guardarReps: async (ejercicio, timeCap, resultado) => {
      setGuardando(true);
      const ok = await athleteDataRaw.guardarReps(
        ejercicio,
        timeCap,
        resultado,
      );
      setGuardando(false);
      return ok;
    },
  };

  // ── CIERRE DE SESIÓN POR INACTIVIDAD ─────────────────────────────────────
  const sesionActiva = pantalla === "athlete" || pantalla === "coach" || pantalla === "merchant";
  const { avisoVisible, segundosRestantes, seguirConectado } =
    useInactivityLogout(sesionActiva, logout);

  // ── NAVEGACIÓN: volver al inicio al clickear el logo ────────────────────
  const handleLogoClick = () => {
    if (modo === "athlete") setTabAtleta("resumen");
    if (modo === "merchant") setTabComercio("escanear");
    if (modo === "coach") {
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
        <LoginScreen
          onLogin={login}
          onRegistro={registrar}
          onRegistroComercio={registrarComercio}
          onEnviarRecuperacion={enviarRecuperacion}
        />
      </>
    );
  }

  // ── PANTALLA: RESTABLECER CONTRASEÑA (desde el link del mail) ────────────
  if (pantalla === "recuperar_password") {
    return (
      <>
        <style>{globalStyles}</style>
        <ResetPasswordScreen onActualizarPassword={actualizarPassword} />
      </>
    );
  }

  // ── PANTALLA: CUENTA PENDIENTE DE APROBACIÓN O REVOCADA ──────────────────
  if (pantalla === "pendiente" || pantalla === "revocado") {
    return (
      <>
        <style>{globalStyles}</style>
        <EstadoCuentaScreen estado={pantalla} esComercio={perfil?.role === "merchant"} onSalir={logout} />
      </>
    );
  }

  // ── PANTALLA: ATLETA O COACH (dentro del shell responsive) ───────────────
  return (
    <>
      <style>{globalStyles}</style>
      <AppShell
        rolLabel={
          modo === "merchant"
            ? "Comercio Ragnero"
            : modo === "athlete"
              ? pantalla === "coach"
                ? "Modo atleta"
                : tieneComercio
                  ? "Atleta · Ragnero"
                  : "Atleta"
              : esDueno
                ? "Dueño"
                : "Coach"
        }
        nombreUsuario={perfil?.full_name || usuario?.email || "Admin"}
        tabs={modo === "merchant" ? TABS_COMERCIO : modo === "athlete" ? tabsAtleta : tabsCoach}
        tabActivo={
          modo === "merchant"
            ? tabComercio
            : modo === "athlete"
              ? tabAtleta
              : tabCoach === "detalle_atleta"
                ? "atletas"
                : tabCoach
        }
        onCambiarTab={modo === "merchant" ? setTabComercio : modo === "athlete" ? setTabAtleta : setTabCoach}
        onLogoClick={handleLogoClick}
        onSalir={logout}
        vistaAlternativa={
          pantalla === "coach"
            ? modo === "coach"
              ? "Mi vista de atleta"
              : "Volver al panel coach"
            : null
        }
        onCambiarVista={cambiarVistaCoach}
        badges={
          modo === "coach" && esDueno
            ? {
                ...(coachData.pendientes.length > 0 && { solicitudes: coachData.pendientes.length }),
                ...(ragnerosData.pendientes.length > 0 && { ragneros: ragnerosData.pendientes.length }),
              }
            : {}
        }
      >
        {modo === "athlete" && (
          <AthletePanel
            tabAtleta={tabAtleta}
            movSeleccionado={movSeleccionado}
            onCambiarMovimiento={setMovSeleccionado}
            onIrARM={handleIrARM}
            perfil={perfil}
            usuario={usuario}
            athleteData={athleteData}
            attendanceData={attendanceData}
            hybridData={hybridData}
            guardando={guardando}
            onGuardarPerfil={actualizarPerfil}
          />
        )}

        {modo === "athlete" && tabAtleta === "beneficios" && (
          <AthleteBeneficios
            usuario={usuario}
            perfil={perfil}
            comercio={comercio}
            onComercioSolicitado={recargarComercio}
          />
        )}

        {/* Tabs de comercio: para la cuenta comercio, o el atleta con comercio aprobado */}
        {modo === "merchant" && <MerchantPanel tab={tabComercio} usuario={usuario} />}
        {modo === "athlete" && tieneComercio && esTabComercio(tabAtleta) && (
          <MerchantPanel tab={tabAtleta} usuario={usuario} />
        )}

        {modo === "coach" && (
          <CoachPanel
            tabCoach={tabCoach}
            coachData={coachData}
            tienda={tienda}
            promociones={promociones}
            hybridData={hybridData}
            ragnerosData={ragnerosData}
            atletaSeleccionado={atletaSeleccionado}
            onSeleccionarAtleta={handleSeleccionarAtleta}
            onVolverALista={handleVolverALista}
            onAtletaActualizada={handleAtletaActualizada}
            esDueno={esDueno}
            usuarioId={usuario?.id}
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
