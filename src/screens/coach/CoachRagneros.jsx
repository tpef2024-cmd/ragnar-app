// ── TAB: RAGNEROS (coach) ─────────────────────────────────────────────────────
// Gestión de comercios adheridos: solicitudes (aprobar/rechazar), descuentos
// (porcentaje + info + vigencia) y métricas de cupones emitidos/canjeados.
import { useState } from "react";
import { Y } from "../../lib/constants";
import { fechaCorta, hoyAR } from "../../lib/fechas";
import LogoComercio from "../../components/shared/LogoComercio";

const etiqueta = { fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase" };

function Boton({ children, color = "gris", onClick, disabled }) {
  const c = {
    verde: ["#0f1f13", "#4ade80"],
    rojo: ["#1f0f0f", "#f87171"],
    amarillo: ["#1a1500", Y],
    gris: ["transparent", "#666"],
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: c[0],
        border: `1px solid ${c[1]}`,
        color: c[1] === "#666" ? "#999" : c[1],
        fontFamily: "'DM Mono',monospace",
        fontSize: 9,
        letterSpacing: 1,
        padding: "6px 10px",
        borderRadius: 2,
        cursor: "pointer",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function FormDescuento({ inicial, onGuardar, onCancelar }) {
  const hoy = hoyAR();
  const [f, setF] = useState({
    percentage: "",
    title: "",
    conditions: "",
    valid_from: hoy,
    valid_until: "",
    ...inicial,
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const guardar = async () => {
    const pct = Number(f.percentage);
    if (!Number.isInteger(pct) || pct < 1 || pct > 100) return setError("El porcentaje tiene que ser un número entre 1 y 100");
    if ((f.title || "").trim().length < 3) return setError("Escribí un título (ej: 20% en vinos de gama media)");
    if (!f.valid_until) return setError("Indicá hasta cuándo es válido");
    if (f.valid_until < f.valid_from) return setError("La fecha de fin es anterior a la de inicio");
    setGuardando(true);
    const { error: err } = await onGuardar(f);
    setGuardando(false);
    if (err) setError(err);
  };

  const inp = { fontSize: 14 };
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #222" }}>
      <div style={{ ...etiqueta, color: Y, marginBottom: 8 }}>{inicial?.id ? "Editar descuento" : "Nuevo descuento"}</div>
      <input className="inp" style={inp} type="number" min={1} max={100} placeholder="% de descuento" value={f.percentage} onChange={set("percentage")} />
      <input className="inp" style={inp} maxLength={80} placeholder="Título (ej: 20% en vinos de gama media)" value={f.title} onChange={set("title")} />
      <textarea
        className="inp"
        style={{ ...inp, minHeight: 70, resize: "vertical", fontFamily: "'DM Mono',monospace" }}
        maxLength={400}
        placeholder="Condiciones (ej: tickets entre $15.000 y $30.000)"
        value={f.conditions || ""}
        onChange={set("conditions")}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label style={{ ...etiqueta, letterSpacing: 2 }}>
          Desde
          <input className="inp" style={inp} type="date" value={f.valid_from} onChange={set("valid_from")} />
        </label>
        <label style={{ ...etiqueta, letterSpacing: 2 }}>
          Válido hasta
          <input className="inp" style={inp} type="date" min={f.valid_from} value={f.valid_until} onChange={set("valid_until")} />
        </label>
      </div>
      {f.percentage && f.title && f.valid_until && (
        <div style={{ fontSize: 10, color: "#b3b3b3", lineHeight: 1.6, margin: "4px 0 10px" }}>
          Así lo ven los atletas: <span style={{ color: Y }}>{f.percentage}%</span> · {f.title}
          {f.conditions ? ` (${f.conditions})` : ""}. Válido hasta el {fechaCorta(f.valid_until)}.
        </div>
      )}
      {error && <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-y" style={{ flex: 1, fontSize: 16, padding: 10 }} onClick={guardar} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : "GUARDAR"}
        </button>
        <Boton onClick={onCancelar}>Cancelar</Boton>
      </div>
    </div>
  );
}

function InfoComercio({ c }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
      <LogoComercio comercio={c} size={40} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#fff" }}>{c.name}</div>
        <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, lineHeight: 1.6 }}>
          {[c.category, c.owner?.full_name, c.phone].filter(Boolean).join(" · ")}
          {c.owner?.role === "athlete" && <span style={{ color: Y }}> · ATLETA</span>}
        </div>
      </div>
    </div>
  );
}

export default function CoachRagneros({ ragnerosData }) {
  const { comercios, pendientes, descuentos, metricas, cambiarEstadoComercio, guardarDescuento, cambiarActivoDescuento } = ragnerosData;
  // { businessId, descuento? } — qué formulario está abierto
  const [editando, setEditando] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);
  const hoy = hoyAR();

  const estado = async (id, status, confirmar) => {
    if (confirmar && !window.confirm(confirmar)) return;
    setProcesandoId(id);
    await cambiarEstadoComercio(id, status);
    setProcesandoId(null);
  };

  const aprobados = comercios.filter((c) => c.status === "approved");
  const inactivos = comercios.filter((c) => c.status === "suspended" || c.status === "rejected");

  return (
    <div>
      {/* SOLICITUDES */}
      {pendientes.length > 0 && (
        <>
          <div style={{ ...etiqueta, margin: "4px 0 10px" }}>Solicitudes de comercios ({pendientes.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {pendientes.map((c) => (
              <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <InfoComercio c={c} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Boton color="verde" disabled={procesandoId === c.id} onClick={() => estado(c.id, "approved")}>
                    {procesandoId === c.id ? "..." : "Aprobar"}
                  </Boton>
                  <Boton color="rojo" disabled={procesandoId === c.id} onClick={() => estado(c.id, "rejected", `¿Rechazar la solicitud de ${c.name}?`)}>
                    Rechazar
                  </Boton>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COMERCIOS ACTIVOS + DESCUENTOS */}
      <div style={{ ...etiqueta, marginBottom: 10 }}>Comercios Ragneros activos ({aprobados.length})</div>
      {aprobados.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#555", fontSize: 10, letterSpacing: 2 }}>
          NO HAY COMERCIOS ACTIVOS TODAVÍA
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {aprobados.map((c) => {
            const propios = descuentos.filter((d) => d.business_id === c.id);
            return (
              <div key={c.id} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <InfoComercio c={c} />
                  <Boton
                    color="rojo"
                    disabled={procesandoId === c.id}
                    onClick={() => estado(c.id, "suspended", `¿Suspender a ${c.name}? Los atletas dejan de ver sus descuentos y no puede canjear cupones.`)}
                  >
                    Suspender
                  </Boton>
                </div>

                {propios.map((d) => {
                  const m = metricas(d.id);
                  const vigente = d.active && d.valid_from <= hoy && d.valid_until >= hoy;
                  if (editando?.descuento?.id === d.id) {
                    return (
                      <FormDescuento
                        key={d.id}
                        inicial={d}
                        onCancelar={() => setEditando(null)}
                        onGuardar={async (f) => {
                          const r = await guardarDescuento({ ...f, id: d.id, business_id: c.id });
                          if (!r.error) setEditando(null);
                          return r;
                        }}
                      />
                    );
                  }
                  return (
                    <div
                      key={d.id}
                      style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e1e", opacity: vigente ? 1 : 0.55 }}
                    >
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: Y, width: 56 }}>{d.percentage}%</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: "#fff" }}>{d.title}</div>
                        <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, lineHeight: 1.6 }}>
                          hasta {fechaCorta(d.valid_until)} · este mes: {m.emitidosMes} emitidos, {m.canjeadosMes} canjeados · total canjeados: {m.canjeadosTotal}
                          {!d.active && " · PAUSADO"}
                          {d.active && d.valid_until < hoy && " · VENCIDO"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Boton onClick={() => setEditando({ businessId: c.id, descuento: d })}>Editar</Boton>
                        <Boton color={d.active ? "gris" : "amarillo"} onClick={() => cambiarActivoDescuento(d.id, !d.active)}>
                          {d.active ? "Pausar" : "Activar"}
                        </Boton>
                      </div>
                    </div>
                  );
                })}

                {editando?.businessId === c.id && !editando.descuento ? (
                  <FormDescuento
                    onCancelar={() => setEditando(null)}
                    onGuardar={async (f) => {
                      const r = await guardarDescuento({ ...f, business_id: c.id });
                      if (!r.error) setEditando(null);
                      return r;
                    }}
                  />
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <Boton color="amarillo" onClick={() => setEditando({ businessId: c.id })}>
                      + Nuevo descuento
                    </Boton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUSPENDIDOS / RECHAZADOS */}
      {inactivos.length > 0 && (
        <>
          <div style={{ ...etiqueta, margin: "24px 0 10px" }}>Suspendidos / rechazados ({inactivos.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {inactivos.map((c) => (
              <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.7 }}>
                <InfoComercio c={c} />
                <Boton color="amarillo" disabled={procesandoId === c.id} onClick={() => estado(c.id, "approved")}>
                  {procesandoId === c.id ? "..." : "Habilitar"}
                </Boton>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
