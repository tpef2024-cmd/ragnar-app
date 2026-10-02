// ── COMPONENTE: CARRITO (botón flotante + panel del pedido) ──────────────────
// El botón aparece abajo a la derecha cuando hay al menos un producto. Al
// tocarlo se abre el panel con el detalle, donde se ajustan cantidades y se
// confirma la compra: "Comprar por WhatsApp" abre el chat del gimnasio con el
// pedido completo ya escrito.
//   - Mobile: el panel sube desde abajo y ocupa todo el ancho.
//   - Desktop: se abre como columna a la derecha.
import { useEffect } from "react";
import { Y, BORDER } from "../../lib/constants";
import { useCarrito } from "../../hooks/useCarrito";
import { formatearPrecio, mensajeWhatsappCarrito } from "../../lib/whatsapp";
import SelectorCantidad from "./SelectorCantidad";

const estilos = `
.carrito-fab{position:fixed;right:20px;bottom:20px;z-index:40;display:flex;align-items:center;gap:10px;
  padding:12px 18px;background:${Y};color:#0a0a0a;border:none;border-radius:2px;cursor:pointer;
  font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;box-shadow:0 8px 24px rgba(0,0,0,.6)}
.carrito-fab:hover{background:#ffd633}
.carrito-fab-n{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;
  padding:0 6px;border-radius:11px;background:#0a0a0a;color:${Y};font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0}
.carrito-fondo{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.7);display:flex;align-items:flex-end;justify-content:center}
.carrito-panel{width:100%;max-height:85vh;display:flex;flex-direction:column;background:#0f0f0f;
  border-top:2px solid ${Y};animation:fadeUp .25s ease}
@media (min-width:768px){
  .carrito-fondo{justify-content:flex-end;align-items:stretch}
  .carrito-panel{width:400px;max-height:none;height:100%;border-top:none;border-left:2px solid ${Y}}
}
`;

export default function Carrito() {
  const {
    items,
    totalUnidades,
    total,
    cambiarCantidad,
    quitar,
    vaciar,
    abierto,
    abrir,
    cerrar,
  } = useCarrito();

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto, cerrar]);

  // Si se vacía el carrito con el panel abierto, se cierra solo
  useEffect(() => {
    if (abierto && items.length === 0) cerrar();
  }, [abierto, items.length, cerrar]);

  return (
    <>
      <style>{estilos}</style>

      {totalUnidades > 0 && !abierto && (
        <button className="carrito-fab" onClick={abrir} aria-label="Ver carrito">
          🛒 Carrito
          <span className="carrito-fab-n">{totalUnidades}</span>
          <span style={{ fontSize: 16, opacity: 0.8 }}>{formatearPrecio(total)}</span>
        </button>
      )}

      {abierto && (
        <div className="carrito-fondo" onClick={cerrar}>
          <div
            className="carrito-panel"
            role="dialog"
            aria-label="Tu pedido"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, color: "#fff" }}>
                Tu pedido
              </div>
              <button className="btn-salir" onClick={cerrar}>
                ✕ Cerrar
              </button>
            </div>

            {/* Productos */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
              {items.map((i) => (
                <div
                  key={i.id}
                  style={{ padding: "14px 0", borderBottom: "1px solid #1e1e1e" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#fff", marginBottom: 2 }}>{i.name}</div>
                      <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}>
                        {formatearPrecio(i.price)} c/u
                      </div>
                    </div>
                    <button
                      onClick={() => quitar(i.id)}
                      aria-label={`Quitar ${i.name}`}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#7a7a7a",
                        fontSize: 9,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        textDecoration: "underline",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                        padding: 0,
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SelectorCantidad
                      cantidad={i.cantidad}
                      maximo={i.stock}
                      onCambiar={(n) => cambiarCantidad(i, n)}
                      compacto
                    />
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#fff", letterSpacing: 1 }}>
                      {formatearPrecio(i.cantidad * i.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total y compra */}
            <div style={{ padding: "16px 20px 20px", borderTop: `1px solid ${BORDER}` }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 10, letterSpacing: 3, color: "#999", textTransform: "uppercase" }}>
                  Total
                </span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: Y, letterSpacing: 1 }}>
                  {formatearPrecio(total)}
                </span>
              </div>
              <a
                href={mensajeWhatsappCarrito(items)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-y"
                style={{ display: "block", textAlign: "center", textDecoration: "none" }}
              >
                Comprar por WhatsApp
              </a>
              <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, lineHeight: 1.6, textAlign: "center", margin: "10px 0 6px" }}>
                Se abre WhatsApp con tu pedido para coordinar el pago y la entrega con el gimnasio.
              </div>
              <button
                onClick={() => {
                  if (window.confirm("¿Vaciar el carrito?")) vaciar();
                }}
                style={{
                  display: "block",
                  margin: "0 auto",
                  background: "none",
                  border: "none",
                  color: "#7a7a7a",
                  fontSize: 9,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
