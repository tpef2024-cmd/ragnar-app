// ── TAB: SOLICITUDES (coach) ───────────────────────────────────────────────────
// Lista de atletas que se registraron y confirmaron su email, pero todavía
// no fueron autorizados a ingresar (pendientes), y de atletas a los que se
// les revocó el acceso (por si retoman la actividad y hay que reactivarlos).
// El coach puede aprobar/rechazar cada solicitud, o reactivar un acceso
// revocado, desde acá.
import { useState } from "react";

function formatearFecha(fechaIso) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function BotonAccion({ children, color, disabled, onClick }) {
  const colores = {
    verde: { bg: "#0f1f13", border: "#4ade80", color: "#4ade80" },
    rojo: { bg: "#1f0f0f", border: "#f87171", color: "#f87171" },
    amarillo: { bg: "#1a1500", border: "#F5C400", color: "#F5C400" },
  }[color];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: colores.bg,
        border: `1px solid ${colores.border}`,
        color: colores.color,
        fontFamily: "'DM Mono',monospace",
        fontSize: 9,
        letterSpacing: 1,
        padding: "6px 10px",
        borderRadius: 2,
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

function TituloSeccion({ children }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: 3,
        color: "#999",
        textTransform: "uppercase",
        margin: "20px 0 10px",
      }}
    >
      {children}
    </div>
  );
}

export default function CoachSolicitudes({
  pendientes,
  revocados,
  onAprobar,
  onRechazar,
  onReactivar,
}) {
  const [procesandoId, setProcesandoId] = useState(null);

  const manejar = async (fn, atletaId) => {
    setProcesandoId(atletaId);
    await fn(atletaId);
    setProcesandoId(null);
  };

  const sinNada = pendientes.length === 0 && revocados.length === 0;

  if (sinNada) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 32,
          color: "#555",
          fontSize: 10,
          letterSpacing: 2,
        }}
      >
        NO HAY SOLICITUDES PENDIENTES
      </div>
    );
  }

  return (
    <div>
      {pendientes.length > 0 && (
        <>
          <TituloSeccion>
            Solicitudes pendientes ({pendientes.length})
          </TituloSeccion>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendientes.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2, color: "#fff" }}>
                    {p.full_name || "(sin nombre)"}
                  </div>
                  <div
                    style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}
                  >
                    Se registró el {formatearFecha(p.created_at)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <BotonAccion
                    color="verde"
                    disabled={procesandoId === p.id}
                    onClick={() => manejar(onAprobar, p.id)}
                  >
                    {procesandoId === p.id ? "..." : "Aprobar"}
                  </BotonAccion>
                  <BotonAccion
                    color="rojo"
                    disabled={procesandoId === p.id}
                    onClick={() => manejar(onRechazar, p.id)}
                  >
                    Rechazar
                  </BotonAccion>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {revocados.length > 0 && (
        <>
          <TituloSeccion>Accesos revocados ({revocados.length})</TituloSeccion>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {revocados.map((r) => (
              <div
                key={r.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, marginBottom: 2, color: "#bbb" }}>
                    {r.full_name || "(sin nombre)"}
                  </div>
                  <div
                    style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}
                  >
                    Acceso revocado
                  </div>
                </div>
                <BotonAccion
                  color="amarillo"
                  disabled={procesandoId === r.id}
                  onClick={() => manejar(onReactivar, r.id)}
                >
                  {procesandoId === r.id ? "..." : "Reactivar"}
                </BotonAccion>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
