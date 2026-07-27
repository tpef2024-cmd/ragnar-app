// ── COMPONENTE: APP SHELL (layout responsive) ─────────────────────────────────
// En mobile: barra superior con logo + salir, tabs horizontales, contenido angosto.
// En desktop (>= DESKTOP_BREAKPOINT_PX): sidebar fija a la izquierda con navegación
// vertical, contenido ocupando el resto del ancho disponible.
// El cambio de layout es puro CSS (ver styles/globalStyles.js) para que responda
// a cambios de tamaño de ventana sin recalcular en JS.
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
}) {
  return (
    <div className="app-shell">
      {/* SIDEBAR — solo visible en desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={onLogoClick}>
          <LogoRagnar size="large" />
        </div>

        <div style={{ marginTop: 30, marginBottom: 6, fontSize: 9, color: Y, letterSpacing: 3, textTransform: "uppercase" }}>
          {rolLabel}
        </div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#fff", marginBottom: 30, letterSpacing: 1 }}>
          {nombreUsuario}
        </div>

        <nav className="sidebar-nav">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              className={`sidebar-tab ${tabActivo === key ? "on" : ""}`}
              onClick={() => onCambiarTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="btn-salir" style={{ marginTop: "auto" }} onClick={onSalir}>
          Salir
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        {/* BARRA SUPERIOR — solo visible en mobile */}
        <div className="mobile-topbar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ cursor: "pointer" }} onClick={onLogoClick}>
              <LogoRagnar />
            </div>
            <button className="btn-salir" onClick={onSalir}>Salir</button>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${Y},transparent)` }} />
          <div className="mobile-tabs">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                className={`tab ${tabActivo === key ? "on" : ""}`}
                onClick={() => onCambiarTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="content-inner fu">{children}</div>
      </div>
    </div>
  );
}
