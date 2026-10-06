// ── TAB: ATLETAS (coach) ──────────────────────────────────────────────────────
import { useState } from "react";
import { DISCIPLINAS, HYBRID, Y } from "../../lib/constants";
import { etiquetaGrupo } from "../../lib/helpers";
import AltaAtleta from "./AltaAtleta";

export default function CoachAtletas({
  atletas,
  pagadoEsteMes,
  verPago = () => true,
  onSeleccionarAtleta,
  gruposDisponibles = [],
  onCrearAtleta,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [filtroDisciplina, setFiltroDisciplina] = useState("todas");

  const atletasFiltrados = atletas.filter((a) => {
    const coincideNombre = a.full_name?.toLowerCase().includes(busqueda.toLowerCase());
    // Hybrid es complementaria: el filtro muestra a todos los que la tienen,
    // sea cual sea su disciplina principal
    const coincideDisciplina =
      filtroDisciplina === "todas" ||
      (filtroDisciplina === HYBRID ? a.is_hybrid : a.discipline === filtroDisciplina);
    return coincideNombre && coincideDisciplina;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {onCrearAtleta &&
        (mostrarAlta ? (
          <AltaAtleta
            gruposDisponibles={gruposDisponibles}
            onCrear={onCrearAtleta}
            onCerrar={() => setMostrarAlta(false)}
          />
        ) : (
          <button
            onClick={() => setMostrarAlta(true)}
            style={{
              background: "#1a1500",
              border: `1px dashed ${Y}`,
              color: Y,
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              letterSpacing: 2,
              padding: "12px",
              borderRadius: 2,
              cursor: "pointer",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            + Dar de alta un atleta
          </button>
        ))}

      <input className="inp" placeholder="Buscar atleta..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ marginBottom: 4 }} />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <button className={`chip-disc ${filtroDisciplina === "todas" ? "on" : ""}`} onClick={() => setFiltroDisciplina("todas")}>
          Todas
        </button>
        {[...DISCIPLINAS, HYBRID].map((d) => (
          <button key={d} className={`chip-disc ${filtroDisciplina === d ? "on" : ""}`} onClick={() => setFiltroDisciplina(d)}>
            {d}
          </button>
        ))}
      </div>

      {atletas.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          SIN ATLETAS REGISTRADOS AÚN
        </div>
      )}

      {atletasFiltrados.map((a) => (
        <div key={a.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, marginBottom: 2, color: "#fff" }}>{a.full_name}</div>
            <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}>
              {etiquetaGrupo(a.groups?.name) || "Sin grupo"}
              {a.discipline && <span style={{ color: "#999", marginLeft: 6 }}>· {a.discipline}</span>}
              {a.is_hybrid && <span style={{ color: Y, marginLeft: 6 }}>+ {HYBRID}</span>}
              {a.sin_app && <span style={{ color: "#60a5fa", marginLeft: 6 }}>· Sin app</span>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => onSeleccionarAtleta(a)}
              style={{
                background: "#1a1500",
                border: "1px solid #F5C400",
                color: "#F5C400",
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                letterSpacing: 1,
                padding: "6px 10px",
                borderRadius: 2,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Ver atleta
            </button>
            {verPago(a) && (
              <span className={pagadoEsteMes(a.id) ? "badge-ok" : "badge-no"}>
                {pagadoEsteMes(a.id) ? "AL DÍA" : "DEBE"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
