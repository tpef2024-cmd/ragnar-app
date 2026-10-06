// ── COMPONENTE: SECCIÓN DE INFORMACIÓN / NOTAS ───────────────────────────────
// Lista de notas con fecha + campo para agregar una nueva. Se usa en el
// Perfil del atleta ("Mi información") y en el detalle del atleta del profe
// ("Info del atleta" y "Notas de profes").
import { useState } from "react";
import { Y } from "../../lib/constants";

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function SeccionNotas({
  titulo,
  aclaracion, // texto chico debajo del título (quién la ve)
  notas,
  cargando,
  placeholder = "Escribí acá...",
  vacio = "Sin información cargada.",
  onAgregar, // (texto) => Promise<boolean>. Si no se pasa, es solo lectura
  puedeBorrar = () => false,
  onBorrar,
  mostrarAutor = false,
  colorBorde,
}) {
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleAgregar = async () => {
    setGuardando(true);
    setError("");
    const ok = await onAgregar(texto);
    if (ok) setTexto("");
    else setError("No se pudo guardar. Probá de nuevo.");
    setGuardando(false);
  };

  const handleBorrar = (nota) => {
    if (window.confirm("¿Borrar esta nota?")) onBorrar(nota.id);
  };

  return (
    <div className="card" style={{ marginBottom: 16, borderColor: colorBorde }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: aclaracion ? 4 : 12 }}>
        {titulo}
      </div>
      {aclaracion && (
        <div style={{ fontSize: 9, color: "#666", letterSpacing: 1, marginBottom: 12 }}>
          {aclaracion}
        </div>
      )}

      {onAgregar && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{
              width: "100%",
              background: "#080808",
              border: "1px solid #2a2a2a",
              borderBottom: `2px solid ${Y}`,
              color: "#fff",
              fontFamily: "'DM Mono',monospace",
              fontSize: 12,
              padding: 10,
              outline: "none",
              resize: "vertical",
              marginBottom: 8,
            }}
          />
          {error && (
            <div style={{ color: "#f87171", fontSize: 10, marginBottom: 8 }}>{error}</div>
          )}
          <button
            className="btn-y"
            style={{ fontSize: 16, padding: 10 }}
            onClick={handleAgregar}
            disabled={!texto.trim() || guardando}
          >
            {guardando ? <span className="spin">◌</span> : "+ AGREGAR"}
          </button>
        </div>
      )}

      {cargando ? (
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>Cargando...</div>
      ) : notas.length === 0 ? (
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>{vacio}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notas.map((n) => (
            <div key={n.id} style={{ borderLeft: "2px solid #333", padding: "4px 0 4px 10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}>
                  {formatearFecha(n.created_at)}
                  {mostrarAutor && n.autor?.full_name && ` · ${n.autor.full_name}`}
                </div>
                {puedeBorrar(n) && onBorrar && (
                  <button
                    onClick={() => handleBorrar(n)}
                    title="Borrar"
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 11, padding: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {n.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
