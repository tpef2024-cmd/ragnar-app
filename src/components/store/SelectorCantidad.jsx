// ── COMPONENTE: SELECTOR DE CANTIDAD (− n +) ──────────────────────────────────
import { Y } from "../../lib/constants";

const estiloBoton = (habilitado) => ({
  width: 34,
  height: 34,
  background: "#151515",
  border: "1px solid #3a3a3a",
  color: habilitado ? "#fff" : "#444",
  fontFamily: "'DM Mono',monospace",
  fontSize: 16,
  lineHeight: 1,
  borderRadius: 2,
  cursor: habilitado ? "pointer" : "default",
});

export default function SelectorCantidad({ cantidad, maximo, onCambiar, compacto = false }) {
  const puedeSumar = cantidad < maximo;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compacto ? 6 : 10 }}>
      <button
        aria-label="Quitar uno"
        onClick={() => onCambiar(cantidad - 1)}
        style={estiloBoton(true)}
      >
        −
      </button>
      <div
        style={{
          minWidth: 24,
          textAlign: "center",
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 22,
          color: Y,
        }}
      >
        {cantidad}
      </div>
      <button
        aria-label="Sumar uno"
        onClick={() => puedeSumar && onCambiar(cantidad + 1)}
        disabled={!puedeSumar}
        title={puedeSumar ? undefined : "No hay más stock"}
        style={estiloBoton(puedeSumar)}
      >
        +
      </button>
    </div>
  );
}
