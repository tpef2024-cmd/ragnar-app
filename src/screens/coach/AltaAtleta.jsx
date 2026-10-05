// ── FORMULARIO: ALTA DE ATLETA (coach) ─────────────────────────────────────────
// Para dar de alta a quien no se puede registrar solo (Kids sin celular,
// Adultos Mayores). Si no se carga email, el atleta queda en la app sin
// acceso propio: el profe ve y maneja sus datos, pagos y asistencia.
import { useState } from "react";
import { Y, DISCIPLINAS } from "../../lib/constants";
import SelectorGrupo from "../../components/shared/SelectorGrupo";
import { etiquetaGrupo } from "../../lib/helpers";

const estiloLabel = {
  fontSize: 9,
  color: "#7a7a7a",
  letterSpacing: 2,
  marginBottom: 6,
  textTransform: "uppercase",
};

const FORM_VACIO = {
  nombre: "",
  telefono: "",
  nacimiento: "",
  disciplina: "",
  grupoId: null,
  email: "",
  password: "",
};

export default function AltaAtleta({ gruposDisponibles, onCrear, onCerrar }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [conApp, setConApp] = useState(false);
  const [eligiendoGrupo, setEligiendoGrupo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(null); // nombre del último creado

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const grupo = gruposDisponibles.find((g) => g.id === form.grupoId);

  const puedeGuardar =
    form.nombre.trim() &&
    (!conApp || (form.email.includes("@") && form.password.length >= 6));

  const handleCrear = async () => {
    setGuardando(true);
    setError("");
    const { error: err } = await onCrear({
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      nacimiento: form.nacimiento || null,
      disciplina: form.disciplina || null,
      grupoId: form.grupoId,
      email: conApp ? form.email.trim() : "",
      password: conApp ? form.password : "",
    });
    setGuardando(false);
    if (err) {
      setError(err);
      return;
    }
    setCreado(form.nombre.trim());
    setForm(FORM_VACIO);
    setConApp(false);
  };

  return (
    <div className="card" style={{ borderColor: Y, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: Y, textTransform: "uppercase" }}>
          Alta de atleta
        </div>
        <button
          onClick={onCerrar}
          style={{ background: "none", border: "none", color: "#7a7a7a", cursor: "pointer", fontSize: 13 }}
        >
          ✕
        </button>
      </div>

      {creado && (
        <div style={{ color: "#4ade80", fontSize: 10, letterSpacing: 1, marginBottom: 12 }}>
          ✓ {creado} quedó dado de alta. Podés cargar otro.
        </div>
      )}

      <div style={estiloLabel}>Nombre completo *</div>
      <input className="inp" value={form.nombre} onChange={set("nombre")} style={{ fontSize: 14 }} />

      <div style={estiloLabel}>Teléfono (o el de un familiar)</div>
      <input className="inp" type="tel" value={form.telefono} onChange={set("telefono")} style={{ fontSize: 14 }} />

      <div style={estiloLabel}>Fecha de nacimiento</div>
      <input
        className="inp"
        type="date"
        value={form.nacimiento}
        onChange={set("nacimiento")}
        style={{ fontSize: 14, colorScheme: "dark" }}
      />

      <div style={estiloLabel}>Disciplina</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {DISCIPLINAS.map((d) => (
          <button
            key={d}
            className={`chip-disc ${form.disciplina === d ? "on" : ""}`}
            onClick={() => setForm((f) => ({ ...f, disciplina: f.disciplina === d ? "" : d }))}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={estiloLabel}>Grupo / Horario</div>
      {eligiendoGrupo ? (
        <div style={{ marginBottom: 14 }}>
          <SelectorGrupo
            grupos={gruposDisponibles}
            onSeleccionar={(id) => {
              setForm((f) => ({ ...f, grupoId: id }));
              setEligiendoGrupo(false);
            }}
            onCancelar={() => setEligiendoGrupo(false)}
          />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: grupo ? Y : "#555" }}>
            {grupo ? etiquetaGrupo(grupo.name) : "Sin grupo"}
          </div>
          <button className="chip-disc" onClick={() => setEligiendoGrupo(true)}>
            {grupo ? "Cambiar" : "Elegir"}
          </button>
        </div>
      )}

      {/* ¿Va a usar la app? */}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#ccc", marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={conApp} onChange={(e) => setConApp(e.target.checked)} />
        Va a usar la app (crearle email y contraseña)
      </label>

      {conApp ? (
        <>
          <div style={estiloLabel}>Email</div>
          <input className="inp" type="email" value={form.email} onChange={set("email")} style={{ fontSize: 14 }} />
          <div style={estiloLabel}>Contraseña (mín. 6 caracteres)</div>
          <input className="inp" type="text" value={form.password} onChange={set("password")} style={{ fontSize: 14 }} />
          <div style={{ fontSize: 9, color: "#7a7a7a", lineHeight: 1.6, marginBottom: 12 }}>
            Pasale estos datos al atleta: entra directo, sin confirmar el mail ni esperar aprobación.
          </div>
        </>
      ) : (
        <div style={{ fontSize: 9, color: "#7a7a7a", lineHeight: 1.6, marginBottom: 12 }}>
          Sin email no puede entrar a la app, pero vas a poder ver su asistencia, pagos y notas.
        </div>
      )}

      {error && <div style={{ color: "#f87171", fontSize: 10, marginBottom: 10 }}>{error}</div>}

      <button className="btn-y" onClick={handleCrear} disabled={!puedeGuardar || guardando}>
        {guardando ? <span className="spin">◌</span> : "DAR DE ALTA"}
      </button>
    </div>
  );
}
