// ── HOOK: DATOS DEL COMERCIO RAGNERO ──────────────────────────────────────────
// Perfil del comercio, sus descuentos (los define Ragnar, acá son solo lectura),
// historial de canjes y validación/canje de cupones vía RPC redeem_coupon.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { comprimirImagenLogo } from "../lib/imagenLogo";

const BUCKET = "business-media";
const CAMPOS_EDITABLES = ["name", "category", "description", "address", "phone", "instagram", "website"];

export function useComercio(usuario, activo) {
  const [negocio, setNegocio] = useState(null);
  const [descuentos, setDescuentos] = useState([]);
  const [canjes, setCanjes] = useState([]);

  const cargarNegocio = useCallback(async () => {
    if (!usuario) return null;
    const { data } = await supabase.from("businesses").select("*").eq("owner_id", usuario.id).maybeSingle();
    setNegocio(data || null);
    return data;
  }, [usuario]);

  const cargarDescuentos = useCallback(async (businessId) => {
    if (!businessId) return;
    const { data } = await supabase
      .from("discounts")
      .select("*")
      .eq("business_id", businessId)
      .order("valid_until", { ascending: false });
    setDescuentos(data || []);
  }, []);

  const cargarCanjes = useCallback(async () => {
    const { data } = await supabase.rpc("comercio_canjes");
    setCanjes(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    if (!activo || !usuario) return;
    cargarNegocio().then((n) => cargarDescuentos(n?.id));
    cargarCanjes();
  }, [activo, usuario, cargarNegocio, cargarDescuentos, cargarCanjes]);

  // Guardar info del comercio (nunca toca status/owner: lo bloquea la base)
  const guardarPerfil = async (campos) => {
    const limpio = {};
    for (const k of CAMPOS_EDITABLES) {
      if (k in campos) limpio[k] = typeof campos[k] === "string" ? campos[k].trim() || null : campos[k];
    }
    if (!limpio.name || limpio.name.length < 2) return { error: "El nombre del comercio es obligatorio" };
    const { data, error } = await supabase.from("businesses").update(limpio).eq("id", negocio.id).select().single();
    if (error) return { error: "No se pudo guardar. Revisá que los textos no sean demasiado largos." };
    setNegocio(data);
    return { error: null };
  };

  // Subir logo o portada. tipo: "logo" | "cover"
  const subirImagen = async (tipo, file) => {
    if (!file?.type?.startsWith("image/")) return { error: "El archivo tiene que ser una imagen" };
    const { blob, ext } = await comprimirImagenLogo(file, tipo === "logo" ? 512 : 1200);
    const ruta = `${negocio.id}/${tipo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(ruta, blob, { contentType: blob.type });
    if (error) return { error: "No se pudo subir la imagen" };

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
    const columna = tipo === "logo" ? "logo_url" : "cover_url";
    const anterior = negocio[columna];
    const { data, error: errUpd } = await supabase
      .from("businesses")
      .update({ [columna]: pub.publicUrl })
      .eq("id", negocio.id)
      .select()
      .single();
    if (errUpd) return { error: "No se pudo guardar la imagen" };
    setNegocio(data);

    // Borrar la imagen anterior para no acumular archivos en el bucket
    const marca = `/${BUCKET}/`;
    if (anterior?.includes(marca)) {
      await supabase.storage.from(BUCKET).remove([anterior.split(marca)[1]]);
    }
    return { error: null };
  };

  // Valida sin consumir (confirmar = false) o canjea (confirmar = true)
  const procesarCupon = async (codigo, confirmar) => {
    const { data, error } = await supabase.rpc("redeem_coupon", { p_codigo: codigo, p_confirmar: confirmar });
    if (error) return { ok: false, motivo: "Error de conexión. Probá de nuevo." };
    if (data?.canjeado) cargarCanjes();
    return data;
  };

  return {
    negocio,
    descuentos,
    canjes,
    cargarCanjes,
    guardarPerfil,
    subirImagen,
    validarCupon: (codigo) => procesarCupon(codigo, false),
    canjearCupon: (codigo) => procesarCupon(codigo, true),
  };
}
