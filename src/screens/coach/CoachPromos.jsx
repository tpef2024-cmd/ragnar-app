// ── TAB: PROMOCIONES (coach) ──────────────────────────────────────────────────
// Gestión del banner de promo (título + foto). Solo puede haber una activa
// a la vez — activar una desactiva automáticamente cualquier otra.
// Los productos que aparecen debajo del banner se marcan desde la tab
// Tienda, con el botón "Sumar a promo" en cada producto.
import { useState, useRef } from "react";
import { Y, BORDER } from "../../lib/constants";

const PROMO_VACIA = { title: "", image_url: "" };

function SelectorFotoPromo({ imageUrl, onSubir, subiendo }) {
  const inputRef = useRef(null);

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) onSubir(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          background: "#0c0c0c",
          border: `1px solid ${BORDER}`,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {subiendo ? (
          <span className="spin" style={{ color: Y, fontSize: 18 }}>◌</span>
        ) : imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 8, color: "#444", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>
            Sin foto
          </span>
        )}
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleArchivo} style={{ display: "none" }} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          style={{
            background: "transparent",
            border: `1px solid ${BORDER}`,
            color: "#ccc",
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: 1,
            padding: "8px 12px",
            borderRadius: 2,
            cursor: subiendo ? "default" : "pointer",
            textTransform: "uppercase",
          }}
        >
          {subiendo ? "Subiendo..." : imageUrl ? "Cambiar foto" : "Elegir foto"}
        </button>
      </div>
    </div>
  );
}

function FormularioPromo({ valores, onChange, onGuardar, onCancelar, guardando, onSubirImagen }) {
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");

  const handleSubir = async (file) => {
    setErrorFoto("");
    setSubiendoFoto(true);
    const { url, error } = await onSubirImagen(file);
    setSubiendoFoto(false);
    if (error) {
      setErrorFoto("No se pudo subir la foto. Probá de nuevo.");
      return;
    }
    onChange({ ...valores, image_url: url });
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <SelectorFotoPromo imageUrl={valores.image_url} onSubir={handleSubir} subiendo={subiendoFoto} />
      {errorFoto && <div style={{ color: "#f87171", fontSize: 10, marginBottom: 10 }}>{errorFoto}</div>}

      <input
        className="inp"
        placeholder='Título (ej: "Promo Para Estas Fiestas")'
        value={valores.title}
        onChange={(e) => onChange({ ...valores, title: e.target.value })}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn-y" style={{ flex: 1 }} onClick={onGuardar} disabled={guardando || subiendoFoto || !valores.title}>
          {guardando ? <span className="spin">◌</span> : "Guardar promo"}
        </button>
        <button className="btn-salir" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FilaPromo({ promo, onActivar, onDesactivar, onBorrar, onEditar, onSubirImagen }) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({ title: promo.title, image_url: promo.image_url || "" });
  const [procesando, setProcesando] = useState(false);

  const guardarEdicion = async () => {
    setProcesando(true);
    await onEditar(promo.id, valores);
    setProcesando(false);
    setEditando(false);
  };

  if (editando) {
    return (
      <FormularioPromo
        valores={valores}
        onChange={setValores}
        onGuardar={guardarEdicion}
        onCancelar={() => setEditando(false)}
        guardando={procesando}
        onSubirImagen={onSubirImagen}
      />
    );
  }

  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
        borderColor: promo.active ? Y : BORDER,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          background: "#0c0c0c",
          border: `1px solid ${BORDER}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {promo.image_url && (
          <img src={promo.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#fff", marginBottom: 2 }}>
          {promo.title} {promo.active && <span style={{ color: Y, fontSize: 9 }}>★ ACTIVA</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setEditando(true)}
          style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#999", fontSize: 9, padding: "6px 8px", borderRadius: 2, cursor: "pointer", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}
        >
          Editar
        </button>
        <button
          onClick={() => (promo.active ? onDesactivar(promo.id) : onActivar(promo.id))}
          style={{
            background: promo.active ? "transparent" : "#1a1500",
            border: `1px solid ${Y}`,
            color: Y,
            fontSize: 9,
            padding: "6px 8px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {promo.active ? "Desactivar" : "Activar"}
        </button>
        <button
          onClick={() => window.confirm(`¿Borrar la promo "${promo.title}"?`) && onBorrar(promo.id)}
          style={{ background: "transparent", border: "1px solid #f87171", color: "#f87171", fontSize: 9, padding: "6px 8px", borderRadius: 2, cursor: "pointer", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

export default function CoachPromos({ promociones }) {
  const { promos, cargando, crearPromo, editarPromo, activarPromo, desactivarPromo, borrarPromo, subirImagenPromo } = promociones;
  const [creando, setCreando] = useState(false);
  const [nueva, setNueva] = useState(PROMO_VACIA);
  const [guardando, setGuardando] = useState(false);

  const handleCrear = async () => {
    setGuardando(true);
    await crearPromo(nueva.title, nueva.image_url);
    setGuardando(false);
    setNueva(PROMO_VACIA);
    setCreando(false);
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: "#999", lineHeight: 1.6, marginBottom: 16 }}>
        Solo puede haber una promo activa a la vez. Para elegir qué productos aparecen
        debajo del banner, usá el botón <span style={{ color: Y }}>"Sumar a promo"</span> en
        cada producto, desde la tab Tienda.
      </div>

      {!creando && (
        <button className="btn-y" style={{ marginBottom: 16 }} onClick={() => setCreando(true)}>
          + Nueva promo
        </button>
      )}

      {creando && (
        <FormularioPromo
          valores={nueva}
          onChange={setNueva}
          onGuardar={handleCrear}
          onCancelar={() => {
            setCreando(false);
            setNueva(PROMO_VACIA);
          }}
          guardando={guardando}
          onSubirImagen={subirImagenPromo}
        />
      )}

      {cargando && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          CARGANDO...
        </div>
      )}

      {!cargando && promos.length === 0 && !creando && (
        <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 10, letterSpacing: 2 }}>
          NO HAY PROMOS CARGADAS TODAVÍA
        </div>
      )}

      {promos.map((p) => (
        <FilaPromo
          key={p.id}
          promo={p}
          onActivar={activarPromo}
          onDesactivar={desactivarPromo}
          onBorrar={borrarPromo}
          onEditar={editarPromo}
          onSubirImagen={subirImagenPromo}
        />
      ))}
    </div>
  );
}
