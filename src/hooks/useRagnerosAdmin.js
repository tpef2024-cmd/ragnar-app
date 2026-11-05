// ── HOOK: ADMINISTRACIÓN DE COMERCIOS RAGNEROS (coach) ────────────────────────
// Solicitudes de comercios, descuentos y métricas de cupones.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { mesActualISO } from "../lib/fechas";

export function useRagnerosAdmin(usuario, activo) {
  const [comercios, setComercios] = useState([]);
  const [descuentos, setDescuentos] = useState([]);
  const [cupones, setCupones] = useState([]); // solo discount_id + status + period, para métricas

  const cargarComercios = useCallback(async () => {
    const { data } = await supabase
      .from("businesses")
      .select("*, owner:profiles!businesses_owner_id_fkey(full_name, role)")
      .order("created_at", { ascending: true });
    setComercios(data || []);
  }, []);

  const cargarDescuentos = useCallback(async () => {
    const { data } = await supabase.from("discounts").select("*").order("valid_until", { ascending: false });
    setDescuentos(data || []);
  }, []);

  const cargarCupones = useCallback(async () => {
    const { data } = await supabase.from("coupons").select("discount_id, status, period");
    setCupones(data || []);
  }, []);

  useEffect(() => {
    if (activo && usuario) {
      cargarComercios();
      cargarDescuentos();
      cargarCupones();
    }
  }, [activo, usuario, cargarComercios, cargarDescuentos, cargarCupones]);

  // Aprobar / suspender / rechazar / volver a habilitar un comercio
  const cambiarEstadoComercio = async (businessId, status) => {
    setComercios((prev) => prev.map((c) => (c.id === businessId ? { ...c, status } : c)));
    const { data, error } = await supabase.rpc("set_business_status", { p_business: businessId, p_status: status });
    if (error || !data?.ok) await cargarComercios();
    return !error && data?.ok;
  };

  const guardarDescuento = async (datos) => {
    const fila = {
      business_id: datos.business_id,
      percentage: Number(datos.percentage),
      title: datos.title.trim(),
      conditions: datos.conditions?.trim() || null,
      valid_from: datos.valid_from,
      valid_until: datos.valid_until,
      active: datos.active ?? true,
    };
    const consulta = datos.id
      ? supabase.from("discounts").update(fila).eq("id", datos.id)
      : supabase.from("discounts").insert({ ...fila, created_by: usuario.id });
    const { error } = await consulta;
    if (error) return { error: "No se pudo guardar el descuento. Revisá porcentaje (1-100), título y fechas." };
    await cargarDescuentos();
    return { error: null };
  };

  const cambiarActivoDescuento = async (discountId, active) => {
    setDescuentos((prev) => prev.map((d) => (d.id === discountId ? { ...d, active } : d)));
    await supabase.from("discounts").update({ active }).eq("id", discountId);
  };

  const metricas = (discountId) => {
    const propios = cupones.filter((c) => c.discount_id === discountId);
    const delMes = propios.filter((c) => c.period === mesActualISO());
    const canjeados = (lista) => lista.filter((c) => c.status === "redeemed").length;
    return {
      emitidosMes: delMes.length,
      canjeadosMes: canjeados(delMes),
      canjeadosTotal: canjeados(propios),
    };
  };

  const pendientes = comercios.filter((c) => c.status === "pending");

  return {
    comercios,
    pendientes,
    descuentos,
    metricas,
    cambiarEstadoComercio,
    guardarDescuento,
    cambiarActivoDescuento,
    recargar: () => Promise.all([cargarComercios(), cargarDescuentos(), cargarCupones()]),
  };
}
