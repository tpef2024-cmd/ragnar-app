// ── HELPER: MENSAJE DE WHATSAPP PARA COMPRAS ──────────────────────────────────
// Número de WhatsApp del gimnasio para consultas de compra (formato: código
// de país + número, sin espacios ni el signo +. Ej: "5491122334455").
export const WHATSAPP_GYM = "5492914683833";

export function mensajeWhatsapp(producto) {
  const texto = `Hola! Quiero comprar: ${producto.name} ($${producto.price})`;
  return `https://wa.me/${WHATSAPP_GYM}?text=${encodeURIComponent(texto)}`;
}
