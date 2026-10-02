// ── PANTALLA: TIENDA PÚBLICA ──────────────────────────────────────────────────
// Catálogo de productos visible SIN necesidad de estar logueado. Los atletas
// (o cualquier visitante) pueden ver los productos y su stock disponible.
// Los productos se suman a un carrito y desde ahí "Comprar por WhatsApp"
// abre el chat del gimnasio con el pedido completo — la integración
// de cobro online (Mercado Pago) queda para una etapa siguiente.
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductosPublicos } from "../../hooks/useTienda";
import { usePromoActiva } from "../../hooks/usePromocion";
import LogoRagnar from "../../components/shared/LogoRagnar";
import TarjetaProducto from "../../components/store/TarjetaProducto";
import Carrito from "../../components/store/Carrito";
import { useCarrito } from "../../hooks/useCarrito";
import { globalStyles } from "../../styles/globalStyles";
import { Y } from "../../lib/constants";

// Agrupa la lista (ya viene ordenada por categoría desde el hook) en bloques
// consecutivos por categoría, para poder renderizar un encabezado por grupo.
function agruparPorCategoria(productos) {
  const grupos = [];
  for (const p of productos) {
    const nombreCategoria = p.category?.trim() || "Otros";
    const ultimoGrupo = grupos[grupos.length - 1];
    if (ultimoGrupo && ultimoGrupo.categoria === nombreCategoria) {
      ultimoGrupo.items.push(p);
    } else {
      grupos.push({ categoria: nombreCategoria, items: [p] });
    }
  }
  return grupos;
}

export default function Tienda() {
  const { productos, cargando } = useProductosPublicos();
  const { promo: promoActiva } = usePromoActiva();
  const grupos = agruparPorCategoria(productos);
  const { sincronizar } = useCarrito();

  // Al cargar el catálogo, actualizar precios/stock de lo que ya estaba en el
  // carrito y sacar lo que dejó de estar a la venta
  useEffect(() => {
    if (!cargando) sincronizar(productos, { completo: true });
  }, [cargando, productos, sincronizar]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <style>{globalStyles}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 20px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            <LogoRagnar />
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10,
                letterSpacing: 1,
                color: "#7a7a7a",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              Inicio
            </Link>
            <Link
              to="/app"
              className="btn-salir"
              style={{ textDecoration: "none" }}
            >
              Ingresar a mi perfil
            </Link>
          </div>
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg,${Y},transparent)`,
          }}
        />
      </div>

      <div
        className="fu"
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "36px 20px 110px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 32,
                letterSpacing: 3,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              TIENDA
            </div>
            <div style={{ fontSize: 11, color: "#999", letterSpacing: 1 }}>
              Indumentaria y suplementos Ragnar Cross Training
            </div>
          </div>

          {promoActiva && (
            <Link
              to="/promociones"
              style={{
                display: "inline-block",
                textDecoration: "none",
                transform: "rotate(-4deg)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 34,
                  letterSpacing: 2,
                  color: Y,
                  lineHeight: 1,
                  textShadow: `0 0 24px ${Y}55`,
                  whiteSpace: "nowrap",
                }}
              >
                ★ Promos!!
              </div>
              <div
                style={{
                  height: 3,
                  background: Y,
                  marginTop: 4,
                  borderRadius: 2,
                }}
              />
            </Link>
          )}
        </div>

        {cargando && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#555",
              fontSize: 10,
              letterSpacing: 2,
            }}
          >
            CARGANDO...
          </div>
        )}

        {!cargando && productos.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#555",
              fontSize: 10,
              letterSpacing: 2,
            }}
          >
            TODAVÍA NO HAY PRODUCTOS CARGADOS
          </div>
        )}

        {!cargando && productos.length > 0 && (
          <div>
            {grupos.map((grupo) => (
              <div key={grupo.categoria} style={{ marginBottom: 36 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 18,
                    letterSpacing: 3,
                    color: Y,
                    textTransform: "uppercase",
                    marginBottom: 14,
                    paddingBottom: 8,
                    borderBottom: "1px solid #222",
                  }}
                >
                  {grupo.categoria}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  {grupo.items.map((p) => (
                    <TarjetaProducto key={p.id} producto={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Carrito />
    </div>
  );
}
