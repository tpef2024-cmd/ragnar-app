// ── PANTALLA: RESTABLECER CONTRASEÑA ──────────────────────────────────────────
// Se muestra cuando alguien entra desde el link del mail de "Recuperar
// contraseña" (ver useAuth.js — evento PASSWORD_RECOVERY). Una vez que
// confirma la contraseña nueva, entra directo a su panel.
import { useState } from "react";
import LogoRagnar from "../components/shared/LogoRagnar";
import { Y } from "../lib/constants";

export default function ResetPasswordScreen({ onActualizarPassword }) {
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setError("");
    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setGuardando(true);
    const { error: errorGuardado } = await onActualizarPassword(password);
    setGuardando(false);
    if (errorGuardado) setError(errorGuardado);
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
        <div style={{ marginBottom: 10 }}>
          <LogoRagnar />
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
        style={{ width: "100%", maxWidth: 480, padding: "48px 20px 20px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 26,
              letterSpacing: 3,
              color: Y,
              marginBottom: 10,
            }}
          >
            NUEVA CONTRASEÑA
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.8, color: "#b3b3b3" }}>
            Elegí una contraseña nueva para tu cuenta.
          </div>
        </div>

        <input
          className="inp"
          type="password"
          placeholder="Contraseña nueva"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="inp"
          type="password"
          placeholder="Repetir contraseña"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />

        {error && (
          <div
            style={{
              color: "#f87171",
              fontSize: 10,
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn-y"
          style={{ marginTop: 8 }}
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? <span className="spin">◌</span> : "GUARDAR Y ENTRAR"}
        </button>
      </div>
    </div>
  );
}
