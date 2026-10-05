// ── TAB: PERFIL (atleta) ──────────────────────────────────────────────────────
// Datos personales editables, grupo (solo lectura) y "Mi información": notas
// que el atleta carga y ven él y los profes (lesiones, objetivos, etc.).
import { useState } from "react";
import { Y } from "../../lib/constants";
import { etiquetaGrupo } from "../../lib/helpers";
import { useNotas } from "../../hooks/useNotas";
import SeccionNotas from "../../components/shared/SeccionNotas";

const estiloLabel = {
  fontSize: 9,
  color: "#7a7a7a",
  letterSpacing: 2,
  marginBottom: 4,
  textTransform: "uppercase",
};

const CAMPOS = [
  { key: "full_name", label: "Nombre completo", tipo: "text" },
  { key: "phone", label: "Teléfono", tipo: "tel", placeholder: "Ej: 291 555-1234" },
  { key: "birth_date", label: "Fecha de nacimiento", tipo: "date" },
  { key: "emergency_contact", label: "Contacto de emergencia", tipo: "text", placeholder: "Nombre y teléfono" },
];

const formatearValor = (key, valor) => {
  if (!valor) return null;
  if (key === "birth_date") {
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }
  return valor;
};

export default function AthletePerfil({ perfil, usuario, gruposDisponibles, onGuardarPerfil }) {
  const grupo = gruposDisponibles.find((g) => g.id === perfil?.group_id);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const { notasAtleta, cargando, agregar, borrar } = useNotas(usuario?.id);

  const empezarEdicion = () => {
    setForm(Object.fromEntries(CAMPOS.map((c) => [c.key, perfil?.[c.key] || ""])));
    setError("");
    setEditando(true);
  };

  const handleGuardar = async () => {
    if (!form.full_name?.trim()) {
      setError("El nombre no puede quedar vacío.");
      return;
    }
    setGuardando(true);
    const datos = Object.fromEntries(
      CAMPOS.map((c) => [c.key, (form[c.key] || "").trim() || null]),
    );
    const { error: err } = await onGuardarPerfil(datos);
    setGuardando(false);
    if (err) setError(err);
    else setEditando(false);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase" }}>
            Mis datos
          </div>
          {!editando && (
            <button
              onClick={empezarEdicion}
              style={{
                background: "transparent",
                border: "1px solid #3a3a3a",
                color: "#999",
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                letterSpacing: 2,
                padding: "6px 12px",
                borderRadius: 2,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              ✎ Editar
            </button>
          )}
        </div>

        {editando ? (
          <>
            {CAMPOS.map((c) => (
              <div key={c.key} style={{ marginBottom: 6 }}>
                <div style={estiloLabel}>{c.label}</div>
                <input
                  className="inp"
                  type={c.tipo}
                  placeholder={c.placeholder}
                  value={form[c.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                  style={{ fontSize: 14, colorScheme: "dark" }}
                />
              </div>
            ))}
            {error && (
              <div style={{ color: "#f87171", fontSize: 10, marginBottom: 10 }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-y" style={{ flex: 1 }} onClick={handleGuardar} disabled={guardando}>
                {guardando ? <span className="spin">◌</span> : "GUARDAR"}
              </button>
              <button
                onClick={() => setEditando(false)}
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
          </>
        ) : (
          <>
            {CAMPOS.map((c) => (
              <div key={c.key} style={{ marginBottom: 14 }}>
                <div style={estiloLabel}>{c.label}</div>
                <div style={{ fontSize: c.key === "full_name" ? 16 : 14, color: perfil?.[c.key] ? "#fff" : "#555" }}>
                  {formatearValor(c.key, perfil?.[c.key]) || "Sin cargar"}
                </div>
              </div>
            ))}
            <div>
              <div style={estiloLabel}>Email</div>
              <div style={{ fontSize: 14, color: "#ccc" }}>{usuario?.email}</div>
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
          Mi Grupo / Horario
        </div>
        {perfil?.group_id ? (
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, color: Y }}>
              {etiquetaGrupo(grupo?.name) || "—"}
            </div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginTop: 10 }}>
              Para cambiar de grupo contactá a tu coach.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>
            Sin grupo asignado. Tu coach te asignará uno pronto.
          </div>
        )}
      </div>

      <SeccionNotas
        titulo="Mi información"
        aclaracion="La ven vos y los profes. Ej: lesiones, medicación, objetivos."
        notas={notasAtleta}
        cargando={cargando}
        placeholder="Ej: tengo una lesión en el hombro derecho..."
        onAgregar={(texto) => agregar("athlete", texto)}
        puedeBorrar={(n) => n.author_id === usuario?.id}
        onBorrar={borrar}
      />
    </div>
  );
}
