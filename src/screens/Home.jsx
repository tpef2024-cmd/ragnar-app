// ── PANTALLA: HOME (inicio público) ───────────────────────────────────────────
// Primera pantalla al entrar al dominio. Presenta el gimnasio (quiénes somos,
// misión, contacto) y da acceso a los dos apartados: Tienda y App de Atleta.
//
// TODO: los textos de "Quiénes somos", "Misión" y los datos de contacto son
// placeholders — reemplazar con la info real que confirme el gimnasio.
import { Link } from "react-router-dom";
import LogoRagnar from "../components/shared/LogoRagnar";
import { globalStyles } from "../styles/globalStyles";
import { Y, BORDER } from "../lib/constants";

const CONTACTO = {
  telefono: "+54 9 291 468-3833",
  whatsapp: "5492914683833",
  email: "info@ragnarcrossfit.com", // TODO: confirmar email real del gimnasio
  direccion: "Dirección del gimnasio", // TODO: completar
  instagram: "@ragnarcrosstraining", // TODO: confirmar usuario real
};

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 20,
          letterSpacing: 3,
          color: Y,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {titulo}
      </div>
      {children}
    </div>
  );
}

function TarjetaAcceso({ to, titulo, descripcion }) {
  return (
    <Link
      to={to}
      className="card"
      style={{
        display: "block",
        textDecoration: "none",
        padding: 24,
        transition: "border-color .15s",
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 24,
          letterSpacing: 2,
          color: "#fff",
          marginBottom: 6,
        }}
      >
        {titulo}
      </div>
      <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>
        {descripcion}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 10,
          color: Y,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Entrar →
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <style>{globalStyles}</style>
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px 20px 0",
        }}
      >
        <LogoRagnar />
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg,${Y},transparent)`,
            marginTop: 10,
          }}
        />
      </div>

      {/* Hero */}
      <div
        className="fu"
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: "48px 20px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 42,
            letterSpacing: 4,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          RAGNAR
          <br />
          CROSS TRAINING
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#999",
            letterSpacing: 1,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          Entrená con nosotros — Crossfit, Funcional, Adultos Mayores y Niños
        </div>
      </div>

      {/* Accesos principales */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 20px 20px",
        }}
      >
        <div className="home-accesos">
          <TarjetaAcceso
            to="/tienda"
            titulo="TIENDA"
            descripcion="Indumentaria y suplementos del gimnasio."
          />
          <TarjetaAcceso
            to="/app"
            titulo="APP DE ATLETA"
            descripcion="Ingresá con tu cuenta para ver tus marcas, asistencia y más."
          />
        </div>
      </div>

      {/* Contenido informativo */}
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          margin: "0 auto",
          padding: "50px 20px 20px",
        }}
      >
        <Seccion titulo="Quiénes somos">
          <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.9 }}>
            Ragnar Cross Training es un gimnasio pensado para acompañar a cada
            atleta en su proceso, sin importar el nivel o la edad. Combinamos
            entrenamiento funcional y crossfit con un seguimiento cercano de
            cada persona, en un ambiente de comunidad y esfuerzo compartido.
          </p>
        </Seccion>

        <Seccion titulo="Nuestra misión">
          <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.9 }}>
            Ayudar a cada persona que entra al gimnasio a mejorar su salud, su
            fuerza y su calidad de vida, con entrenamiento serio pero accesible
            — para quienes recién arrancan, para deportistas, y para adultos
            mayores que buscan moverse mejor cada día.
          </p>
        </Seccion>

        <Seccion titulo="Contacto">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              <span style={{ color: "#7a7a7a" }}>Dirección: </span>
              {CONTACTO.direccion}
            </div>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              <span style={{ color: "#7a7a7a" }}>Teléfono: </span>
              <a
                href={`https://wa.me/${CONTACTO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: Y, textDecoration: "none" }}
              >
                {CONTACTO.telefono}
              </a>
            </div>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              <span style={{ color: "#7a7a7a" }}>Email: </span>
              <a
                href={`mailto:${CONTACTO.email}`}
                style={{ color: Y, textDecoration: "none" }}
              >
                {CONTACTO.email}
              </a>
            </div>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              <span style={{ color: "#7a7a7a" }}>Instagram: </span>
              {CONTACTO.instagram}
            </div>
          </div>
        </Seccion>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${BORDER}`,
          marginTop: 30,
          padding: "24px 20px 40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>
          © {new Date().getFullYear()} Ragnar Cross Training
        </div>
        {/* Crédito de desarrollo — sin link todavía, pendiente de confirmar con el gimnasio */}
        <div
          style={{ fontSize: 9, color: "#444", letterSpacing: 1, marginTop: 6 }}
        >
          Desarrollado por [tu nombre / marca]
        </div>
      </div>
    </div>
  );
}
