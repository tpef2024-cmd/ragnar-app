// ── HOOK: DATOS DE LA TIENDA ────────────────────────────────────────────────────
// Carga de productos (pública) y funciones de gestión (solo coach).
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";

// Orden de exhibición: agrupado por categoría (alfabético), y dentro de cada
// categoría por nombre de producto (alfabético) — así el catálogo se navega
// como cualquier tienda real, con todo lo de "Proteínas" junto, después
// "Creatina", etc. Se aplica siempre sobre el estado en memoria, así no
// importa qué operación lo haya modificado (alta, edición, ajuste de stock,
// etc.) — el orden queda consistente en todo momento.
function ordenarCatalogo(lista) {
  return [...lista].sort((a, b) => {
    const categoriaA = (a.category || "").toLowerCase();
    const categoriaB = (b.category || "").toLowerCase();
    if (categoriaA !== categoriaB)
      return categoriaA.localeCompare(categoriaB, "es");
    return (a.name || "")
      .toLowerCase()
      .localeCompare((b.name || "").toLowerCase(), "es");
  });
}

// Uso público — catálogo visible sin login. Solo trae productos activos
// (la política RLS ya filtra esto del lado del servidor).
export function useProductosPublicos() {
  const [productosCrudo, setProductosCrudo] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true);
    setProductosCrudo(data || []);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const productos = useMemo(
    () => ordenarCatalogo(productosCrudo),
    [productosCrudo],
  );

  return { productos, cargando, recargar: cargar };
}

// Uso desde el panel Coach — trae todos los productos (activos e inactivos)
// y expone las funciones de alta/edición/baja/stock.
export function useTiendaCoach(usuario, activo) {
  const [productosCrudo, setProductosCrudo] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase.from("products").select("*");
    setProductosCrudo(data || []);
    setCargando(false);
  }, []);

  useEffect(() => {
    if (activo && usuario) cargarProductos();
  }, [activo, usuario, cargarProductos]);

  // Crear un producto nuevo
  const crearProducto = async (producto) => {
    const { data, error } = await supabase
      .from("products")
      .insert(producto)
      .select()
      .single();
    if (!error && data) setProductosCrudo((prev) => [data, ...prev]);
    return { data, error };
  };

  // Editar campos de un producto existente (nombre, precio, descripción, etc.)
  const editarProducto = async (id, cambios) => {
    const { data, error } = await supabase
      .from("products")
      .update(cambios)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setProductosCrudo((prev) => prev.map((p) => (p.id === id ? data : p)));
    }
    return { data, error };
  };

  // Ajustar solo el stock — atajo usado por los botones +/- en la tarjeta
  const ajustarStock = async (id, nuevoStock) => {
    const stockFinal = Math.max(0, nuevoStock);
    setProductosCrudo((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: stockFinal } : p)),
    );
    await supabase.from("products").update({ stock: stockFinal }).eq("id", id);
  };

  // Activar/pausar un producto (se oculta de la tienda pública sin borrarlo)
  const alternarActivo = async (id, activoActual) => {
    const nuevoActivo = !activoActual;
    setProductosCrudo((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: nuevoActivo } : p)),
    );
    await supabase
      .from("products")
      .update({ active: nuevoActivo })
      .eq("id", id);
  };

  // Borrar un producto definitivamente
  const borrarProducto = async (id) => {
    setProductosCrudo((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  // Subir una foto al bucket "product-images" y devolver su URL pública.
  // El nombre de archivo se genera random para evitar choques entre fotos
  // con el mismo nombre subidas por distintos productos.
  const subirImagen = async (file) => {
    const extension = file.name.split(".").pop();
    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("product-images")
      .upload(nombreArchivo, file, { cacheControl: "3600", upsert: false });

    if (errorSubida) return { url: null, error: errorSubida };

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(nombreArchivo);

    return { url: data.publicUrl, error: null };
  };

  const productos = useMemo(
    () => ordenarCatalogo(productosCrudo),
    [productosCrudo],
  );

  return {
    productos,
    cargando,
    crearProducto,
    editarProducto,
    ajustarStock,
    alternarActivo,
    borrarProducto,
    subirImagen,
  };
}
