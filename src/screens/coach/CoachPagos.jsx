// ── TAB: PAGOS (coach) ────────────────────────────────────────────────────────
import { useState } from "react";
import CoachPlanes from "./CoachPlanes";
import CobrarCuota from "./CobrarCuota";
import { Y } from "../../lib/constants";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Mueve un período { mes, anio } n meses (negativo = hacia atrás)
const moverPeriodo = ({ mes, anio }, n) => {
  const total = anio * 12 + (mes - 1) + n;
  return { mes: (total % 12) + 1, anio: Math.floor(total / 12) };
};

// Diferencia en meses entre un período y el mes actual (0 = mes actual)
const mesesDesdeHoy = ({ mes, anio }) => {
  const hoy = new Date();
  return anio * 12 + (mes - 1) - (hoy.getFullYear() * 12 + hoy.getMonth());
};

const estiloFlecha = (habilitada) => ({
  background: "transparent",
  border: "1px solid #3a3a3a",
  color: habilitada ? "#ddd" : "#333",
  fontFamily: "'DM Mono',monospace",
  fontSize: 14,
  width: 36,
  height: 36,
  borderRadius: 2,
  cursor: habilitada ? "pointer" : "default",
});

export default function CoachPagos({
  atletas,
  pagos,
  planes,
  periodo,
  onCambiarPeriodo,
  pagadoEnPeriodo,
  ingresosPeriodo,
  onCobrarCuota,
  onRevertirPago,
  onGuardarPrecioPlan,
  esDueno = false, // los profes no ven ingresos ni editan precios
}) {
  const [cobrandoA, setCobrandoA] = useState(null); // id del atleta al que se le está cobrando
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos"); // "todos" | "deben" | "aldia"

  // Buscador por nombre + filtro por estado de pago del mes elegido.
  // Los que deben quedan primero, después alfabético.
  const atletasFiltrados = atletas
    .filter((a) => {
      const coincide = (a.full_name || "")
        .toLowerCase()
        .includes(busqueda.trim().toLowerCase());
      const pago = pagadoEnPeriodo(a.id);
      const estado = filtro === "todos" || (filtro === "deben" ? !pago : pago);
      return coincide && estado;
    })
    .sort(
      (a, b) =>
        Number(pagadoEnPeriodo(a.id)) - Number(pagadoEnPeriodo(b.id)) ||
        (a.full_name || "").localeCompare(b.full_name || "", "es"),
    );
  const cantDeben = atletas.filter((a) => !pagadoEnPeriodo(a.id)).length;

  // Obtener el detalle del pago de un atleta (para mostrar combo/monto en la fila)
  const detallePago = (atletaId) =>
    pagos.find((p) => p.athlete_id === atletaId);
  const nombrePlan = (planId) => planes.find((p) => p.id === planId)?.name;

  const handleConfirmarCobro = async (atletaId, datos) => {
    await onCobrarCuota(atletaId, datos);
    setCobrandoA(null);
  };

  // Navegación entre meses: hacia atrás sin límite (cuotas atrasadas) y hasta
  // un mes hacia adelante (cuotas pagadas por adelantado)
  const diferencia = mesesDesdeHoy(periodo);
  const esMesActual = diferencia === 0;
  const puedeAvanzar = diferencia < 1;
  const cambiarMes = (n) => {
    setCobrandoA(null);
    onCambiarPeriodo(moverPeriodo(periodo, n));
  };
  const etiquetaPeriodo =
    diferencia === 0 ? "Mes actual" : diferencia > 0 ? "Mes próximo" : "Mes anterior";
  const textoSinPago = diferencia < 0 ? "No pagó" : "Cuota pendiente";

  return (
    <>
      {/* Selector de mes */}
      <div
        className="card"
        style={{
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          borderColor: esMesActual ? undefined : Y,
        }}
      >
        <button
          onClick={() => cambiarMes(-1)}
          title="Mes anterior"
          style={estiloFlecha(true)}
        >
          ←
        </button>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 24,
              letterSpacing: 2,
              color: esMesActual ? "#fff" : Y,
              lineHeight: 1,
            }}
          >
            {MESES[periodo.mes - 1]} {periodo.anio}
          </div>
          {esMesActual ? (
            <div style={{ fontSize: 8, letterSpacing: 2, color: "#7a7a7a", textTransform: "uppercase", marginTop: 4 }}>
              {etiquetaPeriodo}
            </div>
          ) : (
            <button
              onClick={() => cambiarMes(-diferencia)}
              style={{
                background: "none",
                border: "none",
                color: "#7a7a7a",
                fontSize: 8,
                letterSpacing: 2,
                textTransform: "uppercase",
                textDecoration: "underline",
                cursor: "pointer",
                marginTop: 4,
                padding: 0,
              }}
            >
              {etiquetaPeriodo} · volver al actual
            </button>
          )}
        </div>
        <button
          onClick={() => puedeAvanzar && cambiarMes(1)}
          disabled={!puedeAvanzar}
          title="Mes siguiente"
          style={estiloFlecha(puedeAvanzar)}
        >
          →
        </button>
      </div>

      {esDueno ? (
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
          Ingresos de {MESES[periodo.mes - 1].toLowerCase()}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 44,
            color: Y,
            lineHeight: 1,
          }}
        >
          ${ingresosPeriodo.toLocaleString("es-AR")}
        </div>
      </div>

      <CoachPlanes planes={planes} onGuardarPrecio={onGuardarPrecioPlan} />
        </>
      ) : (
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a7a7a", textTransform: "uppercase", margin: "8px 0 12px", textAlign: "center" }}>
          Cuotas de Kids y Teens
        </div>
      )}

      {/* Buscador + filtro */}
      <input
        className="inp"
        placeholder="Buscar atleta..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          ["todos", `Todos (${atletas.length})`],
          ["deben", `${textoSinPago} (${cantDeben})`],
          ["aldia", `Al día (${atletas.length - cantDeben})`],
        ].map(([val, label]) => (
          <button
            key={val}
            className={`chip-disc ${filtro === val ? "on" : ""}`}
            onClick={() => setFiltro(val)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {atletas.length > 0 && atletasFiltrados.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#555", fontSize: 10, letterSpacing: 2 }}>
            SIN RESULTADOS
          </div>
        )}
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
            {esDueno ? "SIN ATLETAS REGISTRADOS AÚN" : "SIN ATLETAS DE KIDS O TEENS"}
          </div>
        )}
        {atletasFiltrados.map((a) => {
          const pago = pagadoEnPeriodo(a.id);
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
                      {textoSinPago}
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
