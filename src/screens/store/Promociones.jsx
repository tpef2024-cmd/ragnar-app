// ── PANTALLA: PROMOCIONES ─────────────────────────────────────────────────────
// Muestra el banner de la promo activa (si hay alguna) y los productos que
// el coach marcó como parte de esa promo. Pública, sin login.
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePromocionPublica } from "../../hooks/usePromocion";
import LogoRagnar from "../../components/shared/LogoRagnar";
import TarjetaProducto from "../../components/store/TarjetaProducto";
import Carrito from "../../components/store/Carrito";
import { useCarrito } from "../../hooks/useCarrito";
import { globalStyles } from "../../styles/globalStyles";
import { Y } from "../../lib/constants";

export default function Promociones() {
  const { promo, productos, cargando } = usePromocionPublica();
  const { sincronizar } = useCarrito();

  // Actualizar precios/stock de los productos en promo que ya estén en el
  // carrito (los demás productos del carrito no se tocan desde acá)
  useEffect(() => {
    if (!cargando) sincronizar(productos);
  }, [cargando, productos, sincronizar]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <style>{globalStyles}</style>
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <LogoRagnar />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Link to="/tienda" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 1, color: "#7a7a7a", textDecoration: "none", textTransform: "uppercase" }}>
              ← Tienda
            </Link>
            <Link to="/app" className="btn-salir" style={{ textDecoration: "none" }}>
              Ingresar a mi perfil
            </Link>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${Y},transparent)` }} />
      </div>

      <div className="fu" style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "36px 20px 110px" }}>
        {cargando && (
          <div style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 10, letterSpacing: 2 }}>
            CARGANDO...
          </div>
        )}

        {!cargando && !promo && (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 3, marginBottom: 8 }}>
              NO HAY PROMOCIONES ACTIVAS
            </div>
            <div style={{ fontSize: 11 }}>
              Mirá el resto del catálogo en{" "}
              <Link to="/tienda" style={{ color: Y, textDecoration: "none" }}>la tienda</Link>.
            </div>
          </div>
        )}

        {!cargando && promo && (
          <>
            {/* Banner de la promo */}
            <div
              className="card"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 20,
                marginBottom: 36,
                padding: 20,
              }}
            >
              {promo.image_url && (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    flexShrink: 0,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${Y}`,
                  }}
                >
                  <img src={promo.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 9, color: Y, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
                  ★ Promoción
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: 2, color: "#fff", lineHeight: 1.1 }}>
                  {promo.title}
                </div>
              </div>
            </div>

            {productos.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#555", fontSize: 10, letterSpacing: 2 }}>
                TODAVÍA NO HAY PRODUCTOS SUMADOS A ESTA PROMO
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {productos.map((p) => (
                  <TarjetaProducto key={p.id} producto={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Carrito />
    </div>
  );
}
