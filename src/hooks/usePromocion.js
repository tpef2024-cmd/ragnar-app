// ── HOOK: PROMOCIONES ───────────────────────────────────────────────────────
// Maneja el "banner" de promo (una sola activa a la vez) y los productos
// marcados con on_promo. Ver migración 20260816_promociones.sql.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { comprimirImagen } from "../lib/imagen";
import { ordenarCatalogo } from "./useTienda";

// Uso público — sin login. Trae la promo activa (si hay alguna) y los
// productos activos marcados como on_promo.
export function usePromocionPublica() {
  const [promo, setPromo] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const [{ data: promos }, { data: prods }] = await Promise.all([
      supabase.from("promotions").select("*").eq("active", true).limit(1),
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("on_promo", true),
    ]);
    setPromo(promos?.[0] || null);
    setProductos(ordenarCatalogo(prods || []));
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { promo, productos, cargando, recargar: cargar };
}

// Versión liviana — solo para saber si hay una promo activa y mostrar un
// aviso/link (ej: en el header de la Tienda), sin traer los productos.
export function usePromoActiva() {
  const [promo, setPromo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase
      .from("promotions")
      .select("id, title")
      .eq("active", true)
      .limit(1)
      .then(({ data }) => {
        setPromo(data?.[0] || null);
        setCargando(false);
      });
  }, []);

  return { promo, cargando };
}

// Uso desde el panel Coach — gestión del banner de promo.
export function usePromocionCoach(usuario, activo) {
  const [promos, setPromos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarPromos = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos(data || []);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (activo && usuario) cargarPromos();
  }, [activo, usuario, cargarPromos]);

  // Crear una promo nueva (queda pausada por defecto — el coach la activa
  // después con el botón correspondiente, para poder previsualizarla antes).
  const crearPromo = async (title, image_url) => {
    const { data, error } = await supabase
      .from("promotions")
      .insert({ title, image_url, active: false })
      .select()
      .single();
    if (!error && data) setPromos((prev) => [data, ...prev]);
    return { data, error };
  };

  const editarPromo = async (id, cambios) => {
    const { data, error } = await supabase
      .from("promotions")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setPromos((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    return { data, error };
  };

  // Activar una promo — primero desactiva la que esté activa (si hay alguna,
  // incluida ella misma si ya lo estuviera) y después activa la elegida.
  // Se hace en dos pasos porque el índice único de la base solo permite una
  // fila con active = true a la vez.
  const activarPromo = async (id) => {
    await supabase
      .from("promotions")
      .update({ active: false })
      .eq("active", true);
    const { data, error } = await supabase
      .from("promotions")
      .update({ active: true })
      .eq("id", id)
      .select()
      .single();
    if (!error) {
      setPromos((prev) => prev.map((p) => ({ ...p, active: p.id === id })));
    }
    return { data, error };
  };

  const desactivarPromo = async (id) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: false } : p)),
    );
    await supabase.from("promotions").update({ active: false }).eq("id", id);
  };

  const borrarPromo = async (id) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("promotions").delete().eq("id", id);
  };

  // Reutiliza el mismo bucket de imágenes de productos — no hace falta uno
  // aparte solo para las fotos de promo.
  const subirImagenPromo = async (file) => {
    const archivoFinal = await comprimirImagen(file);
    const extension = archivoFinal.name.split(".").pop();
    const nombreArchivo = `promo-${crypto.randomUUID()}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("product-images")
      .upload(nombreArchivo, archivoFinal, {
        cacheControl: "3600",
        upsert: false,
      });

    if (errorSubida) return { url: null, error: errorSubida };

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(nombreArchivo);

    return { url: data.publicUrl, error: null };
  };

  return {
    promos,
    cargando,
    crearPromo,
    editarPromo,
    activarPromo,
    desactivarPromo,
    borrarPromo,
    subirImagenPromo,
  };
}
