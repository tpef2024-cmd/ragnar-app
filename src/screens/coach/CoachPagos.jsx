// ── TAB: PAGOS (coach) ────────────────────────────────────────────────────────
export default function CoachPagos({ atletas, pagadoEsteMes, onMarcarPagado }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {atletas.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          SIN ATLETAS REGISTRADOS AÚN
        </div>
      )}
      {atletas.map((a) => {
        const pago = pagadoEsteMes(a.id);
        return (
          <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, marginBottom: 2, color: "#fff" }}>{a.full_name}</div>
              <div style={{ fontSize: 9, letterSpacing: 1, color: pago ? "#4ade80" : "#f87171" }}>
                {pago ? "✓ Al día este mes" : "Cuota pendiente"}
              </div>
            </div>
            {!pago ? (
              <button
                onClick={() => onMarcarPagado(a.id)}
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
                ✓ Marcar pagado
              </button>
            ) : (
              <span className="badge-ok">AL DÍA</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
