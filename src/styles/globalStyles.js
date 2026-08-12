// ── ESTILOS GLOBALES ──────────────────────────────────────────────────────────
// Incluye: paleta con más contraste (Fase 1 - feedback profes) y layout
// responsive (sidebar en desktop, barra superior en mobile).
import { Y, CARD, BORDER, DESKTOP_BREAKPOINT_PX } from "../lib/constants";

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:${Y}}

  /* Tabs (usadas en mobile y en login) */
  .tab{padding:10px 16px;background:transparent;border:none;border-bottom:2px solid transparent;
    color:#7a7a7a;font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;
    letter-spacing:2px;cursor:pointer;transition:all .2s}
  .tab.on{color:${Y};border-bottom-color:${Y}}
  .tab:hover{color:#fff}

  .card{background:${CARD};border:1px solid ${BORDER};border-radius:2px;padding:18px}
  .mov{padding:7px 12px;background:#151515;border:1px solid #2a2a2a;color:#b3b3b3;
    font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;
    letter-spacing:1px;border-radius:2px;cursor:pointer;transition:all .15s}
  .mov.on{background:#1a1500;border-color:${Y};color:${Y}}
  .mov:hover{border-color:#666;color:#fff}
  .fila-pct{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1e1e1e}
  .fila-pct:last-child{border-bottom:none}
  .inp{width:100%;background:#080808;border:none;border-bottom:2px solid ${Y};
    color:#ffffff;font-family:'DM Mono',monospace;font-size:18px;padding:10px 12px;
    outline:none;letter-spacing:1px;margin-bottom:10px}
  .inp::placeholder{color:#555}
  .btn-y{width:100%;padding:13px;background:${Y};border:none;border-radius:2px;
    font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;
    color:#0a0a0a;cursor:pointer;transition:all .15s}
  .btn-y:hover{background:#ffd633;transform:translateY(-1px)}
  .btn-y:disabled{background:#333;color:#666;transform:none;cursor:not-allowed}
  .btn-salir{background:transparent;border:1px solid #333;color:#b3b3b3;
    font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;
    padding:6px 14px;cursor:pointer;border-radius:2px;transition:all .15s;text-transform:uppercase}
  .btn-salir:hover{border-color:${Y};color:${Y}}
  .badge-ok{background:#0d2b1a;color:#4ade80;border:1px solid #166534;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
  .badge-no{background:#2b0d0d;color:#f87171;border:1px solid #991b1b;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
  .chip-disc{padding:5px 12px;border-radius:2px;border:1px solid #2a2a2a;background:#151515;color:#b3b3b3;
    font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;transition:all .15s;text-transform:uppercase}
  .chip-disc.on{border-color:${Y};color:${Y};background:#1a1500}
  .tab-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;
    padding:0 4px;margin-left:6px;border-radius:8px;background:#f87171;color:#0a0a0a;
    font-family:'DM Mono',monospace;font-size:9px;font-weight:500;letter-spacing:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .fu{animation:fadeUp .3s ease forwards}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite;display:inline-block}

  /* ── LAYOUT: APP SHELL ──────────────────────────────────────────────────── */
  html, body, #root { height: 100%; }
  body { background: #0a0a0a; }

  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sidebar { display: none; } /* oculta por defecto, se activa en desktop */

  .main-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mobile-topbar {
    width: 100%;
    max-width: 480px;
    padding: 20px 20px 0;
  }

  .mobile-tabs {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid ${BORDER};
    margin-top: 4px;
  }

  .content-inner {
    width: 100%;
    max-width: 480px;
    padding: 24px 20px;
  }

  /* Vista Atletas del coach: lista de atletas + detalle del seleccionado.
     - Mobile: se navega entre una y otra (solo una visible a la vez), controlado
       por la clase view-atletas / view-detalle_atleta que pone CoachPanel.
     - Desktop: ambas conviven siempre lado a lado (ver el media query de abajo). */
  .coach-master-detail { display: block; }
  .coach-list-pane { display: block; }
  .coach-detail-pane { display: none; }
  .view-detalle_atleta .coach-list-pane { display: none; }
  .view-detalle_atleta .coach-detail-pane { display: block; }

  /* Tarjetas de acceso del Home (Tienda / App Atleta): apiladas en mobile,
     lado a lado desde tablet/desktop en adelante. */
  .home-accesos { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 480px) {
    .home-accesos { grid-template-columns: 1fr 1fr; }
  }

  /* ── DESKTOP (>= ${DESKTOP_BREAKPOINT_PX}px) ────────────────────────────── */
  @media (min-width: ${DESKTOP_BREAKPOINT_PX}px) {
    .app-shell {
      flex-direction: row;
      align-items: stretch;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      flex-shrink: 0;
      height: 100vh;
      position: sticky;
      top: 0;
      padding: 32px 24px;
      border-right: 1px solid ${BORDER};
      background: #0c0c0c;
    }

    .sidebar-logo { cursor: pointer; }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-tab {
      text-align: left;
      padding: 12px 14px;
      background: transparent;
      border: none;
      border-left: 2px solid transparent;
      color: #7a7a7a;
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all .15s;
      border-radius: 0 2px 2px 0;
    }
    .sidebar-tab.on { color: ${Y}; border-left-color: ${Y}; background: #1a1500; }
    .sidebar-tab:hover { color: #fff; }

    .mobile-topbar { display: none; }

    .main-content { flex: 1; justify-content: flex-start; }

    .content-inner {
      max-width: 1100px;
      padding: 40px 48px;
    }

    /* Grillas de tarjetas: más columnas al haber más espacio disponible */
    .grid-2 { grid-template-columns: repeat(4, 1fr) !important; }
    .grid-3 { grid-template-columns: repeat(3, 1fr) !important; max-width: 480px; }

    /* Vista de coach: lista de atletas a la izquierda, detalle a la derecha —
       ambas visibles siempre en desktop, sin importar qué tab de navegación esté activo */
    .coach-master-detail {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 32px;
      align-items: start;
    }
    .coach-list-pane { display: block !important; }
    .coach-detail-pane { display: block !important; }
  }
`;
