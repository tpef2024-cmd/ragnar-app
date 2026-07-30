// ── COMPONENTE: GESTIÓN DE COMBOS DE CUOTA (coach) ────────────────────────────
// Permite editar el precio de cada combo, por separado para efectivo y
// transferencia (el gimnasio cobra distinto según el medio de pago).
import { useState } from "react";
import { Y } from "../../lib/constants";

// Fila de precio editable para un método de pago puntual (efectivo o transferencia)
function PrecioEditable({ label, valor, onGuardar }) {
  const [editando, setEditando] = useState(false);
  const [temp, setTemp] = useState(String(valor ?? ""));
  const [guardando, setGuardando] = useState(false);

  const confirmar = async () => {
    setGuardando(true);
    await onGuardar(Number(temp) || 0);
    setGuardando(false);
    setEditando(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "#7a7a7a",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {editando ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#999", fontSize: 12 }}>$</span>
          <input
            className="inp"
            type="number"
            autoFocus
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
            style={{
              width: 80,
              marginBottom: 0,
              fontSize: 13,
              padding: "5px 8px",
            }}
          />
          <button
            onClick={confirmar}
            disabled={guardando}
            style={{
              background: Y,
              border: "none",
              color: "#0a0a0a",
              fontSize: 10,
              padding: "6px 9px",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            ✓
          </button>
          <button
            onClick={() => setEditando(false)}
            style={{
              background: "transparent",
              border: "1px solid #3a3a3a",
              color: "#999",
              fontSize: 10,
              padding: "6px 9px",
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 17,
              color: Y,
            }}
          >
            ${Number(valor || 0).toLocaleString("es-AR")}
          </div>
          <button
            onClick={() => setEditando(true)}
            style={{
              background: "transparent",
              border: "1px solid #3a3a3a",
              color: "#999",
              fontSize: 8,
              letterSpacing: 1,
              padding: "4px 8px",
              borderRadius: 2,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}

export default function CoachPlanes({ planes, onGuardarPrecio }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 3,
          color: "#999",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        Combos de cuota
      </div>
      <div style={{ fontSize: 9, color: "#7a7a7a", marginBottom: 12 }}>
        Precio por combo, separado por método de pago.
      </div>

      {planes.length === 0 && (
        <div style={{ fontSize: 10, color: "#999" }}>
          Sin combos cargados — corré el SQL de configuración inicial en
          Supabase.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {planes.map((plan) => (
          <div
            key={plan.id}
            style={{ paddingBottom: 10, borderBottom: "1px solid #1e1e1e" }}
          >
            <div style={{ fontSize: 13, color: "#fff", marginBottom: 4 }}>
              {plan.name}
            </div>
            <PrecioEditable
              label="💵 Efectivo"
              valor={plan.price_efectivo}
              onGuardar={(v) => onGuardarPrecio(plan.id, "price_efectivo", v)}
            />
            <PrecioEditable
              label="🏦 Transferencia"
              valor={plan.price_transferencia}
              onGuardar={(v) =>
                onGuardarPrecio(plan.id, "price_transferencia", v)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
