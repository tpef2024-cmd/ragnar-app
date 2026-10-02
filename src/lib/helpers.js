// ── HELPERS GENERALES ─────────────────────────────────────────────────────────
import { MOVIMIENTOS_POR_DISCIPLINA, DISCIPLINAS_COBRO_PROFE } from "./constants";

// ¿El usuario logueado puede ver/manejar el pago de este atleta?
// Dueños: todos. Profes: solo atletas de Kids o Teens. (La base de datos
// aplica la misma regla por RLS — esto es solo para no mostrar en pantalla
// estados de pago que el profe no puede consultar.)
export function puedeManejarPago(esDueno, atleta) {
  return esDueno || DISCIPLINAS_COBRO_PROFE.includes(atleta?.discipline);
}

// Devuelve la lista de movimientos de RM que corresponde a una disciplina.
// Si el atleta todavía no tiene disciplina asignada (perfil nuevo, sin
// asignar por el coach), se usa Crossfit como fallback para no dejarlo sin
// nada — es mejor mostrar algo por defecto que romper la pantalla.
export function movimientosDeDisciplina(discipline) {
  if (discipline && discipline in MOVIMIENTOS_POR_DISCIPLINA) {
    return MOVIMIENTOS_POR_DISCIPLINA[discipline];
  }
  return MOVIMIENTOS_POR_DISCIPLINA.Crossfit;
}

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
