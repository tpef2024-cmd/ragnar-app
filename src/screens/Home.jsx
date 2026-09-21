// ── PANTALLA: HOME (inicio público) ───────────────────────────────────────────
// Primera pantalla al entrar al dominio. Presenta el gimnasio (quiénes somos,
// misión, valores, contacto) y da acceso a los dos apartados: Tienda y App
// de Atleta.
//
// TODO: dirección, email e Instagram siguen siendo placeholders — reemplazar
// con la info real que confirme el gimnasio.
import { Link } from "react-router-dom";
import LogoRagnar from "../components/shared/LogoRagnar";
import { globalStyles } from "../styles/globalStyles";
import { Y, BORDER } from "../lib/constants";

const CONTACTO = {
  telefono: "+54 9 291 468-3833",
  whatsapp: "5492914683833",
  email: "info@ragnarcrossfit.com",
  direccion: "Avda. Moreno n° 350",
  instagram: "@ragnar.cross2026",
  instagramSuple: "@ragnar.suple",
};

const VALORES = [
  {
    titulo: "Comunidad",
    texto:
      "Entrenamos juntos, nos acompañamos y celebramos el progreso de cada persona.",
  },
  {
    titulo: "Progresión",
    texto:
      "No buscamos resultados rápidos. Buscamos mejorar de manera constante y sostenible.",
  },
  {
    titulo: "Exigencia",
    texto:
      "Entrenamos con compromiso y seriedad, respetando el nivel y el proceso de cada atleta.",
  },
  {
    titulo: "Inclusión",
    texto:
      "Cada persona tiene un punto de partida diferente. El entrenamiento se adapta para que todos puedan progresar.",
  },
];

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

function TarjetaValor({ titulo, texto }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 18,
          letterSpacing: 2,
          color: Y,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {titulo}
      </div>
      <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.7 }}>
        {texto}
      </div>
    </div>
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
            Ragnar Cross Training es una comunidad de entrenamiento donde cada
            persona puede encontrar su propio desafío. Combinamos CrossFit,
            entrenamiento funcional, Hybrid y levantamientos olímpicos para
            acompañar distintos objetivos y niveles, desde quienes recién
            comienzan hasta quienes buscan mejorar su rendimiento. Creemos en
            entrenar con propósito, progresar de manera constante y disfrutar el
            proceso junto a otros.
          </p>
        </Seccion>

        <Seccion titulo="Nuestra misión">
          <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.9 }}>
            Ayudar a cada persona a ser más fuerte, moverse mejor y mejorar su
            calidad de vida. Creamos entrenamientos serios, progresivos y
            accesibles, adaptados a cada nivel y objetivo. Porque en Ragnar no
            se trata solamente de entrenar más. Se trata de entrenar mejor.
          </p>
        </Seccion>

        <Seccion titulo="Nuestros valores">
          <div className="valores-grid">
            {VALORES.map((v) => (
              <TarjetaValor key={v.titulo} titulo={v.titulo} texto={v.texto} />
            ))}
          </div>
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
              <span style={{ color: "#7a7a7a" }}>Instagram (Box): </span>
              <a
                href={`https://instagram.com/${CONTACTO.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: Y, textDecoration: "none" }}
              >
                {CONTACTO.instagram}
              </a>
            </div>
            <div style={{ fontSize: 12, color: "#ccc" }}>
              <span style={{ color: "#7a7a7a" }}>
                Instagram (Suplementos):{" "}
              </span>
              <a
                href={`https://instagram.com/${CONTACTO.instagramSuple.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: Y, textDecoration: "none" }}
              >
                {CONTACTO.instagramSuple}
              </a>
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
        {/* Crédito de desarrollo */}
        <div
          style={{ fontSize: 9, color: "#444", letterSpacing: 1, marginTop: 6 }}
        >
          Desarrollado por{" "}
          <a
            href="https://muten-dev.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#444", textDecoration: "underline" }}
          >
            Muten Dev
          </a>
        </div>
      </div>
    </div>
  );
}
