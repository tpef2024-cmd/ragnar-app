// ── TABS DEL COMERCIO RAGNERO ─────────────────────────────────────────────────
// Separadas de MerchantPanel.jsx para que ese archivo exporte solo componentes
// (requisito de Fast Refresh / regla react-refresh/only-export-components).
export const TABS_COMERCIO = [
  ["escanear", "📷 Escanear"],
  ["canjes", "🧾 Canjes"],
  ["mi_comercio", "🏪 Mi comercio"],
];

export const esTabComercio = (tab) => TABS_COMERCIO.some(([k]) => k === tab);
