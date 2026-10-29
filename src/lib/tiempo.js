// ── HELPERS: TIEMPOS HH:MM:SS ─────────────────────────────────────────────────
// Las marcas de Híbrido se guardan en segundos (int) y se muestran como HH:MM:SS.

// "1:05:30" | "05:30" | "330" → segundos (int). Devuelve null si es inválido.
export function parsearTiempo(texto) {
  if (!texto) return null;
  const partes = texto.trim().split(":").map((p) => p.trim());
  if (partes.length > 3 || partes.some((p) => p === "" || !/^\d+$/.test(p))) return null;

  const nums = partes.map(Number);
  while (nums.length < 3) nums.unshift(0); // completa con horas/minutos en 0
  const [h, m, s] = nums;

  // Si escribió minutos/segundos, no pueden pasar de 59 (salvo valor único en segundos)
  if (partes.length > 1 && (m > 59 || s > 59)) return null;

  const total = h * 3600 + m * 60 + s;
  return total > 0 ? total : null;
}

// segundos → "HH:MM:SS"
export function formatearTiempo(segundos) {
  if (segundos == null) return "--:--:--";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// Autoformato mientras el usuario tipea: "13025" → "01:30:25"
export function autoformatearTiempo(texto) {
  const digitos = texto.replace(/\D/g, "").slice(-6);
  if (!digitos) return "";
  const rellenado = digitos.padStart(6, "0");
  return `${rellenado.slice(0, 2)}:${rellenado.slice(2, 4)}:${rellenado.slice(4, 6)}`;
}
