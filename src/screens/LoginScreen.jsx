// ── PANTALLA: LOGIN / REGISTRO ────────────────────────────────────────────────
import { useState } from "react";
import LogoRagnar from "../components/shared/LogoRagnar";
import { Y } from "../lib/constants";

export default function LoginScreen({ onLogin, onRegistro }) {
  const [modoAuth, setModoAuth] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreRegistro, setNombreRegistro] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async () => {
    setErrorAuth("");
    setGuardando(true);
    const error =
      modoAuth === "login"
        ? await onLogin(email, password)
        : await onRegistro(email, password, nombreRegistro);
    if (error) setErrorAuth(error);
    setGuardando(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", background: "#0a0a0a" }}>
      <div style={{ width: "100%", maxWidth: 480, padding: "20px 20px 0" }}>
        <div style={{ marginBottom: 10 }}>
          <LogoRagnar />
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${Y},transparent)` }} />
      </div>

      <div className="fu" style={{ width: "100%", maxWidth: 480, padding: "36px 20px 20px" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", marginBottom: 24 }}>
          {[
            ["login", "Ingresar"],
            ["register", "Registrarse"],
          ].map(([k, l]) => (
            <button key={k} className={`tab ${modoAuth === k ? "on" : ""}`} onClick={() => setModoAuth(k)}>
              {l}
            </button>
          ))}
        </div>

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
        <input
          className="inp"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorAuth && (
          <div style={{ color: "#f87171", fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>
            {errorAuth}
          </div>
        )}

        <button className="btn-y" style={{ marginTop: 8 }} onClick={handleSubmit} disabled={guardando}>
          {guardando ? <span className="spin">◌</span> : modoAuth === "login" ? "INGRESAR" : "CREAR CUENTA"}
        </button>

        <div style={{ marginTop: 20, padding: 14, background: "#0c0c0c", border: "1px solid #222", borderRadius: 2, fontSize: 10, color: "#7a7a7a" }}>
          <div style={{ letterSpacing: 3, marginBottom: 6, color: "#999", textTransform: "uppercase" }}>
            Primera vez
          </div>
          Registrate con tu email. El coach te asignará al grupo correspondiente.
        </div>
      </div>
    </div>
  );
}
