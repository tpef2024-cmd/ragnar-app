// ── HOOK: DATOS HÍBRIDO ───────────────────────────────────────────────────────
// Testeos híbridos (los administra el coach) + marcas de los atletas en segundos.
//  - Atleta: ve los testeos activos, carga sus marcas y ve su historial.
//  - Coach: crea/renombra/activa/desactiva testeos, ve las marcas de todos y
//    puede cargar marcas de cualquier atleta (con la fecha del testeo).
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useHybridData(usuario, activo, esCoach = false) {
  const [testeos, setTesteos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargandoHibrido, setCargandoHibrido] = useState(false);

  // Testeos: el atleta solo ve los activos; el coach ve todos para administrarlos
  const cargarTesteos = useCallback(async () => {
    let query = supabase.from("hybrid_tests").select("*").order("sort_order");
    if (!esCoach) query = query.eq("active", true);
    const { data } = await query;
    setTesteos(data || []);
  }, [esCoach]);

  // Marcas: el atleta solo las suyas; el coach todas, con el nombre del atleta.
  // (RLS ya restringe esto en la base; el filtro es para no traer de más.)
  const cargarMarcas = useCallback(async () => {
    if (!usuario) return;
    let query = supabase
      .from("hybrid_records")
      .select(esCoach ? "*, profiles(full_name)" : "*")
      .order("recorded_at", { ascending: false });
    if (!esCoach) query = query.eq("athlete_id", usuario.id);
    const { data } = await query;
    setMarcas(data || []);
  }, [usuario, esCoach]);

  useEffect(() => {
    if (!activo || !usuario) return;
    setCargandoHibrido(true);
    Promise.all([cargarTesteos(), cargarMarcas()]).finally(() =>
      setCargandoHibrido(false),
    );
  }, [activo, usuario, cargarTesteos, cargarMarcas]);

  // ── Derivados ──────────────────────────────────────────────────────────────
  // Mejor marca (menor tiempo) de un atleta en un testeo
  const mejorMarca = (testId, atletaId = usuario?.id) => {
    const tiempos = marcas
      .filter((m) => m.test_id === testId && m.athlete_id === atletaId)
      .map((m) => m.time_seconds);
    return tiempos.length ? Math.min(...tiempos) : null;
  };

  // Historial de un atleta en un testeo (más reciente primero)
  const historial = (testId, atletaId = usuario?.id) =>
    marcas.filter((m) => m.test_id === testId && m.athlete_id === atletaId);

  // Ranking de un testeo: mejor marca de cada atleta, ordenado de menor a mayor
  const ranking = (testId) => {
    const porAtleta = {};
    marcas
      .filter((m) => m.test_id === testId)
      .forEach((m) => {
        const actual = porAtleta[m.athlete_id];
        if (!actual || m.time_seconds < actual.time_seconds) porAtleta[m.athlete_id] = m;
      });
    return Object.values(porAtleta).sort((a, b) => a.time_seconds - b.time_seconds);
  };

  // ── Acciones del atleta ────────────────────────────────────────────────────
  // Devuelve { ok, esPR } para poder festejar si mejoró su marca
  const guardarMarca = async (testId, segundos) => {
    const anterior = mejorMarca(testId);
    const { error } = await supabase.from("hybrid_records").insert({
      athlete_id: usuario.id,
      test_id: testId,
      time_seconds: segundos,
    });
    if (error) return { ok: false };
    await cargarMarcas();
    return { ok: true, esPR: anterior == null || segundos < anterior };
  };

  // Borrar una marca cargada por error (atleta: la suya; coach: cualquiera)
  const borrarMarca = async (marcaId) => {
    setMarcas((prev) => prev.filter((m) => m.id !== marcaId));
    await supabase.from("hybrid_records").delete().eq("id", marcaId);
    await cargarMarcas();
  };

  // ── Acciones del coach ─────────────────────────────────────────────────────
  // Cargar la marca de un atleta (ej. testeo hecho en clase). `fecha` es
  // "YYYY-MM-DD" (el día del testeo); se guarda al mediodía hora local para
  // que la zona horaria no la corra al día anterior. Devuelve { ok, esPR }.
  const guardarMarcaAtleta = async (atletaId, testId, segundos, fecha) => {
    const anterior = mejorMarca(testId, atletaId);
    const recordedAt = fecha
      ? new Date(`${fecha}T12:00:00`).toISOString()
      : new Date().toISOString();
    const { error } = await supabase.from("hybrid_records").insert({
      athlete_id: atletaId,
      test_id: testId,
      time_seconds: segundos,
      recorded_at: recordedAt,
    });
    if (error) return { ok: false };
    await cargarMarcas();
    return { ok: true, esPR: anterior == null || segundos < anterior };
  };

  const crearTesteo = async (nombre) => {
    const limpio = nombre.trim();
    if (!limpio) return "Ingresá un nombre";
    const siguienteOrden = Math.max(0, ...testeos.map((t) => t.sort_order || 0)) + 1;
    const { error } = await supabase.from("hybrid_tests").insert({
      name: limpio,
      sort_order: siguienteOrden,
      created_by: usuario.id,
    });
    if (error) return error.code === "23505" ? "Ya existe un testeo con ese nombre" : "No se pudo crear";
    await cargarTesteos();
    return null;
  };

  const renombrarTesteo = async (testId, nombre) => {
    const limpio = nombre.trim();
    if (!limpio) return "Ingresá un nombre";
    const { error } = await supabase.from("hybrid_tests").update({ name: limpio }).eq("id", testId);
    if (error) return error.code === "23505" ? "Ya existe un testeo con ese nombre" : "No se pudo guardar";
    await cargarTesteos();
    return null;
  };

  // Desactivar en vez de borrar: el testeo deja de verse para los atletas
  // pero sus marcas históricas se conservan.
  const alternarActivoTesteo = async (testId, activoNuevo) => {
    setTesteos((prev) => prev.map((t) => (t.id === testId ? { ...t, active: activoNuevo } : t)));
    await supabase.from("hybrid_tests").update({ active: activoNuevo }).eq("id", testId);
  };

  return {
    testeos,
    marcas,
    cargandoHibrido,
    mejorMarca,
    historial,
    ranking,
    guardarMarca,
    borrarMarca,
    guardarMarcaAtleta,
    crearTesteo,
    renombrarTesteo,
    alternarActivoTesteo,
  };
}
