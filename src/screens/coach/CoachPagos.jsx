// ── TAB: PAGOS (coach) ────────────────────────────────────────────────────────
import { useState } from "react";
import CoachPlanes from "./CoachPlanes";
import CobrarCuota from "./CobrarCuota";
import { Y } from "../../lib/constants";

export default function CoachPagos({
  atletas,
  pagos,
  planes,
  pagadoEsteMes,
  ingresosDelMes,
  onCobrarCuota,
  onRevertirPago,
  onGuardarPrecioPlan,
}) {
  const [cobrandoA, setCobrandoA] = useState(null); // id del atleta al que se le está cobrando

  // Obtener el detalle del pago de un atleta (para mostrar combo/monto en la fila)
  const detallePago = (atletaId) =>
    pagos.find((p) => p.athlete_id === atletaId);
  const nombrePlan = (planId) => planes.find((p) => p.id === planId)?.name;

  const handleConfirmarCobro = async (atletaId, datos) => {
    await onCobrarCuota(atletaId, datos);
    setCobrandoA(null);
  };

  return (
    <>
      {/* Balance mensual */}
      <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: 3,
            color: "#999",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Ingresos del mes
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 44,
            color: Y,
            lineHeight: 1,
          }}
        >
          ${ingresosDelMes.toLocaleString("es-AR")}
        </div>
      </div>

      <CoachPlanes planes={planes} onGuardarPrecio={onGuardarPrecioPlan} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {atletas.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              color: "#555",
              fontSize: 10,
              letterSpacing: 2,
            }}
          >
            SIN ATLETAS REGISTRADOS AÚN
          </div>
        )}
        {atletas.map((a) => {
          const pago = pagadoEsteMes(a.id);
          const detalle = detallePago(a.id);
          return (
            <div key={a.id}>
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2, color: "#fff" }}>
                    {a.full_name}
                  </div>
                  {pago ? (
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "#4ade80",
                      }}
                    >
                      ✓ Al día —{" "}
                      {detalle?.plan_id
                        ? nombrePlan(detalle.plan_id)
                        : "monto libre"}{" "}
                      · ${Number(detalle?.amount || 0).toLocaleString("es-AR")}
                      {detalle?.payment_method && (
                        <span style={{ color: "#7a7a7a" }}>
                          {" "}
                          ·{" "}
                          {detalle.payment_method === "efectivo"
                            ? "💵 Efectivo"
                            : "🏦 Transferencia"}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: 1,
                        color: "#f87171",
                      }}
                    >
                      Cuota pendiente
                    </div>
                  )}
                </div>

                {!pago ? (
                  <button
                    onClick={() =>
                      setCobrandoA(cobrandoA === a.id ? null : a.id)
                    }
                    style={{
                      background: "#0d2b1a",
                      border: "1px solid #166534",
                      color: "#4ade80",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "7px 12px",
                      borderRadius: 2,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    {cobrandoA === a.id ? "✕ Cerrar" : "$ Cobrar cuota"}
                  </button>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span className="badge-ok">AL DÍA</span>
                    <button
                      onClick={() => onRevertirPago(a.id)}
                      title="Revertir pago (por si fue un error)"
                      style={{
                        background: "transparent",
                        border: "1px solid #3a3a3a",
                        color: "#7a7a7a",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        padding: "5px 8px",
                        borderRadius: 2,
                        cursor: "pointer",
                      }}
                    >
                      ↺ Revertir
                    </button>
                  </div>
                )}
              </div>

              {cobrandoA === a.id && (
                <CobrarCuota
                  planes={planes}
                  onConfirmar={(datos) => handleConfirmarCobro(a.id, datos)}
                  onCancelar={() => setCobrandoA(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
