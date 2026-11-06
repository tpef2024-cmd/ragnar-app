// ── TAB: MI COMERCIO (comercio Ragnero) ───────────────────────────────────────
// El comercio carga su logo, portada e info. Los descuentos los define Ragnar,
// acá se muestran solo para consulta.
import { useRef, useState } from "react";
import { Y } from "../../lib/constants";
import { fechaCorta, hoyAR } from "../../lib/fechas";
import LogoComercio from "../../components/shared/LogoComercio";

const etiqueta = { fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 6 };

const CAMPOS = [
  ["name", "Nombre del comercio", 80],
  ["category", "Rubro (ej: Vinoteca)", 40],
  ["address", "Dirección", 120],
  ["phone", "Teléfono / WhatsApp", 40],
  ["instagram", "Instagram (sin @)", 60],
  ["website", "Sitio web", 120],
];

export default function ComercioPerfil({ negocio, descuentos, guardarPerfil, subirImagen }) {
  // Cambios sin guardar. null = mostrar los datos tal como están en la base
  // (así no hace falta copiar `negocio` al estado con un useEffect).
  const [form, setForm] = useState(null);
  const datos = form ?? negocio ?? {};
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(null); // "logo" | "cover" | null
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const inputLogo = useRef(null);
  const inputCover = useRef(null);

  if (!negocio) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#555" }}>
        <span className="spin">◌</span>
      </div>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...(f ?? negocio), [k]: e.target.value }));

  const guardar = async () => {
    setGuardando(true);
    const { error } = await guardarPerfil(datos);
    setGuardando(false);
    if (!error) setForm(null);
    setMensaje(error ? { tipo: "error", texto: error } : { tipo: "ok", texto: "Cambios guardados" });
  };

  const elegirArchivo = async (tipo, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSubiendo(tipo);
    const { error } = await subirImagen(tipo, file);
    setSubiendo(null);
    setMensaje(error ? { tipo: "error", texto: error } : { tipo: "ok", texto: tipo === "logo" ? "Logo actualizado" : "Portada actualizada" });
  };

  const hoy = hoyAR();
  const vigentes = descuentos.filter((d) => d.active && d.valid_from <= hoy && d.valid_until >= hoy);
  const otros = descuentos.filter((d) => !vigentes.includes(d));

  return (
    <div>
      {negocio.status !== "approved" && (
        <div className="card" style={{ borderColor: "#991b1b", background: "#1a0b0b", marginBottom: 16, fontSize: 11, color: "#ddd" }}>
          Tu comercio no está activo en este momento: los atletas no lo ven y no podés canjear cupones.
        </div>
      )}

      {/* Portada + logo */}
      <div
        onClick={() => !subiendo && inputCover.current?.click()}
        style={{
          height: 150,
          borderRadius: 2,
          border: "1px dashed #333",
          cursor: "pointer",
          background: negocio.cover_url ? `#151515 url("${negocio.cover_url}") center/cover no-repeat` : "#0c0c0c",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 8,
        }}
      >
        <span className="btn-salir" style={{ background: "#0a0a0acc", fontSize: 9 }}>
          {subiendo === "cover" ? <span className="spin">◌</span> : negocio.cover_url ? "Cambiar portada" : "+ Portada"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: -36, padding: "0 14px", marginBottom: 20 }}>
        <div onClick={() => !subiendo && inputLogo.current?.click()} style={{ cursor: "pointer", position: "relative" }}>
          <LogoComercio comercio={negocio} size={80} />
          <span
            style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              background: Y,
              color: "#0a0a0a",
              borderRadius: "50%",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            {subiendo === "logo" ? <span className="spin">◌</span> : "✎"}
          </span>
        </div>
        <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, paddingBottom: 6 }}>Tocá para cambiar logo o portada</div>
      </div>
      <input ref={inputLogo} type="file" accept="image/*" hidden onChange={(e) => elegirArchivo("logo", e)} />
      <input ref={inputCover} type="file" accept="image/*" hidden onChange={(e) => elegirArchivo("cover", e)} />

      {/* Datos */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={etiqueta}>Información del comercio</div>
        {CAMPOS.map(([k, ph, max]) => (
          <label key={k} style={{ display: "block" }}>
            <span style={{ fontSize: 8, letterSpacing: 2, color: "#666", textTransform: "uppercase" }}>{ph.split(" (")[0]}</span>
            <input className="inp" style={{ fontSize: 14 }} placeholder={ph} maxLength={max} value={datos[k] || ""} onChange={set(k)} />
          </label>
        ))}
        <span style={{ fontSize: 8, letterSpacing: 2, color: "#666", textTransform: "uppercase" }}>Descripción</span>
        <textarea
          className="inp"
          style={{ fontSize: 13, minHeight: 90, resize: "vertical", fontFamily: "'DM Mono',monospace" }}
          placeholder="Descripción: qué ofrecés, horarios, etc."
          maxLength={600}
          value={datos.description || ""}
          onChange={set("description")}
        />
        {mensaje.texto && (
          <div style={{ fontSize: 10, letterSpacing: 1, marginBottom: 10, color: mensaje.tipo === "error" ? "#f87171" : "#4ade80" }}>
            {mensaje.texto}
          </div>
        )}
        <button className="btn-y" onClick={guardar} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR CAMBIOS"}
        </button>
      </div>

      {/* Descuentos (solo lectura) */}
      <div style={etiqueta}>Tus descuentos para atletas Ragnar</div>
      {descuentos.length === 0 ? (
        <div className="card" style={{ fontSize: 10, color: "#7a7a7a", lineHeight: 1.7 }}>
          Todavía no hay descuentos cargados. El equipo de Ragnar los define con vos y los publica desde su panel.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...vigentes, ...otros].map((d) => {
            const vigente = vigentes.includes(d);
            return (
              <div key={d.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", opacity: vigente ? 1 : 0.5 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: Y, width: 64 }}>{d.percentage}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#fff" }}>{d.title}</div>
                  {d.conditions && <div style={{ fontSize: 10, color: "#999", lineHeight: 1.5 }}>{d.conditions}</div>}
                  <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, marginTop: 2 }}>
                    {fechaCorta(d.valid_from)} → {fechaCorta(d.valid_until)}
                  </div>
                </div>
                <span className={vigente ? "badge-ok" : "badge-no"}>{vigente ? "Vigente" : "Inactivo"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
