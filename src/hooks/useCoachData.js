// ── HOOK: DATOS DEL COACH ──────────────────────────────────────────────────────
// Carga y guarda atletas, pagos y grupos para el panel de coach.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useCoachData(usuario, activo) {
  const [atletas, setAtletas] = useState([]);
  const [pagos, setPagos] = useState([]);
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

  // Cargar pagos del mes actual
  const cargarPagos = useCallback(async () => {
    const ahora = new Date();
    const { data, error } = await supabase
      .from("payments")
      .select("athlete_id, status, period_month, period_year")
      .eq("period_month", ahora.getMonth() + 1)
      .eq("period_year", ahora.getFullYear())
      .eq("status", "paid");
    if (!error) setPagos(data || []);
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
      cargarGrupos();
      cargarGruposDisponibles();
    }
  }, [activo, usuario, cargarAtletas, cargarPagos, cargarGrupos, cargarGruposDisponibles]);

  // Verificar si un atleta pagó este mes
  const pagadoEsteMes = (atletaId) =>
    pagos.some((p) => p.athlete_id === atletaId && p.status === "paid");

  // Marcar pago como realizado (evita duplicados)
  const marcarPagado = async (atletaId) => {
    const ahora = new Date();
    const yaPago = pagos.some(
      (p) => p.athlete_id === atletaId && p.status === "paid",
    );
    if (yaPago) return;

    // Actualizar estado local inmediatamente para feedback visual
    setPagos((prev) => [
      ...prev,
      {
        athlete_id: atletaId,
        status: "paid",
        period_month: ahora.getMonth() + 1,
        period_year: ahora.getFullYear(),
      },
    ]);

    await supabase.from("payments").insert({
      athlete_id: atletaId,
      amount: 0,
      period_month: ahora.getMonth() + 1,
      period_year: ahora.getFullYear(),
      method: "manual",
      status: "paid",
      registered_by: usuario.id,
    });

    await cargarPagos();
    await cargarAtletas();
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
    grupos,
    gruposDisponibles,
    pagadoEsteMes,
    marcarPagado,
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
