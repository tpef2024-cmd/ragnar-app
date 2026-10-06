// ── HOOK: DATOS DEL COACH ──────────────────────────────────────────────────────
// Carga y guarda atletas, pagos, planes de cuota y grupos para el panel de coach.
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Mes y año actuales ({ mes: 1-12, anio }) según el reloj del dispositivo
const periodoActual = () => {
  const d = new Date();
  return { mes: d.getMonth() + 1, anio: d.getFullYear() };
};

const esMismoPeriodo = (a, b) => a.mes === b.mes && a.anio === b.anio;

// Trae los pagos "paid" de un mes/año puntual. Devuelve null si hubo error.
const consultarPagos = async ({ mes, anio }) => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "athlete_id, status, amount, plan_id, payment_method, period_month, period_year",
    )
    .eq("period_month", mes)
    .eq("period_year", anio)
    .eq("status", "paid");
  return error ? null : data || [];
};

export function useCoachData(usuario, activo) {
  const [atletas, setAtletas] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [revocados, setRevocados] = useState([]);
  // `pagos` = siempre el mes ACTUAL (lo usan las estadísticas, Atletas y
  // Grupos para el badge AL DÍA / DEBE).
  // `pagosPeriodo` = el mes elegido en la tab Pagos, que puede ser uno
  // anterior (para cobrar una cuota atrasada) o el siguiente (adelantada).
  const [pagos, setPagos] = useState([]);
  const [periodoPagos, setPeriodoPagos] = useState(periodoActual);
  const [pagosPeriodo, setPagosPeriodo] = useState([]);
  const ultimaConsultaPeriodo = useRef(0);
  const [planes, setPlanes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);

  // Cargar lista de atletas ya aprobados (los pending/revoked no entran acá,
  // así el panel "Atletas" no se mezcla con las solicitudes sin resolver)
  const cargarAtletas = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("role", "athlete")
      .eq("status", "approved");
    setAtletas(data || []);
  }, []);

  // Cargar atletas con registro pendiente de autorización
  const cargarPendientes = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "athlete")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPendientes(data || []);
  }, []);

  // Cargar atletas con el acceso revocado — se necesita esta lista aparte
  // porque quedan fuera tanto de "atletas" (solo approved) como de
  // "pendientes" (solo pending), y si no, no habría forma de encontrarlos
  // para reactivarlos si retoman la actividad más adelante.
  const cargarRevocados = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "athlete")
      .eq("status", "revoked")
      .order("full_name", { ascending: true });
    setRevocados(data || []);
  }, []);

  // Cargar pagos del mes actual. No hace falta ningún "reset" mensual: como
  // cada pago guarda su mes/año, el día 1 esta consulta pasa a buscar el mes
  // nuevo, no encuentra pagos y todos arrancan como "deben".
  const cargarPagos = useCallback(async () => {
    const data = await consultarPagos(periodoActual());
    if (data) setPagos(data);
  }, []);

  // Cargar pagos del mes elegido en la tab Pagos. El contador evita que, si
  // el coach cambia de mes rápido, una respuesta vieja pise a la más nueva.
  const cargarPagosPeriodo = useCallback(async (periodo) => {
    const nro = ++ultimaConsultaPeriodo.current;
    const data = await consultarPagos(periodo);
    if (data && nro === ultimaConsultaPeriodo.current) setPagosPeriodo(data);
  }, []);

  // Cargar los combos de cuota con sus precios
  const cargarPlanes = useCallback(async () => {
    const { data } = await supabase
      .from("payment_plans")
      .select("*")
      .order("sort_order");
    setPlanes(data || []);
  }, []);

  // Cargar grupos creados
  const cargarGrupos = useCallback(async () => {
    const { data } = await supabase.from("groups").select("*");
    setGrupos(data || []);
  }, []);

  // Cargar todos los grupos disponibles (para asignar a atletas)
  const cargarGruposDisponibles = useCallback(async () => {
    const { data } = await supabase.from("groups").select("*").order("name");
    setGruposDisponibles(data || []);
  }, []);

  useEffect(() => {
    if (activo && usuario) {
      cargarAtletas();
      cargarPendientes();
      cargarRevocados();
      cargarPagos();
      cargarPlanes();
      cargarGrupos();
      cargarGruposDisponibles();
    }
  }, [
    activo,
    usuario,
    cargarAtletas,
    cargarPendientes,
    cargarRevocados,
    cargarPagos,
    cargarPlanes,
    cargarGrupos,
    cargarGruposDisponibles,
  ]);

  // Recargar los pagos de la tab Pagos cada vez que se cambia de mes
  useEffect(() => {
    if (activo && usuario) cargarPagosPeriodo(periodoPagos);
  }, [activo, usuario, periodoPagos, cargarPagosPeriodo]);

  // Aprobar el registro de un atleta: pasa a "approved" y se mueve de la
  // lista de pendientes a la lista normal de atletas.
  const aprobarAtleta = async (atletaId) => {
    setPendientes((prev) => prev.filter((p) => p.id !== atletaId));
    await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", atletaId);
    await cargarAtletas();
  };

  // Rechazar una solicitud de registro (antes de aprobarla). Se marca como
  // "revoked" en vez de borrar el perfil, para no perder el registro del
  // intento ni romper la fila de auth.users asociada.
  const rechazarAtleta = async (atletaId) => {
    setPendientes((prev) => prev.filter((p) => p.id !== atletaId));
    await supabase
      .from("profiles")
      .update({ status: "revoked" })
      .eq("id", atletaId);
    await cargarRevocados();
  };

  // Revocar el acceso de un atleta ya aprobado (dado de baja, etc.)
  const revocarAtleta = async (atletaId) => {
    setAtletas((prev) => prev.filter((a) => a.id !== atletaId));
    await supabase
      .from("profiles")
      .update({ status: "revoked" })
      .eq("id", atletaId);
    await cargarRevocados();
  };

  // Reactivar a un atleta previamente revocado — por ejemplo, si vuelve a
  // sumarse al gimnasio después de un tiempo. Su información (RMs, PRs,
  // historial) queda intacta porque nunca se borró el perfil, solo se
  // vuelve a habilitar el acceso.
  const reactivarAtleta = async (atletaId) => {
    setRevocados((prev) => prev.filter((r) => r.id !== atletaId));
    await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", atletaId);
    await cargarAtletas();
  };

  // Verificar si un atleta pagó este mes
  const pagadoEsteMes = (atletaId) =>
    pagos.some((p) => p.athlete_id === atletaId && p.status === "paid");

  // Total de ingresos registrados este mes (suma de todos los pagos "paid")
  const ingresosDelMes = pagos.reduce(
    (total, p) => total + (Number(p.amount) || 0),
    0,
  );

  // Verificar si un atleta pagó el mes elegido en la tab Pagos
  const pagadoEnPeriodo = (atletaId) =>
    pagosPeriodo.some((p) => p.athlete_id === atletaId && p.status === "paid");

  // Total de ingresos del mes elegido en la tab Pagos
  const ingresosPeriodo = pagosPeriodo.reduce(
    (total, p) => total + (Number(p.amount) || 0),
    0,
  );

  // ¿El atleta ya tiene pagado este período? Usa la lista que corresponda
  // (mes actual, o el mes elegido en la tab Pagos).
  const yaPagado = (atletaId, periodo) =>
    (esMismoPeriodo(periodo, periodoActual()) && pagadoEsteMes(atletaId)) ||
    (esMismoPeriodo(periodo, periodoPagos) && pagadoEnPeriodo(atletaId));

  // Función de cobro de cuota — acepta un combo (planId + método de pago) o un
  // monto libre tipeado por el coach. Por defecto el pago se imputa al mes
  // elegido en la tab Pagos (no al mes en que se cobra), así una cuota de
  // septiembre cobrada el 3 de octubre queda registrada como septiembre.
  // Desde el detalle del atleta se pasa `periodo` = mes actual.
  // Evita duplicar el pago del mismo mes (además del índice único en la base).
  const cobrarCuota = async (
    atletaId,
    { planId = null, monto, metodo = null },
    periodo = periodoPagos,
  ) => {
    if (yaPagado(atletaId, periodo)) return;

    const montoFinal = Number(monto) || 0;
    const nuevoPago = {
      athlete_id: atletaId,
      status: "paid",
      amount: montoFinal,
      plan_id: planId,
      payment_method: metodo,
      period_month: periodo.mes,
      period_year: periodo.anio,
    };

    // Actualizar estado local inmediatamente para feedback visual
    if (esMismoPeriodo(periodo, periodoPagos)) {
      setPagosPeriodo((prev) => [...prev, nuevoPago]);
    }
    if (esMismoPeriodo(periodo, periodoActual())) {
      setPagos((prev) => [...prev, nuevoPago]);
    }

    await supabase.from("payments").insert({
      ...nuevoPago,
      method: "manual",
      registered_by: usuario.id,
    });

    // Recargar desde la base: si el insert falló (ej. pago duplicado), la
    // pantalla vuelve a mostrar el estado real
    await Promise.all([cargarPagos(), cargarPagosPeriodo(periodoPagos)]);
  };

  // Revertir el pago de un atleta en un mes (por defecto el elegido en la
  // tab Pagos) — por si el coach se confunde al cobrar
  const revertirPago = async (atletaId, periodo = periodoPagos) => {
    // Quitar del estado local al instante
    if (esMismoPeriodo(periodo, periodoPagos)) {
      setPagosPeriodo((prev) => prev.filter((p) => p.athlete_id !== atletaId));
    }
    if (esMismoPeriodo(periodo, periodoActual())) {
      setPagos((prev) => prev.filter((p) => p.athlete_id !== atletaId));
    }

    await supabase
      .from("payments")
      .delete()
      .eq("athlete_id", atletaId)
      .eq("status", "paid")
      .eq("period_month", periodo.mes)
      .eq("period_year", periodo.anio);

    await Promise.all([cargarPagos(), cargarPagosPeriodo(periodoPagos)]);
  };

  // Detalle del pago del mes actual de un atleta (para el detalle del atleta)
  const pagoDelMes = (atletaId) => pagos.find((p) => p.athlete_id === atletaId);

  // Dar de alta un atleta desde el panel (Kids sin celular, Adultos Mayores,
  // etc.). Lo hace la Edge Function "crear-atleta", porque crear un usuario
  // necesita la service_role key, que no puede estar en el frontend.
  // Devuelve { error } o { ok: true }.
  const crearAtleta = async (datos) => {
    const { data, error } = await supabase.functions.invoke("crear-atleta", {
      body: datos,
    });
    if (error) {
      let mensaje = "No se pudo dar de alta al atleta. Probá de nuevo.";
      try {
        const cuerpo = await error.context?.json();
        if (cuerpo?.error) mensaje = cuerpo.error;
      } catch {
        // la respuesta no era JSON (ej. la función no está desplegada)
      }
      return { error: mensaje };
    }
    await cargarAtletas();
    return { ok: true, id: data?.id };
  };

  // ── ASISTENCIA DE UN ATLETA (vista del profe) ─────────────────────────────
  // Check-ins entre dos fechas "YYYY-MM-DD" (inclusive)
  const cargarAsistenciaAtleta = useCallback(async (atletaId, desde, hasta) => {
    const { data } = await supabase
      .from("attendance")
      .select("check_date, checked_in_at")
      .eq("athlete_id", atletaId)
      .gte("check_date", desde)
      .lte("check_date", hasta)
      .order("check_date", { ascending: false });
    return data || [];
  }, []);

  // Último check-in registrado (sin importar el mes)
  const cargarUltimaAsistencia = useCallback(async (atletaId) => {
    const { data } = await supabase
      .from("attendance")
      .select("check_date")
      .eq("athlete_id", atletaId)
      .order("check_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.check_date || null;
  }, []);

  // Marcar presente / quitar a un atleta en una fecha (para los que no
  // escanean el QR). Devuelve true si salió bien.
  const marcarAsistencia = async (atletaId, fecha) => {
    const { error } = await supabase
      .from("attendance")
      .insert({ athlete_id: atletaId, check_date: fecha });
    return !error || error.code === "23505";
  };
  const quitarAsistencia = async (atletaId, fecha) => {
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("athlete_id", atletaId)
      .eq("check_date", fecha);
    return !error;
  };

  // Guardar/actualizar el precio de un combo — campo es "price_efectivo" o "price_transferencia"
  const guardarPrecioPlan = async (planId, campo, nuevoPrecio) => {
    setPlanes((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, [campo]: nuevoPrecio } : p)),
    );
    await supabase
      .from("payment_plans")
      .update({ [campo]: nuevoPrecio })
      .eq("id", planId);
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
    return actualizado;
  };

  // Guardar disciplina del atleta (lo hace el coach)
  const guardarDisciplinaAtleta = async (atletaId, disciplina) => {
    await supabase
      .from("profiles")
      .update({ discipline: disciplina })
      .eq("id", atletaId);
    await cargarAtletas();
  };

  // Marcar / desmarcar Hybrid (complementaria a la disciplina principal)
  const guardarHybridAtleta = async (atletaId, valor) => {
    await supabase
      .from("profiles")
      .update({ is_hybrid: valor })
      .eq("id", atletaId);
    await cargarAtletas();
  };

  return {
    atletas,
    pendientes,
    revocados,
    pagos,
    planes,
    grupos,
    gruposDisponibles,
    pagadoEsteMes,
    ingresosDelMes,
    periodoPagos,
    setPeriodoPagos,
    pagosPeriodo,
    pagadoEnPeriodo,
    ingresosPeriodo,
    cobrarCuota,
    revertirPago,
    pagoDelMes,
    crearAtleta,
    cargarAsistenciaAtleta,
    cargarUltimaAsistencia,
    marcarAsistencia,
    quitarAsistencia,
    guardarPrecioPlan,
    guardarGrupoAtleta,
    guardarDisciplinaAtleta,
    guardarHybridAtleta,
    aprobarAtleta,
    rechazarAtleta,
    revocarAtleta,
    reactivarAtleta,
    cargarRMsAtleta: async (atletaId) => {
      const { data } = await supabase
        .from("rm_records")
        .select("*")
        .eq("athlete_id", atletaId)
        .order("recorded_at", { ascending: false });
      return data || [];
    },
  };
}
