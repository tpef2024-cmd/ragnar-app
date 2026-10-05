// ── HOOK: INFORMACIÓN / NOTAS DE UN ATLETA ──────────────────────────────────────
// Tabla athlete_notes (ver supabase/migrations/20261005_profes_alta_info_asistencia.sql):
//   kind "athlete" → la carga el atleta; la ven él y los profes
//   kind "coach"   → la carga un profe; la ven solo los profes
// Quién ve qué lo decide la base (RLS): un atleta nunca recibe las notas
// "coach", aunque las pida.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const CAMPOS =
  "id, athlete_id, author_id, kind, content, created_at, autor:profiles!author_id(full_name)";

export function useNotas(atletaId, activo = true) {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!atletaId) return;
    const { data } = await supabase
      .from("athlete_notes")
      .select(CAMPOS)
      .eq("athlete_id", atletaId)
      .order("created_at", { ascending: false });
    setNotas(data || []);
    setCargando(false);
  }, [atletaId]);

  useEffect(() => {
    if (!activo || !atletaId) return;
    let vigente = true;
    setCargando(true);
    supabase
      .from("athlete_notes")
      .select(CAMPOS)
      .eq("athlete_id", atletaId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!vigente) return;
        setNotas(data || []);
        setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [activo, atletaId]);

  // Devuelve true si se guardó
  const agregar = async (kind, texto) => {
    const content = texto.trim();
    if (!content) return false;
    const { error } = await supabase
      .from("athlete_notes")
      .insert({ athlete_id: atletaId, kind, content });
    if (error) return false;
    await cargar();
    return true;
  };

  const borrar = async (id) => {
    setNotas((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("athlete_notes").delete().eq("id", id);
    await cargar();
  };

  return {
    notasAtleta: notas.filter((n) => n.kind === "athlete"),
    notasCoach: notas.filter((n) => n.kind === "coach"),
    cargando,
    agregar,
    borrar,
  };
}
