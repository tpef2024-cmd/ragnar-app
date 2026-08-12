// ── PANTALLA: TIENDA PÚBLICA ──────────────────────────────────────────────────
// Catálogo de productos visible SIN necesidad de estar logueado. Los atletas
// (o cualquier visitante) pueden ver los productos y su stock disponible.
// El botón "Comprar" abre WhatsApp con un mensaje prearmado — la integración
// de cobro online (Mercado Pago) queda para una etapa siguiente.
import { Link } from "react-router-dom";
import { useProductosPublicos } from "../../hooks/useTienda";
import LogoRagnar from "../../components/shared/LogoRagnar";
import { globalStyles } from "../../styles/globalStyles";
import { Y } from "../../lib/constants";

// Número de WhatsApp del gimnasio para consultas de compra — reemplazar por
// el número real cuando lo tengan (formato: código de país + número, sin
// espacios ni el signo +. Ej: "5491122334455").
const WHATSAPP_GYM = "5492914683833";

function mensajeWhatsapp(producto) {
  const texto = `Hola! Quiero comprar: ${producto.name} ($${producto.price})`;
  return `https://wa.me/${WHATSAPP_GYM}?text=${encodeURIComponent(texto)}`;
}

function TarjetaProducto({ producto }) {
  const sinStock = producto.stock <= 0;

  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
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
          <span
            style={{
              fontSize: 10,
              color: "#444",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Sin imagen
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: 15, color: "#fff", marginBottom: 4 }}>
          {producto.name}
        </div>
        {producto.description && (
          <div
            style={{
              fontSize: 10,
              color: "#999",
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            {producto.description}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 24,
            color: Y,
            letterSpacing: 1,
          }}
        >
          ${producto.price}
        </div>
      </div>

      {sinStock ? (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            fontSize: 9,
            letterSpacing: 2,
            color: "#f87171",
            textTransform: "uppercase",
          }}
        >
          Sin stock
        </div>
      ) : (
        <a
          href={mensajeWhatsapp(producto)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-y"
          style={{
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          Comprar
        </a>
      )}
    </div>
  );
}

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
  const grupos = agruparPorCategoria(productos);

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
          padding: "36px 20px 60px",
        }}
      >
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
        <div
          style={{
            fontSize: 11,
            color: "#999",
            letterSpacing: 1,
            marginBottom: 28,
          }}
        >
          Indumentaria y suplementos Ragnar Cross Training
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
    </div>
  );
}
