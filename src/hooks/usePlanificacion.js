// ── HOOK: PLANIFICACIÓN (PDFs para atletas que no pueden venir) ───────────────
// Tablas plan_habilitaciones + training_plans y bucket privado
// "planificaciones" (ver supabase/migrations/20261124_planificacion.sql).
//   · Atleta: ve si tiene la tab habilitada y descarga sus PDFs.
//   · Profe/dueño: habilita hasta una fecha, sube y borra PDFs de un atleta.
// Los PDFs se abren con URL firmada (el bucket es privado): vence en 1 hora.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { hoyAR } from "../lib/fechas";

const BUCKET = "planificaciones";
const VALIDEZ_URL_SEG = 3600;
export const MAX_PDF_MB = 10;

// ¿La habilitación sigue vigente hoy? (fecha de Buenos Aires, igual que la base)
export const planVigente = (hasta) => !!hasta && hasta >= hoyAR();

async function conUrls(planes) {
  if (!planes.length) return [];
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(planes.map((p) => p.file_path), VALIDEZ_URL_SEG);
  return planes.map((p, i) => ({ ...p, url: data?.[i]?.signedUrl || null }));
}

async function cargarPlanes(atletaId) {
  const { data } = await supabase
    .from("training_plans")
    .select("id, athlete_id, title, file_path, created_at")
    .eq("athlete_id", atletaId)
    .order("created_at", { ascending: false });
  return conUrls(data || []);
}

async function cargarHasta(atletaId) {
  const { data } = await supabase
    .from("plan_habilitaciones")
    .select("hasta")
    .eq("athlete_id", atletaId)
    .maybeSingle();
  return data?.hasta || null;
}

// ── Lado atleta ──────────────────────────────────────────────────────────────
// `activo` = está en su vista de atleta (carga liviana: solo la fecha).
// Los PDFs se piden recién al abrir la tab (`cargarPdfs`).
export function usePlanificacionAtleta(usuario, activo) {
  const [hasta, setHasta] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [cargandoPdfs, setCargandoPdfs] = useState(false);

  useEffect(() => {
    if (!usuario || !activo) return;
    let vivo = true;
    cargarHasta(usuario.id).then((h) => vivo && setHasta(h));
    return () => {
      vivo = false;
    };
  }, [usuario, activo]);

  const cargarPdfs = useCallback(async () => {
    if (!usuario) return;
    setCargandoPdfs(true);
    const [h, p] = await Promise.all([cargarHasta(usuario.id), cargarPlanes(usuario.id)]);
    setHasta(h);
    setPlanes(p);
    setCargandoPdfs(false);
  }, [usuario]);

  return { hasta, habilitado: planVigente(hasta), planes, cargandoPdfs, cargarPdfs };
}

// ── Lado profe (ficha de un atleta) ──────────────────────────────────────────
export function usePlanificacionCoach(atletaId, usuarioId, activo) {
  const [hasta, setHasta] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    const [h, p] = await Promise.all([cargarHasta(atletaId), cargarPlanes(atletaId)]);
    setHasta(h);
    setPlanes(p);
    setCargando(false);
  }, [atletaId]);

  useEffect(() => {
    if (!activo || !atletaId) return;
    let vivo = true;
    Promise.all([cargarHasta(atletaId), cargarPlanes(atletaId)]).then(([h, p]) => {
      if (!vivo) return;
      setHasta(h);
      setPlanes(p);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [atletaId, activo]);

  // Habilitar (o cambiar la fecha). `fecha` = "YYYY-MM-DD"
  const habilitar = async (fecha) => {
    const { error } = await supabase
      .from("plan_habilitaciones")
      .upsert({ athlete_id: atletaId, hasta: fecha, updated_by: usuarioId, updated_at: new Date().toISOString() });
    if (!error) setHasta(fecha);
    return !error;
  };

  const quitar = async () => {
    const { error } = await supabase.from("plan_habilitaciones").delete().eq("athlete_id", atletaId);
    if (!error) setHasta(null);
    return !error;
  };

  // Sube el PDF al bucket y registra la fila. Si falla el registro, borra el
  // archivo para no dejar huérfanos. Devuelve un mensaje de error o null.
  const subir = async (archivo, titulo) => {
    if (archivo.type !== "application/pdf" && !/\.pdf$/i.test(archivo.name)) return "El archivo tiene que ser PDF.";
    if (archivo.size > MAX_PDF_MB * 1024 * 1024) return `El PDF supera los ${MAX_PDF_MB} MB.`;
    const path = `${atletaId}/${crypto.randomUUID()}.pdf`;
    const { error: errSubida } = await supabase.storage
      .from(BUCKET)
      .upload(path, archivo, { contentType: "application/pdf", upsert: false });
    if (errSubida) return "No se pudo subir el PDF. Probá de nuevo.";
    const { error } = await supabase.from("training_plans").insert({
      athlete_id: atletaId,
      title: titulo.trim().slice(0, 120) || "Planificación",
      file_path: path,
      uploaded_by: usuarioId,
    });
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      return "No se pudo guardar la planificación. Probá de nuevo.";
    }
    await recargar();
    return null;
  };

  const borrar = async (plan) => {
    const { error } = await supabase.from("training_plans").delete().eq("id", plan.id);
    if (error) return false;
    await supabase.storage.from(BUCKET).remove([plan.file_path]);
    setPlanes((prev) => prev.filter((p) => p.id !== plan.id));
    return true;
  };

  return { hasta, habilitado: planVigente(hasta), planes, cargando, habilitar, quitar, subir, borrar, recargar };
}
