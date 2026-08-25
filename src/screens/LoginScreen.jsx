// ── PANTALLA: LOGIN / REGISTRO ────────────────────────────────────────────────
import { useState } from "react";
import { Link } from "react-router-dom";
import LogoRagnar from "../components/shared/LogoRagnar";
import { Y } from "../lib/constants";

export default function LoginScreen({
  onLogin,
  onRegistro,
  onEnviarRecuperacion,
}) {
  const [modoAuth, setModoAuth] = useState("login"); // "login" | "register" | "recuperar"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreRegistro, setNombreRegistro] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [mensajeInfo, setMensajeInfo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async () => {
    setErrorAuth("");
    setMensajeInfo("");
    setGuardando(true);

    if (modoAuth === "login") {
      const error = await onLogin(email, password);
      if (error) setErrorAuth(error);
    } else if (modoAuth === "recuperar") {
      const { error, mensaje } = await onEnviarRecuperacion(email);
      if (error) setErrorAuth(error);
      else if (mensaje) {
        setMensajeInfo(mensaje);
        setEmail("");
      }
    } else {
      const { error, mensaje } = await onRegistro(
        email,
        password,
        nombreRegistro,
      );
      if (error) setErrorAuth(error);
      else if (mensaje) {
        setMensajeInfo(mensaje);
        setEmail("");
        setPassword("");
        setNombreRegistro("");
      }
    }
    setGuardando(false);
  };

  const cambiarModo = (modo) => {
    setModoAuth(modo);
    setErrorAuth("");
    setMensajeInfo("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0a0a0a",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, padding: "20px 20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <LogoRagnar />
          <Link
            to="/"
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              letterSpacing: 1,
              color: "#7a7a7a",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg,${Y},transparent)`,
          }}
        />
      </div>

      <div
        className="fu"
        style={{ width: "100%", maxWidth: 480, padding: "36px 20px 20px" }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #2a2a2a",
            marginBottom: 24,
          }}
        >
          {[
            ["login", "Ingresar"],
            ["register", "Registrarse"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={`tab ${modoAuth === k ? "on" : ""}`}
              onClick={() => cambiarModo(k)}
            >
              {l}
            </button>
          ))}
        </div>

        {modoAuth === "recuperar" && (
          <div
            style={{
              fontSize: 11,
              color: "#999",
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            Ingresá tu email y te mandamos un link para poner una contraseña
            nueva.
          </div>
        )}

        {modoAuth === "register" && (
          <input
            className="inp"
            placeholder="Nombre completo"
            value={nombreRegistro}
            onChange={(e) => setNombreRegistro(e.target.value)}
          />
        )}

        <input
          className="inp"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {modoAuth !== "recuperar" && (
          <input
            className="inp"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {modoAuth === "login" && (
          <div style={{ textAlign: "right", marginBottom: 10 }}>
            <button
              onClick={() => cambiarModo("recuperar")}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#7a7a7a",
                fontFamily: "'DM Mono',monospace",
                fontSize: 9,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {errorAuth && (
          <div
            style={{
              color: "#f87171",
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            {errorAuth}
          </div>
        )}

        {mensajeInfo && (
          <div
            style={{
              color: "#4ade80",
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 10,
              lineHeight: 1.6,
            }}
          >
            {mensajeInfo}
          </div>
        )}

        {!mensajeInfo && (
          <button
            className="btn-y"
            style={{ marginTop: 8 }}
            onClick={handleSubmit}
            disabled={guardando}
          >
            {guardando ? (
              <span className="spin">◌</span>
            ) : modoAuth === "login" ? (
              "INGRESAR"
            ) : modoAuth === "recuperar" ? (
              "ENVIAR LINK"
            ) : (
              "CREAR CUENTA"
            )}
          </button>
        )}

        {modoAuth === "recuperar" && (
          <button
            onClick={() => cambiarModo("login")}
            style={{
              display: "block",
              margin: "12px auto 0",
              background: "none",
              border: "none",
              color: "#7a7a7a",
              fontFamily: "'DM Mono',monospace",
              fontSize: 9,
              letterSpacing: 1,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ← Volver a ingresar
          </button>
        )}

        {modoAuth !== "recuperar" && (
          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "#0c0c0c",
              border: "1px solid #222",
              borderRadius: 2,
              fontSize: 10,
              color: "#7a7a7a",
            }}
          >
            <div
              style={{
                letterSpacing: 3,
                marginBottom: 6,
                color: "#999",
                textTransform: "uppercase",
              }}
            >
              Primera vez
            </div>
            Registrate con tu email y confirmá la cuenta desde el mail que te
            enviamos. Después, el coach tiene que autorizar tu acceso antes de
            que puedas ingresar.
          </div>
        )}
      </div>
    </div>
  );
}
