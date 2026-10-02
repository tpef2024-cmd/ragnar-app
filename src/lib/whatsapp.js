// ── HELPER: MENSAJE DE WHATSAPP PARA COMPRAS ──────────────────────────────────
// Número de WhatsApp del gimnasio para consultas de compra (formato: código
// de país + número, sin espacios ni el signo +. Ej: "5491122334455").
export const WHATSAPP_GYM = "5492914683833";

export const formatearPrecio = (n) =>
  `$${(Number(n) || 0).toLocaleString("es-AR")}`;

// Link de WhatsApp con el pedido completo del carrito:
//   Hola! Quiero hacer este pedido:
//   • 2 x Remera Ragnar ($15.000 c/u) = $30.000
//   • 1 x Creatina = $25.000
//   Total: $55.000
export function mensajeWhatsappCarrito(items) {
  const lineas = items.map((i) => {
    const subtotal = formatearPrecio(i.cantidad * i.price);
    return i.cantidad > 1
      ? `• ${i.cantidad} x ${i.name} (${formatearPrecio(i.price)} c/u) = ${subtotal}`
      : `• 1 x ${i.name} = ${subtotal}`;
  });
  const total = items.reduce((t, i) => t + i.cantidad * i.price, 0);
  const texto = [
    "Hola! Quiero hacer este pedido:",
    ...lineas,
    `Total: ${formatearPrecio(total)}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP_GYM}?text=${encodeURIComponent(texto)}`;
}
