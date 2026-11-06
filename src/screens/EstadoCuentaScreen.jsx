// ── PANTALLA: CUENTA PENDIENTE / REVOCADA ─────────────────────────────────────
// Se muestra en vez del panel de atleta cuando su profile.status no es
// "approved" — es decir, todavía no fue autorizado por el coach, o se le
// revocó el acceso. El atleta no puede navegar a ningún otro lado desde acá
// más que cerrar sesión. Los comercios Ragneros (role "merchant") ven un
// texto propio: su acceso sigue al estado del comercio.
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
  pendiente_comercio: {
    icono: "🏪",
    titulo: "SOLICITUD EN REVISIÓN",
    texto:
      "Recibimos la solicitud de tu comercio. El equipo de Ragnar se va a contactar con vos para acordar el descuento — cuando aprueben el alta vas a poder cargar tu logo, tu info y escanear cupones.",
  },
  revocado_comercio: {
    icono: "🚫",
    titulo: "COMERCIO NO HABILITADO",
    texto:
      "Tu comercio no está habilitado en este momento para recibir cupones. Si creés que se trata de un error, consultá directamente con el gimnasio.",
  },
};

export default function EstadoCuentaScreen({ estado, esComercio = false, onSalir }) {
  const clave = esComercio ? `${estado}_comercio` : estado;
  const { icono, titulo, texto } = CONTENIDO[clave] || CONTENIDO.pendiente;

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
