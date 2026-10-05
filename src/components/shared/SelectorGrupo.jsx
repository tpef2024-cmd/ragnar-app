// ── COMPONENTE: SELECTOR DE GRUPO (horario + frecuencia) ─────────────────────
import { useState } from "react";
import { Y, HORARIOS, HORARIOS_LABEL, FRECUENCIAS } from "../../lib/constants";
import { etiquetaGrupo } from "../../lib/helpers";

const estiloSelect = {
  width: "100%",
  background: "#080808",
  border: "1px solid #2a2a2a",
  color: "#f0ede6",
  fontFamily: "'DM Mono',monospace",
  fontSize: 12,
  padding: "10px 12px",
  borderRadius: 2,
  outline: "none",
  cursor: "pointer",
  marginBottom: 10,
  appearance: "auto",
};

const estiloLabel = {
  fontSize: 9,
  color: "#7a7a7a",
  letterSpacing: 2,
  marginBottom: 6,
  textTransform: "uppercase",
};

export default function SelectorGrupo({ grupos, onSeleccionar, onCancelar }) {
  const [horario, setHorario] = useState("");
  const [frecuencia, setFrecuencia] = useState("");

  // Buscar el grupo que coincide con la combinación seleccionada
  const grupoSeleccionado = grupos.find(
    (g) => g.name === `${horario} — ${frecuencia}`,
  );

  return (
    <div>
      <div style={estiloLabel}>Horario</div>
      <select value={horario} onChange={(e) => setHorario(e.target.value)} style={estiloSelect}>
        <option value="" disabled>Seleccioná horario...</option>
        {HORARIOS.map((h) => (
          <option key={h} value={h}>{HORARIOS_LABEL[h] || h}</option>
        ))}
      </select>

      <div style={estiloLabel}>Frecuencia semanal</div>
      <select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} style={estiloSelect}>
        <option value="" disabled>Seleccioná frecuencia...</option>
        {FRECUENCIAS.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      {/* Botón confirmar — aparece solo cuando ambos están seleccionados */}
      {grupoSeleccionado && (
        <button
          onClick={() => onSeleccionar(grupoSeleccionado.id)}
          style={{
            width: "100%",
            background: "#1a1500",
            border: `1px solid ${Y}`,
            color: Y,
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            padding: "10px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ✓ Confirmar — {etiquetaGrupo(grupoSeleccionado.name)}
        </button>
      )}
      {onCancelar && (
        <button
          onClick={onCancelar}
          style={{
            background: "transparent",
            border: "1px solid #2a2a2a",
            color: "#7a7a7a",
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: 2,
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
