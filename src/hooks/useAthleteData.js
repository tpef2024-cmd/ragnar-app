// ── HOOK: DATOS DEL ATLETA ─────────────────────────────────────────────────────
// Carga y guarda RMs, For Times y grupos disponibles para el atleta logueado.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { obtenerRMDeLista, tiempoASegundos } from "../lib/helpers";

export function useAthleteData(usuario, activo) {
  const [registrosRM, setRegistrosRM] = useState([]);
  const [forTimes, setForTimes] = useState([]);
  const [repsRecords, setRepsRecords] = useState([]);
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [logro, setLogro] = useState(null);

  // Cargar RMs del atleta logueado
  const cargarRMs = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("rm_records")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("recorded_at", { ascending: false });
    setRegistrosRM(data || []);
  }, [usuario]);

  // Cargar For Times del atleta logueado
  const cargarForTimes = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("for_time_records")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("recorded_at", { ascending: false });
    setForTimes(data || []);
  }, [usuario]);

  // Cargar Reps/AMRAP del atleta logueado
  const cargarReps = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("amrap_records")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("recorded_at", { ascending: false });
    setRepsRecords(data || []);
  }, [usuario]);

  // Cargar todos los grupos disponibles (para mostrar el propio)
  const cargarGruposDisponibles = useCallback(async () => {
    const { data } = await supabase.from("groups").select("*").order("name");
    setGruposDisponibles(data || []);
  }, []);

  useEffect(() => {
    if (activo && usuario) {
      cargarRMs();
      cargarForTimes();
      cargarReps();
      cargarGruposDisponibles();
    }
  }, [activo, usuario, cargarRMs, cargarForTimes, cargarReps, cargarGruposDisponibles]);

  // Función de carga de RM (guarda un nuevo registro y detecta si es récord)
  const guardarRM = async (movimiento, valorStr) => {
    if (!valorStr || isNaN(valorStr)) return false;
    const valor = parseFloat(valorStr);
    const anterior = obtenerRMDeLista(registrosRM, movimiento);
    const { error } = await supabase.from("rm_records").insert({
      athlete_id: usuario.id,
      movement: movimiento,
      weight_kg: valor,
    });
    if (!error) {
      await cargarRMs();
      if (!anterior || valor > anterior) {
        setLogro({ type: "rm", movement: movimiento, value: `${valor}kg` });
      }
      return true;
    }
    return false;
  };

  // Función de asistencia... — placeholder para Fase 2 (QR), no implementada todavía

  // Guardar nuevo For Time
  const guardarFT = async (nombre, tiempoStr) => {
    if (!nombre || !tiempoStr) return false;
    const segundos = tiempoASegundos(tiempoStr);
    const { error } = await supabase.from("for_time_records").insert({
      athlete_id: usuario.id,
      workout_name: nombre,
      time_seconds: segundos,
    });
    if (!error) {
      await cargarForTimes();
      setLogro({ type: "fortime", movement: nombre, value: tiempoStr });
      return true;
    }
    return false;
  };

  // Guardar nuevo registro de Reps/AMRAP
  const guardarReps = async (ejercicio, timeCap, resultadoStr) => {
    if (!ejercicio || !timeCap || !resultadoStr || isNaN(resultadoStr)) return false;
    const resultado = parseFloat(resultadoStr);
    const { error } = await supabase.from("amrap_records").insert({
      athlete_id: usuario.id,
      exercise: ejercicio,
      time_cap: timeCap,
      result: resultado,
    });
    if (!error) {
      await cargarReps();
      setLogro({ type: "reps", movement: `${ejercicio} (${timeCap})`, value: `${resultado} reps` });
      return true;
    }
    return false;
  };

  return {
    registrosRM,
    forTimes,
    repsRecords,
    gruposDisponibles,
    logro,
    setLogro,
    guardarRM,
    guardarFT,
    guardarReps,
  };
}
