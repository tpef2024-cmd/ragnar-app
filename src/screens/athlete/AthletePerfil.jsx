// ── TAB: PERFIL (atleta) ──────────────────────────────────────────────────────
import { Y } from "../../lib/constants";

export default function AthletePerfil({ perfil, usuario, gruposDisponibles }) {
  const grupo = gruposDisponibles.find((g) => g.id === perfil?.group_id);

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 14 }}>
          Mi Perfil
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>
            Nombre
          </div>
          <div style={{ fontSize: 16, color: "#fff" }}>{perfil?.full_name}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 2, marginBottom: 4, textTransform: "uppercase" }}>
            Email
          </div>
          <div style={{ fontSize: 14, color: "#ccc" }}>{usuario?.email}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
          Mi Grupo / Horario
        </div>
        {perfil?.group_id ? (
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, color: Y }}>
              {grupo?.name || "—"}
            </div>
            <div style={{ fontSize: 9, color: "#999", letterSpacing: 1, marginTop: 4 }}>
              {grupo?.schedule || ""}
            </div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginTop: 10 }}>
              Para cambiar de grupo contactá a tu coach.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>
            Sin grupo asignado. Tu coach te asignará uno pronto.
          </div>
        )}
      </div>
    </div>
  );
}
