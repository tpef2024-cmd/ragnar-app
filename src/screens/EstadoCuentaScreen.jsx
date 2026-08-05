// ── PANTALLA: CUENTA PENDIENTE / REVOCADA ─────────────────────────────────────
// Se muestra en vez del panel de atleta cuando su profile.status no es
// "approved" — es decir, todavía no fue autorizado por el coach, o se le
// revocó el acceso. El atleta no puede navegar a ningún otro lado desde acá
// más que cerrar sesión.
import LogoRagnar from "../components/shared/LogoRagnar";
import { Y } from "../lib/constants";

const CONTENIDO = {
  pendiente: {
    icono: "⏳",
    titulo: "CUENTA EN REVISIÓN",
    texto:
      "Tu registro fue recibido correctamente. El coach todavía tiene que autorizar tu acceso — una vez que lo haga, vas a poder ingresar con tu email y contraseña.",
  },
  revocado: {
    icono: "🚫",
    titulo: "ACCESO REVOCADO",
    texto:
      "Tu acceso a la app fue revocado. Si creés que se trata de un error, consultá directamente con el gimnasio.",
  },
};

export default function EstadoCuentaScreen({ estado, onSalir }) {
  const { icono, titulo, texto } = CONTENIDO[estado] || CONTENIDO.pendiente;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", background: "#0a0a0a" }}>
      <div style={{ width: "100%", maxWidth: 480, padding: "20px 20px 0" }}>
        <div style={{ marginBottom: 10 }}>
          <LogoRagnar />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${Y},transparent)` }} />
      </div>

      <div className="fu" style={{ width: "100%", maxWidth: 480, padding: "48px 20px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>{icono}</div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 26,
            letterSpacing: 3,
            color: Y,
            marginBottom: 14,
          }}
        >
          {titulo}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.8, color: "#b3b3b3", marginBottom: 30 }}>
          {texto}
        </div>

        <button className="btn-salir" onClick={onSalir}>
          Salir
        </button>
      </div>
    </div>
  );
}
