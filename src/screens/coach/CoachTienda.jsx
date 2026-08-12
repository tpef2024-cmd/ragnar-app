// ── TAB: TIENDA (coach) ─────────────────────────────────────────────────────────
// Alta, edición, stock y baja de productos. Lo que se carga acá aparece (o
// desaparece) automáticamente en la tienda pública, según el stock y el
// estado activo/pausado de cada producto. Las fotos se suben directo al
// bucket "product-images" de Supabase Storage (ver hook useTienda.js).
import { useState, useRef } from "react";
import { Y, BORDER } from "../../lib/constants";

const PRODUCTO_VACIO = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image_url: "",
};

function SelectorFoto({ imageUrl, onSubir, subiendo }) {
  const inputRef = useRef(null);

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) onSubir(file);
    e.target.value = ""; // permite volver a elegir el mismo archivo si hace falta
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
      }}
    >
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
          <span className="spin" style={{ color: Y, fontSize: 18 }}>
            ◌
          </span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontSize: 8,
              color: "#444",
              letterSpacing: 1,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Sin foto
          </span>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleArchivo}
          style={{ display: "none" }}
        />
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

function FormularioProducto({
  valores,
  onChange,
  onGuardar,
  onCancelar,
  guardando,
  onSubirImagen,
}) {
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
      <SelectorFoto
        imageUrl={valores.image_url}
        onSubir={handleSubir}
        subiendo={subiendoFoto}
      />
      {errorFoto && (
        <div style={{ color: "#f87171", fontSize: 10, marginBottom: 10 }}>
          {errorFoto}
        </div>
      )}

      <input
        className="inp"
        placeholder="Nombre del producto"
        value={valores.name}
        onChange={(e) => onChange({ ...valores, name: e.target.value })}
      />
      <input
        className="inp"
        placeholder="Descripción (opcional)"
        value={valores.description}
        onChange={(e) => onChange({ ...valores, description: e.target.value })}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          className="inp"
          type="number"
          placeholder="Precio"
          value={valores.price}
          onChange={(e) => onChange({ ...valores, price: e.target.value })}
        />
        <input
          className="inp"
          type="number"
          placeholder="Stock inicial"
          value={valores.stock}
          onChange={(e) => onChange({ ...valores, stock: e.target.value })}
        />
      </div>
      <input
        className="inp"
        placeholder="Categoría (ej: Indumentaria, Suplementos)"
        value={valores.category}
        onChange={(e) => onChange({ ...valores, category: e.target.value })}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          className="btn-y"
          style={{ flex: 1 }}
          onClick={onGuardar}
          disabled={guardando || subiendoFoto || !valores.name}
        >
          {guardando ? <span className="spin">◌</span> : "Guardar producto"}
        </button>
        <button className="btn-salir" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FilaProducto({
  producto,
  onAjustarStock,
  onAlternarActivo,
  onBorrar,
  onEditar,
  onSubirImagen,
}) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState({
    name: producto.name,
    description: producto.description || "",
    price: producto.price,
    stock: producto.stock,
    category: producto.category || "",
    image_url: producto.image_url || "",
  });

  const guardarEdicion = async () => {
    await onEditar(producto.id, {
      ...valores,
      price: Number(valores.price) || 0,
      stock: Number(valores.stock) || 0,
    });
    setEditando(false);
  };

  if (editando) {
    return (
      <FormularioProducto
        valores={valores}
        onChange={setValores}
        onGuardar={guardarEdicion}
        onCancelar={() => setEditando(false)}
        guardando={false}
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
        opacity: producto.active ? 1 : 0.5,
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
        {producto.image_url && (
          <img
            src={producto.image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#fff", marginBottom: 2 }}>
          {producto.name}{" "}
          {!producto.active && (
            <span style={{ color: "#f87171", fontSize: 9 }}>(pausado)</span>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#999" }}>
          ${producto.price} · {producto.category || "sin categoría"}
        </div>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        <button
          onClick={() => onAjustarStock(producto.id, producto.stock - 1)}
          style={{
            width: 26,
            height: 26,
            background: "#151515",
            border: `1px solid ${BORDER}`,
            color: "#ccc",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          −
        </button>
        <div
          style={{
            width: 32,
            textAlign: "center",
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 18,
            color: producto.stock <= 0 ? "#f87171" : "#fff",
          }}
        >
          {producto.stock}
        </div>
        <button
          onClick={() => onAjustarStock(producto.id, producto.stock + 1)}
          style={{
            width: 26,
            height: 26,
            background: "#151515",
            border: `1px solid ${BORDER}`,
            color: "#ccc",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setEditando(true)}
          style={{
            background: "transparent",
            border: `1px solid ${BORDER}`,
            color: "#999",
            fontSize: 9,
            padding: "6px 8px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onAlternarActivo(producto.id, producto.active)}
          style={{
            background: "transparent",
            border: `1px solid ${producto.active ? "#F5C400" : "#4ade80"}`,
            color: producto.active ? Y : "#4ade80",
            fontSize: 9,
            padding: "6px 8px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {producto.active ? "Pausar" : "Activar"}
        </button>
        <button
          onClick={() =>
            window.confirm(`¿Borrar "${producto.name}" definitivamente?`) &&
            onBorrar(producto.id)
          }
          style={{
            background: "transparent",
            border: "1px solid #f87171",
            color: "#f87171",
            fontSize: 9,
            padding: "6px 8px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "'DM Mono',monospace",
          }}
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

export default function CoachTienda({ tienda }) {
  const {
    productos,
    cargando,
    crearProducto,
    editarProducto,
    ajustarStock,
    alternarActivo,
    borrarProducto,
    subirImagen,
  } = tienda;
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);

  const handleCrear = async () => {
    setGuardando(true);
    await crearProducto({
      ...nuevo,
      price: Number(nuevo.price) || 0,
      stock: Number(nuevo.stock) || 0,
    });
    setGuardando(false);
    setNuevo(PRODUCTO_VACIO);
    setCreando(false);
  };

  return (
    <div>
      {!creando && (
        <button
          className="btn-y"
          style={{ marginBottom: 16 }}
          onClick={() => setCreando(true)}
        >
          + Nuevo producto
        </button>
      )}

      {creando && (
        <FormularioProducto
          valores={nuevo}
          onChange={setNuevo}
          onGuardar={handleCrear}
          onCancelar={() => {
            setCreando(false);
            setNuevo(PRODUCTO_VACIO);
          }}
          guardando={guardando}
          onSubirImagen={subirImagen}
        />
      )}

      {cargando && (
        <div
          style={{
            textAlign: "center",
            padding: 32,
            color: "#555",
            fontSize: 10,
            letterSpacing: 2,
          }}
        >
          CARGANDO...
        </div>
      )}

      {!cargando && productos.length === 0 && !creando && (
        <div
          style={{
            textAlign: "center",
            padding: 32,
            color: "#555",
            fontSize: 10,
            letterSpacing: 2,
          }}
        >
          NO HAY PRODUCTOS CARGADOS TODAVÍA
        </div>
      )}

      {productos.map((p) => (
        <FilaProducto
          key={p.id}
          producto={p}
          onAjustarStock={ajustarStock}
          onAlternarActivo={alternarActivo}
          onBorrar={borrarProducto}
          onEditar={editarProducto}
          onSubirImagen={subirImagen}
        />
      ))}
    </div>
  );
}
