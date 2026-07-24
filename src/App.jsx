import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CONEXIÓN A SUPABASE ───────────────────────────────────────────────────────
const SUPABASE_URL = "https://vpachxutgcwtdikdatrf.supabase.co";
const SUPABASE_KEY = "sb_publishable_TS6cGjRNS5fm1q5S1zgE5g_jxGdIfqP";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CONSTANTES GLOBALES ───────────────────────────────────────────────────────
const MOVIMIENTOS = [
  "Back Squat",
  "Deadlift",
  "Clean & Jerk",
  "Snatch",
  "Press",
  "Bench Press",
];
const PORCENTAJES = [50, 60, 70, 75, 80, 85, 90, 95, 100];
const DISCIPLINAS = ["Crossfit", "Funcional", "Adultos Mayores", "Niños"];
const Y = "#F5C400"; // amarillo Ragnar
const BG = "#0a0a0a"; // fondo negro
const CARD = "#111111"; // fondo tarjeta
const BORDER = "#1e1e1e"; // borde sutil

// ── HORARIOS Y FRECUENCIAS DISPONIBLES ───────────────────────────────────────
const HORARIOS = ["7AM", "8AM", "10AM", "6PM", "8PM"];
const FRECUENCIAS = [
  "2x semana",
  "3x semana",
  "4x semana",
  "5x semana",
  "6x semana",
];

// ── COMPONENTE: SELECTOR DE GRUPO (horario + frecuencia) ─────────────────────
const SelectorGrupo = ({ grupos, onSeleccionar, onCancelar }) => {
  const [horario, setHorario] = useState("");
  const [frecuencia, setFrecuencia] = useState("");

  // Buscar el grupo que coincide con la combinación seleccionada
  const grupoSeleccionado = grupos.find(
    (g) => g.name === `${horario} — ${frecuencia}`,
  );

  const estiloSelect = {
    width: "100%",
    background: "#080808",
    border: "1px solid #2a2a2a",
    color: "#f0ede6",
    fontFamily: "'DM Mono',monospace",
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
    marginBottom: 10,
    appearance: "auto",
  };

  return (
    <div>
      <div
        style={{
          fontSize: 9,
          color: "#444",
          letterSpacing: 2,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        Horario
      </div>
      <select
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        style={estiloSelect}
      >
        <option value="" disabled>
          Seleccioná horario...
        </option>
        {HORARIOS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <div
        style={{
          fontSize: 9,
          color: "#444",
          letterSpacing: 2,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        Frecuencia semanal
      </div>
      <select
        value={frecuencia}
        onChange={(e) => setFrecuencia(e.target.value)}
        style={estiloSelect}
      >
        <option value="" disabled>
          Seleccioná frecuencia...
        </option>
        {FRECUENCIAS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {/* Botón confirmar — aparece solo cuando ambos están seleccionados */}
      {grupoSeleccionado && (
        <button
          onClick={() => onSeleccionar(grupoSeleccionado.id)}
          style={{
            width: "100%",
            background: "#1a1500",
            border: `1px solid ${Y}`,
            color: Y,
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            padding: "10px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ✓ Confirmar — {grupoSeleccionado.name}
        </button>
      )}
      {onCancelar && (
        <button
          onClick={onCancelar}
          style={{
            background: "transparent",
            border: "1px solid #1e1e1e",
            color: "#444",
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: 2,
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

// ── COMPONENTE: LOGO RAGNAR ───────────────────────────────────────────────────
const LogoRagnar = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 30,
        letterSpacing: 6,
        color: "#fff",
        lineHeight: 1,
      }}
    >
      RAGNAR
    </div>
    <div
      style={{
        fontSize: 9,
        letterSpacing: 5,
        color: Y,
        textTransform: "uppercase",
        lineHeight: 1.4,
      }}
    >
      Cross Training
    </div>
  </div>
);

// ── COMPONENTE: TARJETA DE LOGRO (para compartir) ────────────────────────────
const TarjetaLogro = ({ logro, nombreAtleta, onCerrar }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    }}
  >
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div
        style={{
          background: "#0d0d0d",
          border: `2px solid ${Y}`,
          borderRadius: 4,
          padding: 32,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {/* Fondo con patrón diagonal */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg,${Y}08 0px,${Y}08 1px,transparent 1px,transparent 12px)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 36,
              letterSpacing: 8,
              color: Y,
              lineHeight: 1,
            }}
          >
            RAGNAR
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 11,
            letterSpacing: 6,
            color: Y,
            marginBottom: 4,
          }}
        >
          RAGNAR CROSS TRAINING
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 64,
            lineHeight: 1,
            color: "#fff",
            textShadow: `0 0 40px ${Y}66`,
            marginBottom: 4,
          }}
        >
          {logro.value}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 20,
            color: Y,
            letterSpacing: 4,
            marginBottom: 14,
          }}
        >
          {logro.movement}
        </div>
        <div
          style={{ width: 50, height: 2, background: Y, margin: "0 auto 14px" }}
        />
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            color: "#888",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          {logro.type === "rm"
            ? "NUEVO RÉCORD PERSONAL"
            : "NUEVO PR — FOR TIME"}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 12,
            color: "#ccc",
          }}
        >
          {nombreAtleta}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            color: "#333",
            letterSpacing: 3,
          }}
        >
          {new Date()
            .toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
            .toUpperCase()}
        </div>
      </div>
      <button
        onClick={onCerrar}
        style={{
          width: "100%",
          padding: 12,
          background: "transparent",
          border: "1px solid #333",
          borderRadius: 2,
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          letterSpacing: 2,
          color: "#555",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
);

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function App() {
  // Estados de autenticación
  const [pantalla, setPantalla] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [modoAuth, setModoAuth] = useState("login"); // "login" | "register"
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados del panel atleta
  const [tabAtleta, setTabAtleta] = useState("rm");
  const [movSeleccionado, setMovSeleccionado] = useState("Back Squat");
  const [registrosRM, setRegistrosRM] = useState([]);
  const [forTimes, setForTimes] = useState([]);
  const [nuevoRM, setNuevoRM] = useState("");
  const [nuevoFTNombre, setNuevoFTNombre] = useState("");
  const [nuevoFTTiempo, setNuevoFTTiempo] = useState("");
  const [logro, setLogro] = useState(null);
  const [gruprosDisponibles, setGruposDisponibles] = useState([]);
  const [cambiandoGrupo, setCambiandoGrupo] = useState(false);

  // Estados del panel coach
  const [tabCoach, setTabCoach] = useState("atletas");
  const [atletas, setAtletas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [atletaSeleccionado, setAtletaSeleccionado] = useState(null);
  const [movAtleta, setMovAtleta] = useState("Back Squat");
  const [rmsAtleta, setRmsAtleta] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [coachAsignandoGrupo, setCoachAsignandoGrupo] = useState(false);
  const [filtroDisciplina, setFiltroDisciplina] = useState("todas");

  // El registro siempre crea atletas — los coaches se crean manualmente en Supabase
  const rolRegistro = "athlete";
  const [nombreRegistro, setNombreRegistro] = useState("");

  // ── AUTENTICACIÓN ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Verificar sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) cargarUsuario(session.user);
      else setCargando(false);
    });
    // Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) cargarUsuario(session.user);
      else {
        setUsuario(null);
        setPerfil(null);
        setPantalla("login");
        setCargando(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil del usuario y redirigir según rol
  const cargarUsuario = async (u) => {
    setUsuario(u);
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    setPerfil(prof);
    setPantalla(prof?.role === "coach" ? "coach" : "athlete");
    setCargando(false);
  };

  // Iniciar sesión
  const handleLogin = async () => {
    setErrorAuth("");
    setGuardando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErrorAuth("Email o contraseña incorrectos");
    setGuardando(false);
  };

  // Registrar nuevo atleta
  const handleRegistro = async () => {
    setErrorAuth("");
    setGuardando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombreRegistro } },
    });
    if (error) {
      setErrorAuth(error.message);
      setGuardando(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: nombreRegistro,
          role: rolRegistro,
        },
        { onConflict: "id" },
      );
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setPerfil(prof);
    }
    setGuardando(false);
  };

  // Cerrar sesión
  const handleSalir = async () => {
    await supabase.auth.signOut();
  };

  // ── CARGA DE DATOS ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pantalla === "athlete" && usuario) {
      cargarRMs();
      cargarForTimes();
      cargarGruposDisponibles();
    }
    if (pantalla === "coach" && usuario) {
      cargarAtletas();
      cargarPagos();
      cargarGrupos();
      cargarGruposDisponibles();
    }
  }, [pantalla, usuario]);

  // Cargar todos los grupos disponibles (para selector)
  const cargarGruposDisponibles = async () => {
    const { data } = await supabase.from("groups").select("*").order("name");
    setGruposDisponibles(data || []);
  };

  // Guardar grupo del atleta (lo hace el coach)
  const guardarGrupoAtleta = async (atletaId, grupoId) => {
    await supabase
      .from("profiles")
      .update({ group_id: grupoId })
      .eq("id", atletaId);
    await cargarAtletas();
    const { data: actualizado } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("id", atletaId)
      .single();
    if (actualizado) setAtletaSeleccionado(actualizado);
    setCoachAsignandoGrupo(false);
  };

  // Cargar RMs del atleta logueado
  const cargarRMs = async () => {
    const { data } = await supabase
      .from("rm_records")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("recorded_at", { ascending: false });
    setRegistrosRM(data || []);
  };

  // Cargar For Times del atleta logueado
  const cargarForTimes = async () => {
    const { data } = await supabase
      .from("for_time_records")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("recorded_at", { ascending: false });
    setForTimes(data || []);
  };

  // Cargar lista de atletas (para el coach)
  const cargarAtletas = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("role", "athlete");
    setAtletas(data || []);
  };

  // Cargar pagos del mes actual
  const cargarPagos = async () => {
    const ahora = new Date();
    const { data, error } = await supabase
      .from("payments")
      .select("athlete_id, status, period_month, period_year")
      .eq("period_month", ahora.getMonth() + 1)
      .eq("period_year", ahora.getFullYear())
      .eq("status", "paid");
    if (!error) setPagos(data || []);
  };

  // Cargar grupos creados
  const cargarGrupos = async () => {
    const { data } = await supabase.from("groups").select("*");
    setGrupos(data || []);
  };

  // ── GUARDAR DATOS ─────────────────────────────────────────────────────────

  // Guardar nuevo RM
  const guardarRM = async () => {
    if (!nuevoRM || isNaN(nuevoRM)) return;
    setGuardando(true);
    const valor = parseFloat(nuevoRM);
    const anterior = obtenerRMActual(movSeleccionado);
    const { error } = await supabase.from("rm_records").insert({
      athlete_id: usuario.id,
      movement: movSeleccionado,
      weight_kg: valor,
    });
    if (!error) {
      await cargarRMs();
      setNuevoRM("");
      // Mostrar tarjeta de logro si es un nuevo récord
      if (!anterior || valor > anterior)
        setLogro({
          type: "rm",
          movement: movSeleccionado,
          value: `${valor}kg`,
        });
    }
    setGuardando(false);
  };

  // Guardar nuevo For Time
  const guardarFT = async () => {
    if (!nuevoFTNombre || !nuevoFTTiempo) return;
    setGuardando(true);
    // Convertir "4:32" a segundos
    const partes = nuevoFTTiempo.split(":");
    const segundos =
      partes.length === 2
        ? parseInt(partes[0]) * 60 + parseInt(partes[1])
        : parseInt(partes[0]);
    const { error } = await supabase.from("for_time_records").insert({
      athlete_id: usuario.id,
      workout_name: nuevoFTNombre,
      time_seconds: segundos,
    });
    if (!error) {
      await cargarForTimes();
      setLogro({
        type: "fortime",
        movement: nuevoFTNombre,
        value: nuevoFTTiempo,
      });
      setNuevoFTNombre("");
      setNuevoFTTiempo("");
    }
    setGuardando(false);
  };

  // Marcar pago como realizado (solo coach)
  const marcarPagado = async (atletaId) => {
    const ahora = new Date();
    // Evitar duplicados
    const yaPago = pagos.some(
      (p) => p.athlete_id === atletaId && p.status === "paid",
    );
    if (yaPago) return;
    // Actualizar estado local inmediatamente para feedback visual
    const pagoTemporal = {
      athlete_id: atletaId,
      status: "paid",
      period_month: ahora.getMonth() + 1,
      period_year: ahora.getFullYear(),
    };
    setPagos((prev) => [...prev, pagoTemporal]);
    // Guardar en la base de datos
    await supabase.from("payments").insert({
      athlete_id: atletaId,
      amount: 0,
      period_month: ahora.getMonth() + 1,
      period_year: ahora.getFullYear(),
      method: "manual",
      status: "paid",
      registered_by: usuario.id,
    });
    // Recargar datos reales
    await cargarPagos();
    await cargarAtletas();
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────

  // Obtener el RM más reciente para un movimiento
  const obtenerRMActual = (mov) => {
    const reg = registrosRM.find((r) => r.movement === mov);
    return reg ? parseFloat(reg.weight_kg) : null;
  };

  // Formatear segundos a "min:seg"
  const formatearTiempo = (segs) => {
    if (!segs) return "—";
    const m = Math.floor(segs / 60);
    const s = segs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Verificar si un atleta pagó este mes
  const pagadoEsteMes = (atletaId) => {
    return pagos.some((p) => p.athlete_id === atletaId && p.status === "paid");
  };

  // Cargar RMs de un atleta específico (vista coach)
  const cargarRMsAtleta = async (atletaId) => {
    const { data } = await supabase
      .from("rm_records")
      .select("*")
      .eq("athlete_id", atletaId)
      .order("recorded_at", { ascending: false });
    setRmsAtleta(data || []);
  };

  // Seleccionar atleta para ver su detalle
  const seleccionarAtleta = (atleta) => {
    setAtletaSeleccionado(atleta);
    setMovAtleta("Back Squat");
    cargarRMsAtleta(atleta.id);
    setTabCoach("detalle_atleta");
  };

  // Obtener RM de un atleta para un movimiento (vista coach)
  const obtenerRMAtleta = (mov) => {
    const reg = rmsAtleta.find((r) => r.movement === mov);
    return reg ? parseFloat(reg.weight_kg) : null;
  };

  // RM actual del movimiento seleccionado
  const rmActual = obtenerRMActual(movSeleccionado);

  // ── ESTILOS CSS GLOBALES ──────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:${Y}}
    .tab{padding:10px 16px;background:transparent;border:none;border-bottom:2px solid transparent;
      color:#444;font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;
      letter-spacing:2px;cursor:pointer;transition:all .2s}
    .tab.on{color:${Y};border-bottom-color:${Y}}
    .tab:hover{color:#aaa}
    .card{background:${CARD};border:1px solid ${BORDER};border-radius:2px;padding:18px}
    .mov{padding:7px 12px;background:#111;border:1px solid #222;color:#555;
      font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;
      letter-spacing:1px;border-radius:2px;cursor:pointer;transition:all .15s}
    .mov.on{background:#1a1500;border-color:${Y};color:${Y}}
    .mov:hover{border-color:#444;color:#bbb}
    .fila-pct{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #161616}
    .fila-pct:last-child{border-bottom:none}
    .inp{width:100%;background:#080808;border:none;border-bottom:2px solid ${Y};
      color:#f0ede6;font-family:'DM Mono',monospace;font-size:18px;padding:10px 12px;
      outline:none;letter-spacing:1px;margin-bottom:10px}
    .inp::placeholder{color:#333}
    .btn-y{width:100%;padding:13px;background:${Y};border:none;border-radius:2px;
      font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;
      color:#0a0a0a;cursor:pointer;transition:all .15s}
    .btn-y:hover{background:#ffd633;transform:translateY(-1px)}
    .btn-y:disabled{background:#333;color:#555;transform:none;cursor:not-allowed}
    .btn-salir{background:transparent;border:1px solid #252525;color:#444;
      font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;
      padding:6px 14px;cursor:pointer;border-radius:2px;transition:all .15s;text-transform:uppercase}
    .btn-salir:hover{border-color:${Y};color:${Y}}
    .badge-ok{background:#0d2b1a;color:#4ade80;border:1px solid #166534;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
    .badge-no{background:#2b0d0d;color:#f87171;border:1px solid #991b1b;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
    .chip-disc{padding:5px 12px;border-radius:2px;border:1px solid #222;background:#111;color:#555;
      font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;transition:all .15s;text-transform:uppercase}
    .chip-disc.on{border-color:${Y};color:${Y};background:#1a1500}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .3s ease forwards}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin .8s linear infinite;display:inline-block}
  `;

  // ── PANTALLA DE CARGA ─────────────────────────────────────────────────────
  if (cargando)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{css}</style>
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
              color: "#333",
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

  // ── RENDER PRINCIPAL ──────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'DM Mono','Courier New',monospace",
        color: "#f0ede6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{css}</style>

      {/* BARRA SUPERIOR CON LOGO */}
      <div style={{ width: "100%", maxWidth: 480, padding: "20px 20px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {/* Logo clickeable — vuelve al inicio */}
          <div
            style={{ cursor: usuario ? "pointer" : "default" }}
            onClick={() => {
              if (!usuario) return;
              if (pantalla === "athlete") {
                setTabAtleta("resumen");
              }
              if (pantalla === "coach") {
                setTabCoach("atletas");
                setAtletaSeleccionado(null);
                setCoachAsignandoGrupo(false);
              }
            }}
          >
            <LogoRagnar />
          </div>
          {usuario && (
            <button className="btn-salir" onClick={handleSalir}>
              Salir
            </button>
          )}
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg,${Y},transparent)`,
          }}
        />
      </div>

      {/* ── PANTALLA: LOGIN / REGISTRO ─────────────────────────────────────── */}
      {pantalla === "login" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "36px 20px 20px" }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 24,
            }}
          >
            {[
              ["login", "Ingresar"],
              ["register", "Registrarse"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${modoAuth === k ? "on" : ""}`}
                onClick={() => setModoAuth(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {modoAuth === "register" && (
            <input
              className="inp"
              placeholder="Nombre completo"
              value={nombreRegistro}
              onChange={(e) => setNombreRegistro(e.target.value)}
            />
          )}

          <input
            className="inp"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="inp"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorAuth && (
            <div
              style={{
                color: "#f87171",
                fontSize: 10,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              {errorAuth}
            </div>
          )}

          <button
            className="btn-y"
            style={{ marginTop: 8 }}
            onClick={modoAuth === "login" ? handleLogin : handleRegistro}
            disabled={guardando}
          >
            {guardando ? (
              <span className="spin">◌</span>
            ) : modoAuth === "login" ? (
              "INGRESAR"
            ) : (
              "CREAR CUENTA"
            )}
          </button>

          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "#0c0c0c",
              border: "1px solid #181818",
              borderRadius: 2,
              fontSize: 10,
              color: "#333",
            }}
          >
            <div
              style={{
                letterSpacing: 3,
                marginBottom: 6,
                color: "#222",
                textTransform: "uppercase",
              }}
            >
              Primera vez
            </div>
            Registrate con tu email. El coach te asignará al grupo
            correspondiente.
          </div>
        </div>
      )}

      {/* ── PANTALLA: PANEL ATLETA ─────────────────────────────────────────── */}
      {pantalla === "athlete" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "24px 20px" }}
        >
          {/* Encabezado con nombre y grupo */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 9,
                color: Y,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Atleta
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 28,
                letterSpacing: 2,
              }}
            >
              {perfil?.full_name || usuario?.email}
            </div>
            {perfil?.group_id && gruprosDisponibles.length > 0 && (
              <div
                style={{
                  fontSize: 9,
                  color: "#444",
                  letterSpacing: 2,
                  marginTop: 2,
                }}
              >
                {gruprosDisponibles.find((g) => g.id === perfil.group_id)
                  ?.name || ""}
              </div>
            )}
          </div>

          {/* Tabs de navegación */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 18,
              overflowX: "auto",
            }}
          >
            {[
              ["resumen", "📊"],
              ["rm", "⚡ RMs"],
              ["fortime", "⏱"],
              ["logros", "🏆"],
              ["perfil", "👤 Perfil"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${tabAtleta === k ? "on" : ""}`}
                onClick={() => setTabAtleta(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* TAB: PERFIL ─────────────────────────────────────────────────── */}
          {tabAtleta === "perfil" && (
            <div>
              <div className="card" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Mi Perfil
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#444",
                      letterSpacing: 2,
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Nombre
                  </div>
                  <div style={{ fontSize: 16, color: "#f0ede6" }}>
                    {perfil?.full_name}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#444",
                      letterSpacing: 2,
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontSize: 14, color: "#888" }}>
                    {usuario?.email}
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Mi Grupo / Horario
                </div>
                {perfil?.group_id ? (
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 26,
                        letterSpacing: 3,
                        color: Y,
                      }}
                    >
                      {gruprosDisponibles.find((g) => g.id === perfil.group_id)
                        ?.name || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#444",
                        letterSpacing: 1,
                        marginTop: 4,
                      }}
                    >
                      {gruprosDisponibles.find((g) => g.id === perfil.group_id)
                        ?.schedule || ""}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#2a2a2a",
                        letterSpacing: 1,
                        marginTop: 10,
                      }}
                    >
                      Para cambiar de grupo contactá a tu coach.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}
                  >
                    Sin grupo asignado. Tu coach te asignará uno pronto.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RESUMEN ────────────────────────────────────────────────── */}
          {tabAtleta === "resumen" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {MOVIMIENTOS.map((m) => {
                  const val = obtenerRMActual(m);
                  return (
                    <div
                      key={m}
                      className="card"
                      style={{
                        cursor: "pointer",
                        borderColor: val ? "#2a2a2a" : BORDER,
                      }}
                      onClick={() => {
                        setMovSeleccionado(m);
                        setTabAtleta("rm");
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          letterSpacing: 2,
                          color: "#444",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {m}
                      </div>
                      {val ? (
                        <>
                          <div
                            style={{
                              fontFamily: "'Bebas Neue',sans-serif",
                              fontSize: 38,
                              lineHeight: 1,
                              color: Y,
                            }}
                          >
                            {val}
                            <span
                              style={{
                                fontSize: 14,
                                color: "#555",
                                marginLeft: 3,
                              }}
                            >
                              kg
                            </span>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            {[70, 80, 90].map((pct) => (
                              <div
                                key={pct}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 9,
                                  color: "#555",
                                  padding: "2px 0",
                                  borderTop: "1px solid #161616",
                                }}
                              >
                                <span
                                  style={{
                                    color: pct === 90 ? "#888" : "#444",
                                  }}
                                >
                                  {pct}%
                                </span>
                                <span
                                  style={{
                                    color: pct === 90 ? Y : "#666",
                                    fontFamily: "'Bebas Neue',sans-serif",
                                    fontSize: 13,
                                  }}
                                >
                                  {Math.round((val * pct) / 100)}kg
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 28,
                            color: "#222",
                            lineHeight: 1,
                          }}
                        >
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {MOVIMIENTOS.every((m) => !obtenerRMActual(m)) && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#222",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    letterSpacing: 3,
                  }}
                >
                  SIN RMs REGISTRADOS AÚN
                  <br />
                  <span style={{ fontSize: 11, color: "#1a1a1a" }}>
                    Andá a ⚡ RMs para cargar
                  </span>
                </div>
              )}
            </>
          )}

          {/* TAB: RMs ───────────────────────────────────────────────────── */}
          {tabAtleta === "rm" && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {MOVIMIENTOS.map((m) => (
                  <button
                    key={m}
                    className={`mov ${movSeleccionado === m ? "on" : ""}`}
                    onClick={() => setMovSeleccionado(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: "#333",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    1RM — {movSeleccionado}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 56,
                      lineHeight: 1,
                      color: rmActual ? Y : "#1e1e1e",
                    }}
                  >
                    {rmActual || "—"}
                    {rmActual && (
                      <span
                        style={{ fontSize: 20, color: "#fff", marginLeft: 6 }}
                      >
                        kg
                      </span>
                    )}
                  </div>
                </div>

                {rmActual ? (
                  <>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: 3,
                        color: "#333",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Porcentajes
                    </div>
                    {PORCENTAJES.map((p) => (
                      <div key={p} className="fila-pct">
                        <div
                          style={{
                            width: 44,
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 20,
                            color: p >= 85 ? Y : p >= 70 ? "#ccc" : "#444",
                          }}
                        >
                          {p}%
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            background: "#1a1a1a",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p}%`,
                              height: "100%",
                              background:
                                p >= 85 ? Y : p >= 70 ? "#555" : "#2a2a2a",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: 64,
                            textAlign: "right",
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 22,
                            color: p >= 85 ? Y : "#f0ede6",
                          }}
                        >
                          {Math.round((rmActual * p) / 100)}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#444",
                              marginLeft: 2,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}
                  >
                    Sin RM registrado para este movimiento.
                  </div>
                )}
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {rmActual ? "Actualizar" : "Cargar"} RM — {movSeleccionado}
                </div>
                <input
                  className="inp"
                  type="number"
                  placeholder="kg"
                  value={nuevoRM}
                  onChange={(e) => setNuevoRM(e.target.value)}
                />
                <button
                  className="btn-y"
                  onClick={guardarRM}
                  disabled={guardando}
                >
                  {guardando ? <span className="spin">◌</span> : "GUARDAR RM"}
                </button>
              </div>
            </>
          )}

          {/* TAB: FOR TIME ───────────────────────────────────────────────── */}
          {tabAtleta === "fortime" && (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Nuevo PR
                </div>
                <input
                  className="inp"
                  placeholder="Workout (ej: Fran, Murph...)"
                  value={nuevoFTNombre}
                  onChange={(e) => setNuevoFTNombre(e.target.value)}
                />
                <input
                  className="inp"
                  placeholder="Tiempo (ej: 4:32)"
                  value={nuevoFTTiempo}
                  onChange={(e) => setNuevoFTTiempo(e.target.value)}
                />
                <button
                  className="btn-y"
                  onClick={guardarFT}
                  disabled={guardando}
                >
                  {guardando ? (
                    <span className="spin">◌</span>
                  ) : (
                    "GUARDAR PR ⚡"
                  )}
                </button>
              </div>

              {forTimes.length > 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {forTimes.map((ft) => (
                    <div
                      key={ft.id}
                      className="card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 18,
                            letterSpacing: 2,
                            color: Y,
                          }}
                        >
                          {ft.workout_name}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#444",
                            letterSpacing: 1,
                          }}
                        >
                          {new Date(ft.recorded_at).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 30,
                          color: "#fff",
                        }}
                      >
                        {formatearTiempo(ft.time_seconds)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: LOGROS ─────────────────────────────────────────────────── */}
          {tabAtleta === "logros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MOVIMIENTOS.map((m) => {
                const val = obtenerRMActual(m);
                if (!val) return null;
                return (
                  <div
                    key={m}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 18,
                          color: Y,
                          letterSpacing: 2,
                        }}
                      >
                        {m}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 30,
                          color: "#fff",
                        }}
                      >
                        {val}
                        <span
                          style={{ fontSize: 13, color: "#555", marginLeft: 4 }}
                        >
                          kg
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setLogro({ type: "rm", movement: m, value: `${val}kg` })
                      }
                      style={{
                        background: "#1a1500",
                        border: `1px solid ${Y}`,
                        color: Y,
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        letterSpacing: 1,
                        padding: "8px 10px",
                        borderRadius: 2,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      📸 Compartir
                    </button>
                  </div>
                );
              })}
              {forTimes.slice(0, 5).map((ft) => (
                <div
                  key={ft.id}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 18,
                        color: Y,
                        letterSpacing: 2,
                      }}
                    >
                      {ft.workout_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 30,
                        color: "#fff",
                      }}
                    >
                      {formatearTiempo(ft.time_seconds)}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setLogro({
                        type: "fortime",
                        movement: ft.workout_name,
                        value: formatearTiempo(ft.time_seconds),
                      })
                    }
                    style={{
                      background: "#1a1500",
                      border: `1px solid ${Y}`,
                      color: Y,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "8px 10px",
                      borderRadius: 2,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    📸 Compartir
                  </button>
                </div>
              ))}
              {registrosRM.length === 0 && forTimes.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#222",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    letterSpacing: 3,
                  }}
                >
                  CARGÁ TUS PRIMEROS RMs
                  <br />Y APARECERÁN ACÁ
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PANTALLA: PANEL COACH ──────────────────────────────────────────── */}
      {pantalla === "coach" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "24px 20px" }}
        >
          {/* Encabezado coach */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 9,
                color: Y,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Coach
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 28,
                letterSpacing: 2,
              }}
            >
              {perfil?.full_name || "Admin"}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Atletas", val: atletas.length, color: "#fff" },
              {
                label: "Al día",
                val: atletas.filter((a) => pagadoEsteMes(a.id)).length,
                color: "#4ade80",
              },
              {
                label: "Deben",
                val: atletas.filter((a) => !pagadoEsteMes(a.id)).length,
                color: "#f87171",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="card"
                style={{ textAlign: "center" }}
              >
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
                    color: "#333",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs de navegación coach */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 16,
            }}
          >
            {[
              ["atletas", "Atletas"],
              ["pagos", "Pagos"],
              ["grupos", "Grupos"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${tabCoach === k || (tabCoach === "detalle_atleta" && k === "atletas") ? "on" : ""}`}
                onClick={() => setTabCoach(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* VISTA: DETALLE DE ATLETA ─────────────────────────────────────── */}
          {tabCoach === "detalle_atleta" && atletaSeleccionado && (
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
                  onClick={() => {
                    setTabCoach("atletas");
                    setCoachAsignandoGrupo(false);
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    color: "#555",
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
                    {atletaSeleccionado.full_name}
                  </div>
                </div>
              </div>

              {/* Asignación de grupo desde el coach */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Grupo / Horario
                </div>
                {!coachAsignandoGrupo ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {atletaSeleccionado.group_id ? (
                        <>
                          <div
                            style={{
                              fontFamily: "'Bebas Neue',sans-serif",
                              fontSize: 22,
                              letterSpacing: 3,
                              color: Y,
                            }}
                          >
                            {gruprosDisponibles.find(
                              (g) => g.id === atletaSeleccionado.group_id,
                            )?.name || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#444",
                              letterSpacing: 1,
                            }}
                          >
                            {gruprosDisponibles.find(
                              (g) => g.id === atletaSeleccionado.group_id,
                            )?.schedule || ""}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#f87171",
                            letterSpacing: 1,
                          }}
                        >
                          Sin grupo asignado
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setCoachAsignandoGrupo(true)}
                      style={{
                        background: "transparent",
                        border: "1px solid #2a2a2a",
                        color: "#555",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        padding: "6px 12px",
                        borderRadius: 2,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      {atletaSeleccionado.group_id ? "Cambiar" : "Asignar"}
                    </button>
                  </div>
                ) : (
                  <SelectorGrupo
                    grupos={gruprosDisponibles}
                    onSeleccionar={(grupoId) =>
                      guardarGrupoAtleta(atletaSeleccionado.id, grupoId)
                    }
                    onCancelar={() => setCoachAsignandoGrupo(false)}
                  />
                )}
              </div>

              {/* Asignación de disciplina desde el coach */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
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
                      onClick={async () => {
                        await supabase
                          .from("profiles")
                          .update({ discipline: d })
                          .eq("id", atletaSeleccionado.id);
                        setAtletaSeleccionado((prev) => ({
                          ...prev,
                          discipline: d,
                        }));
                        await cargarAtletas();
                      }}
                      style={{
                        padding: "8px 14px",
                        background:
                          atletaSeleccionado.discipline === d
                            ? "#1a1500"
                            : "#0d0d0d",
                        border: `1px solid ${atletaSeleccionado.discipline === d ? Y : "#2a2a2a"}`,
                        color: atletaSeleccionado.discipline === d ? Y : "#555",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 10,
                        letterSpacing: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      {atletaSeleccionado.discipline === d ? "✓ " : ""}
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {MOVIMIENTOS.map((m) => {
                  const val = obtenerRMAtleta(m);
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
                          color: "#444",
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
                            color: movAtleta === m ? Y : "#ccc",
                          }}
                        >
                          {val}
                          <span
                            style={{
                              fontSize: 13,
                              color: "#555",
                              marginLeft: 3,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 28,
                            color: "#1e1e1e",
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
              {obtenerRMAtleta(movAtleta) && (
                <div className="card">
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: "#333",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Porcentajes — {movAtleta}
                  </div>
                  {PORCENTAJES.map((p) => {
                    const val = obtenerRMAtleta(movAtleta);
                    return (
                      <div key={p} className="fila-pct">
                        <div
                          style={{
                            width: 44,
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 20,
                            color: p >= 85 ? Y : p >= 70 ? "#ccc" : "#444",
                          }}
                        >
                          {p}%
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            background: "#1a1a1a",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p}%`,
                              height: "100%",
                              background:
                                p >= 85 ? Y : p >= 70 ? "#555" : "#2a2a2a",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: 64,
                            textAlign: "right",
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 22,
                            color: p >= 85 ? Y : "#f0ede6",
                          }}
                        >
                          {Math.round((val * p) / 100)}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#444",
                              marginLeft: 2,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB: ATLETAS ────────────────────────────────────────────────── */}
          {tabCoach === "atletas" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Buscador por nombre */}
              <input
                className="inp"
                placeholder="Buscar atleta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ marginBottom: 4 }}
              />

              {/* Filtro por disciplina */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                <button
                  className={`chip-disc ${filtroDisciplina === "todas" ? "on" : ""}`}
                  onClick={() => setFiltroDisciplina("todas")}
                >
                  Todas
                </button>
                {DISCIPLINAS.map((d) => (
                  <button
                    key={d}
                    className={`chip-disc ${filtroDisciplina === d ? "on" : ""}`}
                    onClick={() => setFiltroDisciplina(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {atletas.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN ATLETAS REGISTRADOS AÚN
                </div>
              )}

              {atletas
                .filter((a) => {
                  // Filtrar por nombre
                  const coincideNombre = a.full_name
                    ?.toLowerCase()
                    .includes(busqueda.toLowerCase());
                  // Filtrar por disciplina (campo discipline en el perfil)
                  const coincideDisciplina =
                    filtroDisciplina === "todas" ||
                    a.discipline === filtroDisciplina;
                  return coincideNombre && coincideDisciplina;
                })
                .map((a) => (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {a.full_name}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}
                      >
                        {a.groups?.name || "Sin grupo"}
                        {a.discipline && (
                          <span style={{ color: "#444", marginLeft: 6 }}>
                            · {a.discipline}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <button
                        onClick={() => seleccionarAtleta(a)}
                        style={{
                          background: "#1a1500",
                          border: `1px solid ${Y}`,
                          color: Y,
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 9,
                          letterSpacing: 1,
                          padding: "6px 10px",
                          borderRadius: 2,
                          cursor: "pointer",
                          textTransform: "uppercase",
                        }}
                      >
                        Ver atleta
                      </button>
                      <span
                        className={
                          pagadoEsteMes(a.id) ? "badge-ok" : "badge-no"
                        }
                      >
                        {pagadoEsteMes(a.id) ? "AL DÍA" : "DEBE"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB: PAGOS ──────────────────────────────────────────────────── */}
          {tabCoach === "pagos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {atletas.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN ATLETAS REGISTRADOS AÚN
                </div>
              )}
              {atletas.map((a) => {
                const pago = pagadoEsteMes(a.id);
                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {a.full_name}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: 1,
                          color: pago ? "#4ade80" : "#f87171",
                        }}
                      >
                        {pago ? "✓ Al día este mes" : "Cuota pendiente"}
                      </div>
                    </div>
                    {!pago ? (
                      <button
                        onClick={() => marcarPagado(a.id)}
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
                        }}
                      >
                        ✓ Marcar pagado
                      </button>
                    ) : (
                      <span className="badge-ok">AL DÍA</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: GRUPOS ─────────────────────────────────────────────────── */}
          {tabCoach === "grupos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grupos.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN GRUPOS CREADOS AÚN
                </div>
              )}
              {grupos.map((g) => {
                const miembros = atletas.filter((a) => a.group_id === g.id);
                return (
                  <div key={g.id} className="card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 22,
                          color: Y,
                          letterSpacing: 3,
                        }}
                      >
                        {g.name}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}
                      >
                        {miembros.length} atletas
                      </div>
                    </div>
                    {miembros.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          fontSize: 11,
                          color: "#888",
                          padding: "4px 0",
                          borderBottom: "1px solid #161616",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {a.full_name}
                        <span
                          className={
                            pagadoEsteMes(a.id) ? "badge-ok" : "badge-no"
                          }
                        >
                          {pagadoEsteMes(a.id) ? "AL DÍA" : "DEBE"}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tarjeta de logro (overlay) */}
      {logro && (
        <TarjetaLogro
          logro={logro}
          nombreAtleta={perfil?.full_name}
          onCerrar={() => setLogro(null)}
        />
      )}
    </div>
  );
}
