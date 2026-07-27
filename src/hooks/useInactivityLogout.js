// ── HOOK: CIERRE DE SESIÓN POR INACTIVIDAD ────────────────────────────────────
// Escucha actividad del usuario (mouse, teclado, touch, scroll) y cierra la
// sesión automáticamente si no hay interacción durante INACTIVITY_TIMEOUT_MS.
// Antes de desloguear, muestra un aviso de countdown (INACTIVITY_WARNING_MS)
// para que el usuario pueda seguir conectado con un solo click.
import { useEffect, useRef, useState, useCallback } from "react";
import { INACTIVITY_TIMEOUT_MS, INACTIVITY_WARNING_MS } from "../lib/constants";

const EVENTOS_ACTIVIDAD = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

// activo: solo debe correr cuando hay una sesión iniciada (usuario logueado)
export function useInactivityLogout(activo, onLogout) {
  const [avisoVisible, setAvisoVisible] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(
    INACTIVITY_WARNING_MS / 1000,
  );

  const timerAviso = useRef(null);
  const timerLogout = useRef(null);
  const intervaloCountdown = useRef(null);

  // Limpia todos los timers activos
  const limpiarTimers = useCallback(() => {
    clearTimeout(timerAviso.current);
    clearTimeout(timerLogout.current);
    clearInterval(intervaloCountdown.current);
  }, []);

  // Reinicia el ciclo completo de inactividad (se llama en cada evento de actividad)
  const reiniciarTimers = useCallback(() => {
    limpiarTimers();
    setAvisoVisible(false);
    if (!activo) return;

    // Timer que dispara el aviso previo al logout
    timerAviso.current = setTimeout(() => {
      setAvisoVisible(true);
      setSegundosRestantes(INACTIVITY_WARNING_MS / 1000);
      // Countdown visual del aviso
      intervaloCountdown.current = setInterval(() => {
        setSegundosRestantes((prev) => Math.max(prev - 1, 0));
      }, 1000);
      // Timer final que efectivamente cierra la sesión
      timerLogout.current = setTimeout(() => {
        clearInterval(intervaloCountdown.current);
        onLogout();
      }, INACTIVITY_WARNING_MS);
    }, INACTIVITY_TIMEOUT_MS - INACTIVITY_WARNING_MS);
  }, [activo, limpiarTimers, onLogout]);

  // El usuario eligió "seguir conectado" desde el modal de aviso
  const seguirConectado = useCallback(() => {
    reiniciarTimers();
  }, [reiniciarTimers]);

  useEffect(() => {
    if (!activo) return undefined;

    reiniciarTimers();
    EVENTOS_ACTIVIDAD.forEach((evento) =>
      window.addEventListener(evento, reiniciarTimers),
    );

    // Limpieza: corre al desmontar o justo antes de que el efecto se repita
    // (por ejemplo, cuando "activo" pasa a false al cerrar sesión)
    return () => {
      limpiarTimers();
      setAvisoVisible(false);
      EVENTOS_ACTIVIDAD.forEach((evento) =>
        window.removeEventListener(evento, reiniciarTimers),
      );
    };
  }, [activo, reiniciarTimers, limpiarTimers]);

  return { avisoVisible, segundosRestantes, seguirConectado };
}
