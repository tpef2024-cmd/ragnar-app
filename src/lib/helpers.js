// ── HELPERS GENERALES ─────────────────────────────────────────────────────────

// Formatear segundos a "min:seg" (ej: 272 -> "4:32")
export function formatearTiempo(segs) {
  if (!segs) return "—";
  const m = Math.floor(segs / 60);
  const s = segs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Convertir "4:32" a segundos totales (usado al guardar un For Time)
export function tiempoASegundos(tiempoStr) {
  const partes = tiempoStr.split(":");
  return partes.length === 2
    ? parseInt(partes[0]) * 60 + parseInt(partes[1])
    : parseInt(partes[0]);
}

// Obtener el registro más reciente de un movimiento dentro de una lista de RMs
export function obtenerRMDeLista(registros, movimiento) {
  const reg = registros.find((r) => r.movement === movimiento);
  return reg ? parseFloat(reg.weight_kg) : null;
}
