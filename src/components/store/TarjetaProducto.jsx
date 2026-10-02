// ── COMPONENTE: TARJETA DE PRODUCTO ───────────────────────────────────────────
// Compartido entre la tienda pública y la vista de Promociones.
// "Agregar al carrito" suma el producto; si ya está, se muestra el selector
// de cantidad (limitado al stock). La compra se cierra desde el carrito.
import { Y } from "../../lib/constants";
import { formatearPrecio } from "../../lib/whatsapp";
import { useCarrito } from "../../hooks/useCarrito";
import SelectorCantidad from "./SelectorCantidad";

export default function TarjetaProducto({ producto }) {
  const { cantidadDe, agregar, cambiarCantidad } = useCarrito();
  const sinStock = producto.stock <= 0;
  const enCarrito = cantidadDe(producto.id);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          background: "#0c0c0c",
          border: "1px solid #222",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {producto.image_url ? (
          <img
            src={producto.image_url}
            alt={producto.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>
            Sin imagen
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: 15, color: "#fff", marginBottom: 4 }}>{producto.name}</div>
        {producto.description && (
          <div style={{ fontSize: 10, color: "#999", lineHeight: 1.5, marginBottom: 8 }}>
            {producto.description}
          </div>
        )}
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: Y, letterSpacing: 1 }}>
          {formatearPrecio(producto.price)}
        </div>
      </div>

      {sinStock ? (
        <div style={{ textAlign: "center", padding: "10px", fontSize: 9, letterSpacing: 2, color: "#f87171", textTransform: "uppercase" }}>
          Sin stock
        </div>
      ) : enCarrito > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: 2, color: "#4ade80", textTransform: "uppercase" }}>
            ✓ En el carrito
          </span>
          <SelectorCantidad
            cantidad={enCarrito}
            maximo={producto.stock}
            onCambiar={(n) => cambiarCantidad(producto, n)}
            compacto
          />
        </div>
      ) : (
        <button className="btn-y" onClick={() => agregar(producto)}>
          Agregar
        </button>
      )}
    </div>
  );
}
