// ── HELPERS DE FECHAS (zona horaria Argentina) ────────────────────────────────
// La base valida la vigencia con la fecha de Buenos Aires, así que la UI usa
// la misma referencia para no mostrar "vigente" algo que el servidor rechaza.

const TZ = "America/Argentina/Buenos_Aires";

// "2026-11-04" — mismo formato que las columnas `date` de Supabase
export function hoyAR() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

// "2026-11-30" → "30/11/2026" (sin pasar por Date para no correr el día)
export function fechaCorta(isoDate) {
  if (!isoDate) return "";
  const [a, m, d] = String(isoDate).slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

// Timestamp → "04/11/2026 18:32"
export function fechaHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Nombre del mes en curso: "noviembre"
export function mesActualAR() {
  return new Date().toLocaleDateString("es-AR", { timeZone: TZ, month: "long" });
}

// Mes en curso como "período" de cupón: "2026-11-01" (igual que mes_ar() en la base)
export function mesActualISO() {
  return hoyAR().slice(0, 7) + "-01";
}

// "2026-11-01" → "2026-11-30"
export function finDeMes(periodISO) {
  const [a, m] = String(periodISO).slice(0, 7).split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return `${a}-${String(m).padStart(2, "0")}-${String(ultimo).padStart(2, "0")}`;
}

// "2026-12-01" → "diciembre"
export function nombreMes(periodISO) {
  const [a, m] = String(periodISO).slice(0, 7).split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString("es-AR", { month: "long", timeZone: "UTC" });
}

// Último día de uso de un cupón: fin de su mes o fin del descuento, lo que
// ocurra primero (misma regla que vence_cupon() en la base)
export function venceCupon(cupon, descuento) {
  const fin = finDeMes(cupon.period);
  return descuento?.valid_until && descuento.valid_until < fin ? descuento.valid_until : fin;
}

// Días que faltan hasta una fecha "YYYY-MM-DD" (0 = vence hoy)
export function diasHasta(isoDate) {
  const hoy = new Date(hoyAR() + "T00:00:00");
  const fin = new Date(String(isoDate).slice(0, 10) + "T00:00:00");
  return Math.round((fin - hoy) / 86400000);
}
