// ── HOOK: CARRITO ─────────────────────────────────────────────────────────────
// Acceso al carrito compartido de la tienda pública (ver CarritoProvider).
import { useContext } from "react";
import { CarritoContext } from "../lib/carritoContext";

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
