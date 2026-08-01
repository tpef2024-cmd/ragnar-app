// ── HOOK: ASISTENCIA DEL ATLETA ────────────────────────────────────────────────
// Chequea si el atleta ya registró asistencia hoy y guarda el check-in por QR.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

// Fecha de hoy en formato YYYY-MM-DD, según el huso horario del dispositivo
// (alcanza porque la app y el gimnasio están en el mismo lugar físico)
function fechaDeHoy() {
  return new Date().toLocaleDateString("en-CA");
}

export function useAttendance(usuario, activo) {
  const [asistenciaHoy, setAsistenciaHoy] = useState(null); // null = cargando, false = no marcó, objeto = ya marcó
  const [historialAsistencia, setHistorialAsistencia] = useState([]);

  // Verificar si el atleta ya hizo check-in hoy
  const cargarAsistenciaHoy = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("athlete_id", usuario.id)
      .eq("check_date", fechaDeHoy())
      .maybeSingle();
    setAsistenciaHoy(data || false);
  }, [usuario]);

  // Cargar los últimos check-ins (para mostrar un mini-historial, opcional)
  const cargarHistorial = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("athlete_id", usuario.id)
      .order("checked_in_at", { ascending: false })
      .limit(10);
    setHistorialAsistencia(data || []);
  }, [usuario]);

  useEffect(() => {
    if (activo && usuario) {
      cargarAsistenciaHoy();
      cargarHistorial();
    }
  }, [activo, usuario, cargarAsistenciaHoy, cargarHistorial]);

  // Registrar el check-in de hoy (llamado tras escanear el QR correcto)
  // Devuelve: "ok" | "ya_registrado" | "error"
  const registrarAsistencia = async () => {
    if (!usuario) return "error";

    // Chequeo defensivo — si por algún motivo el estado local está desactualizado
    if (asistenciaHoy) return "ya_registrado";

    const { error } = await supabase.from("attendance").insert({
      athlete_id: usuario.id,
      check_date: fechaDeHoy(),
    });

    if (error) {
      // Código 23505 = violación de índice único → ya había un check-in hoy
      // (por ejemplo, si escaneó desde otro dispositivo)
      if (error.code === "23505") {
        await cargarAsistenciaHoy();
        return "ya_registrado";
      }
      return "error";
    }

    await cargarAsistenciaHoy();
    await cargarHistorial();
    return "ok";
  };

  return { asistenciaHoy, historialAsistencia, registrarAsistencia };
}
