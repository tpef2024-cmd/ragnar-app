// ── CONSTANTES GLOBALES ───────────────────────────────────────────────────────

// Movimientos de RM disponibles, según la disciplina del atleta.
// "Adultos Mayores" y "Niños" quedan sin movimientos de RM por ahora — a
// esas disciplinas no se les carga esta sección hasta que se defina qué
// marcas tiene sentido pedirles.
export const MOVIMIENTOS_POR_DISCIPLINA = {
  Crossfit: [
    "Deadlift",
    "Back Squat",
    "Front Squat",
    "Clean and Split Jerk",
    "Clean and Jerk",
    "Bench Press",
    "Push Press",
    "Shoulder Press",
    "Squat Clean",
    "Power Clean",
    "Snatch",
    "Power Snatch",
  ],
  Funcional: [
    "Goblet Squat",
    "Bench Press DB",
    "Deadlift KB",
    "DB Snatch",
    "Swing Ruso",
  ],
  "Adultos Mayores": [],
  Niños: [],
};

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

// ── ASISTENCIA POR QR ─────────────────────────────────────────────────────
// Código fijo que debe contener el QR impreso en la entrada del gimnasio.
// Si en algún momento se quiere invalidar el QR viejo (por ejemplo, se perdió
// el cartel y hay que asegurarse de que nadie use una foto vieja), alcanza
// con cambiar este valor y volver a imprimir un QR nuevo con el mismo texto.
export const QR_CHECKIN_CODE = "RAGNAR-GYM-CHECKIN-2026";

// ── LAYOUT ─────────────────────────────────────────────────────────────────
// Breakpoint a partir del cual se activa el layout de escritorio (sidebar + grilla)
export const DESKTOP_BREAKPOINT_PX = 1024;
