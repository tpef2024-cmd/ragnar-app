// ── CONTEXTO: CARRITO DE LA TIENDA ────────────────────────────────────────────
// El objeto de contexto vive en su propio archivo para que el Provider
// (componente) y el hook useCarrito puedan importarlo sin depender entre sí.
import { createContext } from "react";

export const CarritoContext = createContext(null);
