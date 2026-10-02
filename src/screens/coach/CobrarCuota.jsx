// ── COMPONENTE: COBRAR CUOTA (método de pago + combo o monto libre) ──────────
import { useState } from "react";
import { Y } from "../../lib/constants";

export default function CobrarCuota({ planes, periodoTexto, onConfirmar, onCancelar }) {
  const [metodo, setMetodo] = useState("efectivo"); // "efectivo" | "transferencia"
  const [planId, setPlanId] = useState(null);
  const [montoLibre, setMontoLibre] = useState("");
  const [usarMontoLibre, setUsarMontoLibre] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const campoPrecio =
    metodo === "efectivo" ? "price_efectivo" : "price_transferencia";
  const planSeleccionado = planes.find((p) => p.id === planId);
  const puedeConfirmar = usarMontoLibre
    ? Number(montoLibre) > 0
    : !!planSeleccionado;

  const handleConfirmar = async () => {
    setGuardando(true);
    await onConfirmar({
      planId: usarMontoLibre ? null : planId,
      monto: usarMontoLibre ? montoLibre : planSeleccionado?.[campoPrecio],
      metodo,
    });
    setGuardando(false);
  };

  return (
    <div className="card" style={{ marginTop: 8, borderColor: Y }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 3,
          color: "#999",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Cobrar cuota{periodoTexto ? ` — ${periodoTexto}` : ""}
      </div>

      {/* Método de pago — determina qué precio de combo se muestra */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          ["efectivo", "💵 Efectivo"],
          ["transferencia", "🏦 Transferencia"],
        ].map(([val, label]) => (
          <button
            key={val}
            className={`chip-disc ${metodo === val ? "on" : ""}`}
            onClick={() => setMetodo(val)}
            style={{ flex: 1, textAlign: "center" }}
          >
            {label}
          </button>
        ))}
      </div>

      {!usarMontoLibre ? (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {planes.map((plan) => (
              <button
                key={plan.id}
                className={`mov ${planId === plan.id ? "on" : ""}`}
                onClick={() => setPlanId(plan.id)}
              >
                {plan.name} — $
                {Number(plan[campoPrecio] || 0).toLocaleString("es-AR")}
              </button>
            ))}
          </div>
          <button
            onClick={() => setUsarMontoLibre(true)}
            style={{
              background: "none",
              border: "none",
              color: "#7a7a7a",
              fontSize: 9,
              letterSpacing: 1,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              marginBottom: 10,
            }}
          >
            o ingresar un monto libre
          </button>
        </>
      ) : (
        <>
          <input
            className="inp"
            type="number"
            placeholder="Monto $"
            value={montoLibre}
            onChange={(e) => setMontoLibre(e.target.value)}
          />
          <button
            onClick={() => setUsarMontoLibre(false)}
            style={{
              background: "none",
              border: "none",
              color: "#7a7a7a",
              fontSize: 9,
              letterSpacing: 1,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              marginBottom: 10,
            }}
          >
            o elegir un combo
          </button>
        </>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn-y"
          style={{ flex: 1 }}
          onClick={handleConfirmar}
          disabled={!puedeConfirmar || guardando}
        >
          {guardando ? <span className="spin">◌</span> : "✓ CONFIRMAR COBRO"}
        </button>
        <button
          onClick={onCancelar}
          style={{
            background: "transparent",
            border: "1px solid #3a3a3a",
            color: "#999",
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            padding: "0 16px",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
