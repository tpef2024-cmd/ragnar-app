// ── HOOK: BENEFICIOS DEL ATLETA ───────────────────────────────────────────────
// Descuentos vigentes de comercios Ragneros, cupones del atleta y estado de
// su cuota. Emitir el cupón se hace por RPC (claim_coupon): la base valida
// que el atleta esté aprobado, con la cuota del mes paga y el descuento vigente.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { hoyAR, mesActualISO } from "../lib/fechas";

const CAMPOS_COMERCIO = "id, name, category, description, address, phone, instagram, website, logo_url, cover_url, owner_id";

export function useBeneficios(usuario, activo) {
  const [descuentos, setDescuentos] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [cuotaAlDia, setCuotaAlDia] = useState(null); // null = cargando
  const [cargando, setCargando] = useState(true);

  const cargarDescuentos = useCallback(async () => {
    const hoy = hoyAR();
    const { data } = await supabase
      .from("discounts")
      .select(`*, businesses(${CAMPOS_COMERCIO})`)
      .eq("active", true)
      .lte("valid_from", hoy)
      .gte("valid_until", hoy)
      .order("valid_until", { ascending: true });
    // Si el comercio no está aprobado, RLS no lo devuelve → se descarta
    setDescuentos((data || []).filter((d) => d.businesses));
  }, []);

  const cargarCupones = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from("coupons")
      .select(`*, discounts(*, businesses(${CAMPOS_COMERCIO}))`)
      .eq("athlete_id", usuario.id)
      .order("issued_at", { ascending: false });
    setCupones(data || []);
  }, [usuario]);

  const cargarCuota = useCallback(async () => {
    const { data, error } = await supabase.rpc("mi_cuota_al_dia");
    setCuotaAlDia(error ? false : !!data);
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    await Promise.all([cargarDescuentos(), cargarCupones(), cargarCuota()]);
    setCargando(false);
  }, [cargarDescuentos, cargarCupones, cargarCuota]);

  useEffect(() => {
    if (activo && usuario) recargar();
  }, [activo, usuario, recargar]);

  // Devuelve { ok, cupon } o { ok: false, motivo }
  const obtenerCupon = async (discountId) => {
    const { data, error } = await supabase.rpc("claim_coupon", { p_discount: discountId });
    if (error) return { ok: false, motivo: "No se pudo generar el cupón. Probá de nuevo." };
    if (data?.ok) await cargarCupones();
    if (data?.codigo === "cuota") setCuotaAlDia(false);
    return data;
  };

  // Cupón del atleta para un descuento EN EL MES EN CURSO (o undefined).
  // Los cupones son mensuales: el del mes pasado ya no sirve y se puede sacar otro.
  const cuponDe = (discountId) => {
    const mes = mesActualISO();
    return cupones.find((c) => c.discount_id === discountId && c.period === mes);
  };

  return {
    descuentos,
    cupones,
    cuotaAlDia,
    cargando,
    recargar,
    obtenerCupon,
    cuponDe,
  };
}
