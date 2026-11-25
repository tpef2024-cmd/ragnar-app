// ── TAB: PLANIFICACIÓN (atleta) ───────────────────────────────────────────────
// PDFs de entrenamiento que el profe sube para cuando el atleta no puede venir
// (vacaciones, viaje, etc.). La tab solo se puede abrir mientras el profe la
// tenga habilitada; si no, aparece gris en la barra de tabs.
import { useEffect } from "react";
import { Y } from "../../lib/constants";
import { fechaCorta, fechaHora, diasHasta } from "../../lib/fechas";

const estiloTitulo = {
  fontSize: 9,
  letterSpacing: 3,
  color: "#999",
  textTransform: "uppercase",
  marginBottom: 10,
};

export default function AthletePlanificacion({ planificacion }) {
  const { hasta, habilitado, planes, cargandoPdfs, cargarPdfs } = planificacion;

  // Al abrir la tab se piden los PDFs (y URLs firmadas nuevas, que vencen en 1 h)
  useEffect(() => {
    cargarPdfs();
  }, [cargarPdfs]);

  if (!habilitado) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: "#bbb", lineHeight: 1.6 }}>
          La planificación no está habilitada.
          <br />
          Si vas a estar de vacaciones o no podés venir, avisale a tu profe.
        </div>
      </div>
    );
  }

  const dias = diasHasta(hasta);

  return (
    <>
      <div className="card" style={{ marginBottom: 12, borderColor: Y }}>
        <div style={estiloTitulo}>Planificación</div>
        <div style={{ fontSize: 12, color: "#fff", letterSpacing: 1 }}>
          Habilitada hasta el {fechaCorta(hasta)}
          <span style={{ color: "#999" }}>
            {" "}· {dias === 0 ? "último día" : `${dias} día${dias === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {cargandoPdfs && planes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#999", fontSize: 11, letterSpacing: 2 }}>
          CARGANDO...
        </div>
      ) : planes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 24, fontSize: 11, color: "#bbb", letterSpacing: 1 }}>
          Tu profe todavía no subió ninguna planificación.
        </div>
      ) : (
        planes.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#fff", overflowWrap: "anywhere" }}>📄 {p.title}</div>
              <div style={{ fontSize: 9, color: "#999", letterSpacing: 1, marginTop: 4 }}>
                Subida el {fechaHora(p.created_at)}
              </div>
            </div>
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-y"
                style={{ display: "inline-block", width: "auto", padding: "10px 16px", textDecoration: "none", textAlign: "center", whiteSpace: "nowrap", fontSize: 14 }}
              >
                Abrir PDF
              </a>
            ) : (
              <button className="btn-y" style={{ width: "auto", padding: "10px 16px", fontSize: 14 }} onClick={cargarPdfs}>
                Reintentar
              </button>
            )}
          </div>
        ))
      )}
    </>
  );
}
