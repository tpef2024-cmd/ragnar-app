// ── COMPONENTE: APP SHELL (layout responsive) ─────────────────────────────────
// En mobile: barra superior con logo + salir, tabs horizontales, contenido angosto.
// En desktop (>= DESKTOP_BREAKPOINT_PX): sidebar fija a la izquierda con navegación
// vertical, contenido ocupando el resto del ancho disponible.
// El cambio de layout es puro CSS (ver styles/globalStyles.js) para que responda
// a cambios de tamaño de ventana sin recalcular en JS.
import { Link } from "react-router-dom";
import LogoRagnar from "../shared/LogoRagnar";
import { Y } from "../../lib/constants";

export default function AppShell({
  rolLabel,
  nombreUsuario,
  tabs,
  tabActivo,
  onCambiarTab,
  onLogoClick,
  onSalir,
  children,
  badges = {}, // { [tabKey]: numero } — muestra un contador rojo al lado del label
  vistaAlternativa = null, // texto del botón para cambiar coach ⇄ atleta (solo coaches)
  onCambiarVista,
}) {
  const botonVista = (estiloExtra) =>
    vistaAlternativa && (
      <button
        onClick={onCambiarVista}
        style={{
          background: "#1a1500",
          border: `1px solid ${Y}`,
          color: Y,
          fontFamily: "'DM Mono',monospace",
          fontSize: 9,
          letterSpacing: 1,
          padding: "6px 10px",
          borderRadius: 2,
          cursor: "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          ...estiloExtra,
        }}
      >
        ⇄ {vistaAlternativa}
      </button>
    );

  return (
    <div className="app-shell">
      {/* SIDEBAR — solo visible en desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={onLogoClick}>
          <LogoRagnar size="large" />
        </div>

        <div
          style={{
            marginTop: 30,
            marginBottom: 6,
            fontSize: 9,
            color: Y,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {rolLabel}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 20,
            color: "#fff",
            marginBottom: 30,
            letterSpacing: 1,
          }}
        >
          {nombreUsuario}
        </div>

        {botonVista({ marginTop: -14, marginBottom: 24, padding: "8px 10px" })}

        <nav className="sidebar-nav">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              className={`sidebar-tab ${tabActivo === key ? "on" : ""}`}
              onClick={() => onCambiarTab(key)}
            >
              {label}
              {!!badges[key] && (
                <span className="tab-badge">{badges[key]}</span>
              )}
            </button>
          ))}
        </nav>

        <button
          className="btn-salir"
          style={{ marginTop: "auto" }}
          onClick={onSalir}
        >
          Salir
        </button>
        <Link
          to="/tienda"
          style={{
            marginTop: 10,
            textAlign: "center",
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: "#7a7a7a",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Ver tienda
        </Link>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        {/* BARRA SUPERIOR — solo visible en mobile */}
        <div className="mobile-topbar">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ cursor: "pointer" }} onClick={onLogoClick}>
              <LogoRagnar />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link
                to="/tienda"
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  letterSpacing: 1,
                  color: "#7a7a7a",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                Tienda
              </Link>
              <button className="btn-salir" onClick={onSalir}>
                Salir
              </button>
            </div>
          </div>
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg,${Y},transparent)`,
            }}
          />
          {vistaAlternativa && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              {botonVista()}
            </div>
          )}
          <div className="mobile-tabs">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                className={`tab ${tabActivo === key ? "on" : ""}`}
                onClick={() => onCambiarTab(key)}
              >
                {label}
                {!!badges[key] && (
                  <span className="tab-badge">{badges[key]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="content-inner fu">{children}</div>
      </div>
    </div>
  );
}
