// ── CONSTANTES GLOBALES ───────────────────────────────────────────────────────

// Movimientos de RM disponibles para atletas de Crossfit
export const MOVIMIENTOS = [
  "Back Squat",
  "Deadlift",
  "Clean & Jerk",
  "Snatch",
  "Press",
  "Bench Press",
];

export const PORCENTAJES = [50, 60, 70, 75, 80, 85, 90, 95, 100];
export const DISCIPLINAS = [
  "Crossfit",
  "Funcional",
  "Adultos Mayores",
  "Niños",
];

// ── PALETA DE COLORES ─────────────────────────────────────────────────────────
// NOTA (Fase 1 - contraste): los grises oscuros (#444, #333) que antes se usaban
// para texto se reemplazaron por tonos más claros en los componentes, para
// mejorar la legibilidad en celular. Estas son las bases del tema oscuro.
export const Y = "#F5C400"; // amarillo Ragnar
export const BG = "#0a0a0a"; // fondo negro
export const CARD = "#131313"; // fondo tarjeta (antes #111, se subió un poco para más contraste con BG)
export const BORDER = "#2a2a2a"; // borde de tarjeta (antes #1e1e1e, más visible ahora)

// Texto: escala de grises con más contraste que la versión original
export const TEXT_PRIMARY = "#ffffff"; // texto principal (antes gris #f0ede6)
export const TEXT_SECONDARY = "#b3b3b3"; // texto secundario (antes #888/#555, ilegible en celu)
export const TEXT_MUTED = "#7a7a7a"; // texto terciario/labels (antes #444/#333)

// ── HORARIOS Y FRECUENCIAS DISPONIBLES ───────────────────────────────────────
export const HORARIOS = ["7AM", "8AM", "10AM", "6PM", "8PM"];
export const FRECUENCIAS = [
  "2x semana",
  "3x semana",
  "4x semana",
  "5x semana",
  "6x semana",
];

// ── SEGURIDAD ──────────────────────────────────────────────────────────────
// Tiempo de inactividad antes de cerrar sesión automáticamente (en milisegundos)
export const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos
// Tiempo de aviso previo antes de desloguear (se muestra un modal de countdown)
export const INACTIVITY_WARNING_MS = 60 * 1000; // 60 segundos

// ── LAYOUT ─────────────────────────────────────────────────────────────────
// Breakpoint a partir del cual se activa el layout de escritorio (sidebar + grilla)
export const DESKTOP_BREAKPOINT_PX = 1024;
