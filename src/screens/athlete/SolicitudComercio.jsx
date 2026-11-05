// ── TARJETA: "QUIERO SER COMERCIO RAGNERO" (para atletas ya registrados) ──────
// Un atleta que tiene un negocio lo suma sin crear otra cuenta: la misma
// cuenta sirve para entrenar y para escanear cupones (rpc solicitar_comercio).
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Y } from "../../lib/constants";

const ESTADOS = {
  pending: { color: Y, texto: "Tu solicitud está en revisión. Ragnar se va a contactar con vos para acordar el descuento." },
  approved: { color: "#4ade80", texto: "Tu comercio está activo. Lo gestionás desde las tabs Escanear, Canjes y Mi comercio." },
  suspended: { color: "#f87171", texto: "Tu comercio está suspendido. Consultá con el gimnasio." },
  rejected: { color: "#f87171", texto: "La solicitud de tu comercio no fue aprobada. Consultá con el gimnasio." },
};

export default function SolicitudComercio({ comercio, onSolicitado }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: "", rubro: "", telefono: "", direccion: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const caja = {
    marginTop: 28,
    padding: 16,
    background: "#0c0c0c",
    border: "1px dashed #333",
    borderRadius: 2,
  };

  if (comercio) {
    const e = ESTADOS[comercio.status] || ESTADOS.pending;
    return (
      <div style={caja}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 6 }}>
          Tu comercio · {comercio.name}
        </div>
        <div style={{ fontSize: 11, color: e.color, lineHeight: 1.7 }}>{e.texto}</div>
      </div>
    );
  }

  const enviar = async () => {
    setError("");
    if (form.nombre.trim().length < 2) return setError("Ingresá el nombre del comercio");
    setEnviando(true);
    const { data, error: err } = await supabase.rpc("solicitar_comercio", {
      p_nombre: form.nombre,
      p_rubro: form.rubro,
      p_telefono: form.telefono,
      p_direccion: form.direccion,
    });
    setEnviando(false);
    if (err || !data?.ok) return setError(data?.motivo || "No se pudo enviar la solicitud");
    await onSolicitado?.();
  };

  const campo = (k, placeholder, extra = {}) => (
    <input
      className="inp"
      style={{ fontSize: 14 }}
      placeholder={placeholder}
      value={form[k]}
      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
      {...extra}
    />
  );

  return (
    <div style={caja}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#fff" }}>¿Tenés un comercio?</div>
      <div style={{ fontSize: 11, color: "#b3b3b3", lineHeight: 1.7, marginBottom: 12 }}>
        Sumalo como Ragnero y ofrecé descuentos a tus compañeros de box. Usás esta misma cuenta.
      </div>
      {!abierto ? (
        <button className="btn-ragnero" style={{ marginTop: 0 }} onClick={() => setAbierto(true)}>
          <span style={{ fontSize: 16 }}>🏪</span> Quiero ser comercio Ragnero
        </button>
      ) : (
        <>
          {campo("nombre", "Nombre del comercio", { maxLength: 80 })}
          {campo("rubro", "Rubro (ej: Vinoteca)", { maxLength: 40 })}
          {campo("telefono", "Teléfono / WhatsApp", { maxLength: 40, type: "tel" })}
          {campo("direccion", "Dirección", { maxLength: 120 })}
          {error && <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{error}</div>}
          <button className="btn-y" onClick={enviar} disabled={enviando}>
            {enviando ? <span className="spin">◌</span> : "ENVIAR SOLICITUD"}
          </button>
        </>
      )}
    </div>
  );
}
