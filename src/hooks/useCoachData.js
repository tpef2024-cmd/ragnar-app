// ── HOOK: DATOS DEL COACH ──────────────────────────────────────────────────────
// Carga y guarda atletas, pagos, planes de cuota y grupos para el panel de coach.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useCoachData(usuario, activo) {
  const [atletas, setAtletas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);

  // Cargar lista de atletas
  const cargarAtletas = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("role", "athlete");
    setAtletas(data || []);
  }, []);

  // Cargar pagos del mes actual (incluye monto, plan y método de pago usado)
  const cargarPagos = useCallback(async () => {
    const ahora = new Date();
    const { data, error } = await supabase
      .from("payments")
      .select(
        "athlete_id, status, amount, plan_id, payment_method, period_month, period_year",
      )
      .eq("period_month", ahora.getMonth() + 1)
      .eq("period_year", ahora.getFullYear())
      .eq("status", "paid");
    if (!error) setPagos(data || []);
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
      cargarPagos();
      cargarPlanes();
      cargarGrupos();
      cargarGruposDisponibles();
    }
  }, [
    activo,
    usuario,
    cargarAtletas,
    cargarPagos,
    cargarPlanes,
    cargarGrupos,
    cargarGruposDisponibles,
  ]);

  // Verificar si un atleta pagó este mes
  const pagadoEsteMes = (atletaId) =>
    pagos.some((p) => p.athlete_id === atletaId && p.status === "paid");

  // Total de ingresos registrados este mes (suma de todos los pagos "paid")
  const ingresosDelMes = pagos.reduce(
    (total, p) => total + (Number(p.amount) || 0),
    0,
  );

  // Función de cobro de cuota — acepta un combo (planId + método de pago) o un
  // monto libre tipeado por el coach. Evita duplicar el pago del mes para el
  // mismo atleta.
  const cobrarCuota = async (
    atletaId,
    { planId = null, monto, metodo = null },
  ) => {
    const ahora = new Date();
    const yaPago = pagos.some(
      (p) => p.athlete_id === atletaId && p.status === "paid",
    );
    if (yaPago) return;

    const montoFinal = Number(monto) || 0;

    // Actualizar estado local inmediatamente para feedback visual
    setPagos((prev) => [
      ...prev,
      {
        athlete_id: atletaId,
        status: "paid",
        amount: montoFinal,
        plan_id: planId,
        payment_method: metodo,
        period_month: ahora.getMonth() + 1,
        period_year: ahora.getFullYear(),
      },
    ]);

    await supabase.from("payments").insert({
      athlete_id: atletaId,
      amount: montoFinal,
      plan_id: planId,
      payment_method: metodo,
      period_month: ahora.getMonth() + 1,
      period_year: ahora.getFullYear(),
      method: "manual",
      status: "paid",
      registered_by: usuario.id,
    });

    await cargarPagos();
    await cargarAtletas();
  };

  // Revertir un pago del mes (por si el coach se confunde al cobrar)
  const revertirPago = async (atletaId) => {
    const ahora = new Date();
    // Quitar del estado local al instante
    setPagos((prev) => prev.filter((p) => p.athlete_id !== atletaId));

    await supabase
      .from("payments")
      .delete()
      .eq("athlete_id", atletaId)
      .eq("status", "paid")
      .eq("period_month", ahora.getMonth() + 1)
      .eq("period_year", ahora.getFullYear());

    await cargarPagos();
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

  return {
    atletas,
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
