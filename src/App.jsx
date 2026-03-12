import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://vpachxutgcwtdikdatrf.supabase.co";
const SUPABASE_KEY = "sb_publishable_TS6cGjRNS5fm1q5S1zgE5g_jxGdIfqP";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const MOVEMENTS = [
  "Back Squat",
  "Deadlift",
  "Clean & Jerk",
  "Snatch",
  "Press",
  "Bench Press",
];
const PCTS = [50, 60, 70, 75, 80, 85, 90, 95, 100];
const Y = "#F5C400";
const BG = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#1e1e1e";

// ── GROUP SELECTOR ────────────────────────────────────────────────────────────
const HORARIOS = ["7AM", "8AM", "10AM", "6PM", "8PM"];
const FRECUENCIAS = [
  "2x semana",
  "3x semana",
  "4x semana",
  "5x semana",
  "6x semana",
];

const GroupSelector = ({ groups, onSelect, onCancel }) => {
  const [horario, setHorario] = useState("");
  const [frecuencia, setFrecuencia] = useState("");

  const sel = groups.find((g) => g.name === `${horario} — ${frecuencia}`);

  const selectStyle = {
    width: "100%",
    background: "#080808",
    border: `1px solid #2a2a2a`,
    color: "#f0ede6",
    fontFamily: "'DM Mono',monospace",
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
    marginBottom: 10,
    appearance: "auto",
  };

  return (
    <div>
      <div
        style={{
          fontSize: 9,
          color: "#444",
          letterSpacing: 2,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        Horario
      </div>
      <select
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        style={selectStyle}
      >
        <option value="" disabled>
          Seleccioná horario...
        </option>
        {HORARIOS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <div
        style={{
          fontSize: 9,
          color: "#444",
          letterSpacing: 2,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        Frecuencia semanal
      </div>
      <select
        value={frecuencia}
        onChange={(e) => setFrecuencia(e.target.value)}
        style={selectStyle}
      >
        <option value="" disabled>
          Seleccioná frecuencia...
        </option>
        {FRECUENCIAS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      {sel && (
        <button
          onClick={() => onSelect(sel.id)}
          style={{
            width: "100%",
            background: "#1a1500",
            border: `1px solid ${Y}`,
            color: Y,
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: 2,
            padding: "10px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ✓ Confirmar — {sel.name}
        </button>
      )}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "1px solid #1e1e1e",
            color: "#444",
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: 2,
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

// ── TEXT LOGO ─────────────────────────────────────────────────────────────────
const RagnarLogo = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 30,
        letterSpacing: 6,
        color: "#fff",
        lineHeight: 1,
      }}
    >
      RAGNAR
    </div>
    <div
      style={{
        fontSize: 9,
        letterSpacing: 5,
        color: "#F5C400",
        textTransform: "uppercase",
        lineHeight: 1.4,
      }}
    >
      Cross Training
    </div>
  </div>
);

// ── ACHIEVEMENT CARD ──────────────────────────────────────────────────────────
const AchievementCard = ({ achievement, athleteName, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    }}
  >
    <div style={{ width: "100%", maxWidth: 380 }}>
      <div
        style={{
          background: "#0d0d0d",
          border: `2px solid ${Y}`,
          borderRadius: 4,
          padding: 32,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg,${Y}08 0px,${Y}08 1px,transparent 1px,transparent 12px)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 36,
              letterSpacing: 8,
              color: Y,
              lineHeight: 1,
            }}
          >
            RAGNAR
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 11,
            letterSpacing: 6,
            color: Y,
            marginBottom: 4,
          }}
        >
          RAGNAR CROSS TRAINING
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 64,
            lineHeight: 1,
            color: "#fff",
            textShadow: `0 0 40px ${Y}66`,
            marginBottom: 4,
          }}
        >
          {achievement.value}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: 20,
            color: Y,
            letterSpacing: 4,
            marginBottom: 14,
          }}
        >
          {achievement.movement}
        </div>
        <div
          style={{ width: 50, height: 2, background: Y, margin: "0 auto 14px" }}
        />
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            color: "#888",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          {achievement.type === "rm"
            ? "NUEVO RÉCORD PERSONAL"
            : "NUEVO PR — FOR TIME"}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 12,
            color: "#ccc",
          }}
        >
          {athleteName}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            color: "#333",
            letterSpacing: 3,
          }}
        >
          {new Date()
            .toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
            .toUpperCase()}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: 12,
          background: "transparent",
          border: `1px solid #333`,
          borderRadius: 2,
          fontFamily: "'DM Mono',monospace",
          fontSize: 10,
          letterSpacing: 2,
          color: "#555",
          cursor: "pointer",
          textTransform: "uppercase",
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Athlete state
  const [athleteTab, setAthleteTab] = useState("rm");
  const [selectedMov, setSelectedMov] = useState("Back Squat");
  const [rmRecords, setRmRecords] = useState([]);
  const [forTimes, setForTimes] = useState([]);
  const [newRM, setNewRM] = useState("");
  const [newFTName, setNewFTName] = useState("");
  const [newFTTime, setNewFTTime] = useState("");
  const [achievement, setAchievement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [changingGroup, setChangingGroup] = useState(false);
  const [coachAssigningGroup, setCoachAssigningGroup] = useState(false);

  // Coach state
  const [coachTab, setCoachTab] = useState("athletes");
  const [athletes, setAthletes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedAthleteMov, setSelectedAthleteMov] = useState("Back Squat");
  const [athleteRMs, setAthleteRMs] = useState([]);
  const [regName, setRegName] = useState("");
  const regRole = "athlete";

  // ── AUTH ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user);
      else setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user);
      else {
        setUser(null);
        setProfile(null);
        setScreen("login");
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (u) => {
    setUser(u);
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    setProfile(prof);
    setScreen(prof?.role === "coach" ? "coach" : "athlete");
    setLoading(false);
  };

  const handleLogin = async () => {
    setAuthError("");
    setSaving(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError(error.message);
    setSaving(false);
  };

  const handleRegister = async () => {
    setAuthError("");
    setSaving(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: regName } },
    });
    if (error) {
      setAuthError(error.message);
      setSaving(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: regName,
          role: regRole,
        },
        { onConflict: "id" },
      );
      // Reload profile immediately
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(prof);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ── LOAD ATHLETE DATA ──
  useEffect(() => {
    if (screen === "athlete" && user) {
      loadRMs();
      loadForTimes();
      loadAvailableGroups();
    }
    if (screen === "coach" && user) {
      loadAthletes();
      loadPayments();
      loadGroups();
      loadAvailableGroups();
    }
  }, [screen, user]);

  const loadAvailableGroups = async () => {
    const { data } = await supabase.from("groups").select("*").order("name");
    setAvailableGroups(data || []);
  };

  const saveAthleteGroup = async (groupId) => {
    await supabase
      .from("profiles")
      .update({ group_id: groupId })
      .eq("id", user.id);
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(prof);
  };

  const saveGroupForAthlete = async (athleteId, groupId) => {
    await supabase
      .from("profiles")
      .update({ group_id: groupId })
      .eq("id", athleteId);
    await loadAthletes();
    // Reload selected athlete with fresh data
    const { data: updated } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("id", athleteId)
      .single();
    if (updated) setSelectedAthlete(updated);
    setCoachAssigningGroup(false);
  };

  const loadRMs = async () => {
    const { data } = await supabase
      .from("rm_records")
      .select("*")
      .eq("athlete_id", user.id)
      .order("recorded_at", { ascending: false });
    setRmRecords(data || []);
  };

  const loadForTimes = async () => {
    const { data } = await supabase
      .from("for_time_records")
      .select("*")
      .eq("athlete_id", user.id)
      .order("recorded_at", { ascending: false });
    setForTimes(data || []);
  };

  const loadAthletes = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, groups(name)")
      .eq("role", "athlete");
    setAthletes(data || []);
  };

  const loadPayments = async () => {
    const now = new Date();
    const { data, error } = await supabase
      .from("payments")
      .select("athlete_id, status, period_month, period_year")
      .eq("period_month", now.getMonth() + 1)
      .eq("period_year", now.getFullYear())
      .eq("status", "paid");
    if (!error) setPayments(data || []);
  };

  const loadGroups = async () => {
    const { data } = await supabase.from("groups").select("*");
    setGroups(data || []);
  };

  // ── SAVE RM ──
  const saveRM = async () => {
    if (!newRM || isNaN(newRM)) return;
    setSaving(true);
    const val = parseFloat(newRM);
    const prev = getCurrentRM(selectedMov);
    const { error } = await supabase.from("rm_records").insert({
      athlete_id: user.id,
      movement: selectedMov,
      weight_kg: val,
    });
    if (!error) {
      await loadRMs();
      setNewRM("");
      if (!prev || val > prev)
        setAchievement({
          type: "rm",
          movement: selectedMov,
          value: `${val}kg`,
        });
    }
    setSaving(false);
  };

  // ── SAVE FOR TIME ──
  const saveFT = async () => {
    if (!newFTName || !newFTTime) return;
    setSaving(true);
    // Convert "4:32" to seconds
    const parts = newFTTime.split(":");
    const secs =
      parts.length === 2
        ? parseInt(parts[0]) * 60 + parseInt(parts[1])
        : parseInt(parts[0]);
    const { error } = await supabase.from("for_time_records").insert({
      athlete_id: user.id,
      workout_name: newFTName,
      time_seconds: secs,
    });
    if (!error) {
      await loadForTimes();
      setAchievement({
        type: "fortime",
        movement: newFTName,
        value: newFTTime,
      });
      setNewFTName("");
      setNewFTTime("");
    }
    setSaving(false);
  };

  // ── MARK PAYMENT ──
  const markPaid = async (athleteId) => {
    const now = new Date();
    const already = payments.some(
      (p) => p.athlete_id === athleteId && p.status === "paid",
    );
    if (already) return;
    // Update local state immediately for instant UI feedback
    const tempPayment = {
      athlete_id: athleteId,
      status: "paid",
      period_month: now.getMonth() + 1,
      period_year: now.getFullYear(),
    };
    setPayments((prev) => [...prev, tempPayment]);
    // Then save to DB
    await supabase.from("payments").insert({
      athlete_id: athleteId,
      amount: 0,
      period_month: now.getMonth() + 1,
      period_year: now.getFullYear(),
      method: "manual",
      status: "paid",
      registered_by: user.id,
    });
    // Reload to get real data
    await loadPayments();
    await loadAthletes();
  };

  // ── HELPERS ──
  const getCurrentRM = (mov) => {
    const rec = rmRecords.find((r) => r.movement === mov);
    return rec ? parseFloat(rec.weight_kg) : null;
  };

  const formatTime = (secs) => {
    if (!secs) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isPaidThisMonth = (athleteId) => {
    return payments.some(
      (p) => p.athlete_id === athleteId && p.status === "paid",
    );
  };

  const loadAthleteRMs = async (athleteId) => {
    const { data } = await supabase
      .from("rm_records")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("recorded_at", { ascending: false });
    setAthleteRMs(data || []);
  };

  const selectAthlete = (athlete) => {
    setSelectedAthlete(athlete);
    setSelectedAthleteMov("Back Squat");
    loadAthleteRMs(athlete.id);
    setCoachTab("atleta_detalle");
  };

  const currentRM = getCurrentRM(selectedMov);

  const getAthleteRM = (mov) => {
    const rec = athleteRMs.find((r) => r.movement === mov);
    return rec ? parseFloat(rec.weight_kg) : null;
  };

  // ── STYLES ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:${Y}}
    .tab{padding:10px 16px;background:transparent;border:none;border-bottom:2px solid transparent;
      color:#444;font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;
      letter-spacing:2px;cursor:pointer;transition:all .2s}
    .tab.on{color:${Y};border-bottom-color:${Y}}
    .tab:hover{color:#aaa}
    .card{background:${CARD};border:1px solid ${BORDER};border-radius:2px;padding:18px}
    .mov{padding:7px 12px;background:#111;border:1px solid #222;color:#555;
      font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;
      letter-spacing:1px;border-radius:2px;cursor:pointer;transition:all .15s}
    .mov.on{background:#1a1500;border-color:${Y};color:${Y}}
    .mov:hover{border-color:#444;color:#bbb}
    .pct-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #161616}
    .pct-row:last-child{border-bottom:none}
    .inp{width:100%;background:#080808;border:none;border-bottom:2px solid ${Y};
      color:#f0ede6;font-family:'DM Mono',monospace;font-size:18px;padding:10px 12px;
      outline:none;letter-spacing:1px;margin-bottom:10px}
    .inp::placeholder{color:#333}
    .btn-y{width:100%;padding:13px;background:${Y};border:none;border-radius:2px;
      font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;
      color:#0a0a0a;cursor:pointer;transition:all .15s}
    .btn-y:hover{background:#ffd633;transform:translateY(-1px)}
    .btn-y:disabled{background:#333;color:#555;transform:none;cursor:not-allowed}
    .btn-out{background:transparent;border:1px solid #252525;color:#444;
      font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;
      padding:6px 14px;cursor:pointer;border-radius:2px;transition:all .15s;text-transform:uppercase}
    .btn-out:hover{border-color:${Y};color:${Y}}
    .badge-ok{background:#0d2b1a;color:#4ade80;border:1px solid #166534;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
    .badge-no{background:#2b0d0d;color:#f87171;border:1px solid #991b1b;padding:2px 10px;border-radius:2px;font-size:9px;letter-spacing:1px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .3s ease forwards}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin .8s linear infinite;display:inline-block}
  `;

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{css}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 48,
              letterSpacing: 8,
              color: Y,
              lineHeight: 1,
            }}
          >
            RAGNAR
          </div>
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              color: "#333",
              letterSpacing: 4,
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            Cargando...
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: "'DM Mono','Courier New',monospace",
        color: "#f0ede6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>{css}</style>

      {/* TOPBAR */}
      <div style={{ width: "100%", maxWidth: 480, padding: "20px 20px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{ cursor: user ? "pointer" : "default" }}
            onClick={() => {
              if (!user) return;
              if (screen === "athlete") {
                setAthleteTab("resumen");
              }
              if (screen === "coach") {
                setCoachTab("athletes");
                setSelectedAthlete(null);
                setCoachAssigningGroup(false);
              }
            }}
          >
            <RagnarLogo />
          </div>
          {user && (
            <button className="btn-out" onClick={handleLogout}>
              Salir
            </button>
          )}
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg,${Y},transparent)`,
          }}
        />
      </div>

      {/* ── LOGIN / REGISTER ── */}
      {screen === "login" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "36px 20px 20px" }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 24,
            }}
          >
            {[
              ["login", "Ingresar"],
              ["register", "Registrarse"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${authMode === k ? "on" : ""}`}
                onClick={() => setAuthMode(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {authMode === "register" && (
            <input
              className="inp"
              placeholder="Nombre completo"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
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

          {authError && (
            <div
              style={{
                color: "#f87171",
                fontSize: 10,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              {authError}
            </div>
          )}

          <button
            className="btn-y"
            style={{ marginTop: 8 }}
            onClick={authMode === "login" ? handleLogin : handleRegister}
            disabled={saving}
          >
            {saving ? (
              <span className="spin">◌</span>
            ) : authMode === "login" ? (
              "INGRESAR"
            ) : (
              "CREAR CUENTA"
            )}
          </button>

          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "#0c0c0c",
              border: "1px solid #181818",
              borderRadius: 2,
              fontSize: 10,
              color: "#333",
            }}
          >
            <div
              style={{
                letterSpacing: 3,
                marginBottom: 6,
                color: "#222",
                textTransform: "uppercase",
              }}
            >
              Primera vez
            </div>
            Registrate con tu email. El coach te asignará al grupo
            correspondiente.
          </div>
        </div>
      )}

      {/* ── ATHLETE PANEL ── */}
      {screen === "athlete" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "24px 20px" }}
        >
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 9,
                color: Y,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Atleta
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 28,
                letterSpacing: 2,
              }}
            >
              {profile?.full_name || user?.email}
            </div>
            {profile?.group_id && availableGroups.length > 0 && (
              <div
                style={{
                  fontSize: 9,
                  color: "#444",
                  letterSpacing: 2,
                  marginTop: 2,
                }}
              >
                {availableGroups.find((g) => g.id === profile.group_id)?.name ||
                  ""}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 18,
              overflowX: "auto",
            }}
          >
            {[
              ["resumen", "📊"],
              ["rm", "⚡ RMs"],
              ["fortime", "⏱"],
              ["logros", "🏆"],
              ["perfil", "👤 Perfil"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${athleteTab === k ? "on" : ""}`}
                onClick={() => setAthleteTab(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* PERFIL TAB */}
          {athleteTab === "perfil" && (
            <div>
              <div className="card" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Mi Perfil
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#444",
                      letterSpacing: 2,
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Nombre
                  </div>
                  <div style={{ fontSize: 16, color: "#f0ede6" }}>
                    {profile?.full_name}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#444",
                      letterSpacing: 2,
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontSize: 16, color: "#f0ede6" }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Mi Grupo / Horario
                </div>
                {profile?.group_id ? (
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 26,
                        letterSpacing: 3,
                        color: Y,
                      }}
                    >
                      {availableGroups.find((g) => g.id === profile.group_id)
                        ?.name || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#444",
                        letterSpacing: 1,
                        marginTop: 4,
                      }}
                    >
                      {availableGroups.find((g) => g.id === profile.group_id)
                        ?.schedule || ""}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#2a2a2a",
                        letterSpacing: 1,
                        marginTop: 10,
                      }}
                    >
                      Para cambiar de grupo contactá a tu coach.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}
                  >
                    Sin grupo asignado. Tu coach te asignará uno pronto.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESUMEN TAB */}
          {athleteTab === "resumen" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {MOVEMENTS.map((m) => {
                  const val = getCurrentRM(m);
                  return (
                    <div
                      key={m}
                      className="card"
                      style={{
                        cursor: "pointer",
                        borderColor: val ? "#2a2a2a" : BORDER,
                      }}
                      onClick={() => {
                        setSelectedMov(m);
                        setAthleteTab("rm");
                      }}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          letterSpacing: 2,
                          color: "#444",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {m}
                      </div>
                      {val ? (
                        <>
                          <div
                            style={{
                              fontFamily: "'Bebas Neue',sans-serif",
                              fontSize: 38,
                              lineHeight: 1,
                              color: Y,
                            }}
                          >
                            {val}
                            <span
                              style={{
                                fontSize: 14,
                                color: "#555",
                                marginLeft: 3,
                              }}
                            >
                              kg
                            </span>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            {[70, 80, 90].map((pct) => (
                              <div
                                key={pct}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 9,
                                  color: "#555",
                                  padding: "2px 0",
                                  borderTop: "1px solid #161616",
                                }}
                              >
                                <span
                                  style={{
                                    color: pct === 90 ? "#888" : "#444",
                                  }}
                                >
                                  {pct}%
                                </span>
                                <span
                                  style={{
                                    color: pct === 90 ? Y : "#666",
                                    fontFamily: "'Bebas Neue',sans-serif",
                                    fontSize: 13,
                                  }}
                                >
                                  {Math.round((val * pct) / 100)}kg
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 28,
                            color: "#222",
                            lineHeight: 1,
                          }}
                        >
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {MOVEMENTS.every((m) => !getCurrentRM(m)) && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#222",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    letterSpacing: 3,
                  }}
                >
                  SIN RMs REGISTRADOS AÚN
                  <br />
                  <span style={{ fontSize: 11, color: "#1a1a1a" }}>
                    Andá a ⚡ RMs para cargar
                  </span>
                </div>
              )}
            </>
          )}

          {/* RM TAB */}
          {athleteTab === "rm" && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {MOVEMENTS.map((m) => (
                  <button
                    key={m}
                    className={`mov ${selectedMov === m ? "on" : ""}`}
                    onClick={() => setSelectedMov(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: "#333",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    1RM — {selectedMov}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 56,
                      lineHeight: 1,
                      color: currentRM ? Y : "#1e1e1e",
                    }}
                  >
                    {currentRM || "—"}
                    {currentRM && (
                      <span
                        style={{ fontSize: 20, color: "#fff", marginLeft: 6 }}
                      >
                        kg
                      </span>
                    )}
                  </div>
                </div>

                {currentRM ? (
                  <>
                    <div
                      style={{
                        fontSize: 9,
                        letterSpacing: 3,
                        color: "#333",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Porcentajes
                    </div>
                    {PCTS.map((p) => (
                      <div key={p} className="pct-row">
                        <div
                          style={{
                            width: 44,
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 20,
                            color: p >= 85 ? Y : p >= 70 ? "#ccc" : "#444",
                          }}
                        >
                          {p}%
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            background: "#1a1a1a",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p}%`,
                              height: "100%",
                              background:
                                p >= 85 ? Y : p >= 70 ? "#555" : "#2a2a2a",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: 64,
                            textAlign: "right",
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 22,
                            color: p >= 85 ? Y : "#f0ede6",
                          }}
                        >
                          {Math.round((currentRM * p) / 100)}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#444",
                              marginLeft: 2,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div
                    style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}
                  >
                    Sin RM registrado para este movimiento.
                  </div>
                )}
              </div>

              <div className="card">
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {currentRM ? "Actualizar" : "Cargar"} RM — {selectedMov}
                </div>
                <input
                  className="inp"
                  type="number"
                  placeholder="kg"
                  value={newRM}
                  onChange={(e) => setNewRM(e.target.value)}
                />
                <button className="btn-y" onClick={saveRM} disabled={saving}>
                  {saving ? <span className="spin">◌</span> : "GUARDAR RM"}
                </button>
              </div>
            </>
          )}

          {/* FOR TIME TAB */}
          {athleteTab === "fortime" && (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Nuevo PR
                </div>
                <input
                  className="inp"
                  placeholder="Workout (ej: Fran, Murph...)"
                  value={newFTName}
                  onChange={(e) => setNewFTName(e.target.value)}
                />
                <input
                  className="inp"
                  placeholder="Tiempo (ej: 4:32)"
                  value={newFTTime}
                  onChange={(e) => setNewFTTime(e.target.value)}
                />
                <button className="btn-y" onClick={saveFT} disabled={saving}>
                  {saving ? <span className="spin">◌</span> : "GUARDAR PR ⚡"}
                </button>
              </div>

              {forTimes.length > 0 && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {forTimes.map((ft) => (
                    <div
                      key={ft.id}
                      className="card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 18,
                            letterSpacing: 2,
                            color: Y,
                          }}
                        >
                          {ft.workout_name}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#444",
                            letterSpacing: 1,
                          }}
                        >
                          {new Date(ft.recorded_at).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 30,
                          color: "#fff",
                        }}
                      >
                        {formatTime(ft.time_seconds)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* LOGROS TAB */}
          {athleteTab === "logros" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MOVEMENTS.map((m) => {
                const val = getCurrentRM(m);
                if (!val) return null;
                return (
                  <div
                    key={m}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 18,
                          color: Y,
                          letterSpacing: 2,
                        }}
                      >
                        {m}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 30,
                          color: "#fff",
                        }}
                      >
                        {val}
                        <span
                          style={{ fontSize: 13, color: "#555", marginLeft: 4 }}
                        >
                          kg
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setAchievement({
                          type: "rm",
                          movement: m,
                          value: `${val}kg`,
                        })
                      }
                      style={{
                        background: "#1a1500",
                        border: `1px solid ${Y}`,
                        color: Y,
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        letterSpacing: 1,
                        padding: "8px 10px",
                        borderRadius: 2,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      📸 Compartir
                    </button>
                  </div>
                );
              })}
              {forTimes.slice(0, 5).map((ft) => (
                <div
                  key={ft.id}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 18,
                        color: Y,
                        letterSpacing: 2,
                      }}
                    >
                      {ft.workout_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 30,
                        color: "#fff",
                      }}
                    >
                      {formatTime(ft.time_seconds)}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setAchievement({
                        type: "fortime",
                        movement: ft.workout_name,
                        value: formatTime(ft.time_seconds),
                      })
                    }
                    style={{
                      background: "#1a1500",
                      border: `1px solid ${Y}`,
                      color: Y,
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "8px 10px",
                      borderRadius: 2,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    📸 Compartir
                  </button>
                </div>
              ))}
              {rmRecords.length === 0 && forTimes.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#222",
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 16,
                    letterSpacing: 3,
                  }}
                >
                  CARGÁ TUS PRIMEROS RMs
                  <br />Y APARECERÁN ACÁ
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── COACH PANEL ── */}
      {screen === "coach" && (
        <div
          className="fu"
          style={{ width: "100%", maxWidth: 480, padding: "24px 20px" }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 9,
                color: Y,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Coach
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 28,
                letterSpacing: 2,
              }}
            >
              {profile?.full_name || "Admin"}
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Atletas", val: athletes.length, color: "#fff" },
              {
                label: "Al día",
                val: athletes.filter((a) => isPaidThisMonth(a.id)).length,
                color: "#4ade80",
              },
              {
                label: "Deben",
                val: athletes.filter((a) => !isPaidThisMonth(a.id)).length,
                color: "#f87171",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="card"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    fontFamily: "'Bebas Neue',sans-serif",
                    fontSize: 38,
                    lineHeight: 1,
                    color: s.color,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    letterSpacing: 2,
                    color: "#333",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 16,
            }}
          >
            {[
              ["athletes", "Atletas"],
              ["payments", "Pagos"],
              ["groups", "Grupos"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={`tab ${coachTab === k || (coachTab === "atleta_detalle" && k === "athletes") ? "on" : ""}`}
                onClick={() => setCoachTab(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* ATHLETE DETAIL VIEW */}
          {coachTab === "atleta_detalle" && selectedAthlete && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <button
                  onClick={() => {
                    setCoachTab("athletes");
                    setCoachAssigningGroup(false);
                  }}
                  style={{
                    background: "transparent",
                    border: `1px solid #2a2a2a`,
                    color: "#555",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    padding: "6px 12px",
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                >
                  ← VOLVER
                </button>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: Y,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                    }}
                  >
                    Atleta
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue',sans-serif",
                      fontSize: 22,
                      letterSpacing: 2,
                    }}
                  >
                    {selectedAthlete.full_name}
                  </div>
                </div>
              </div>

              {/* Grupo del atleta */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: "#333",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Grupo / Horario
                </div>
                {!coachAssigningGroup ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {selectedAthlete.group_id ? (
                        <>
                          <div
                            style={{
                              fontFamily: "'Bebas Neue',sans-serif",
                              fontSize: 22,
                              letterSpacing: 3,
                              color: Y,
                            }}
                          >
                            {availableGroups.find(
                              (g) => g.id === selectedAthlete.group_id,
                            )?.name || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: "#444",
                              letterSpacing: 1,
                            }}
                          >
                            {availableGroups.find(
                              (g) => g.id === selectedAthlete.group_id,
                            )?.schedule || ""}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#f87171",
                            letterSpacing: 1,
                          }}
                        >
                          Sin grupo asignado
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setCoachAssigningGroup(true)}
                      style={{
                        background: "transparent",
                        border: `1px solid #2a2a2a`,
                        color: "#555",
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        padding: "6px 12px",
                        borderRadius: 2,
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      {selectedAthlete.group_id ? "Cambiar" : "Asignar"}
                    </button>
                  </div>
                ) : (
                  <GroupSelector
                    groups={availableGroups}
                    onSelect={(groupId) =>
                      saveGroupForAthlete(selectedAthlete.id, groupId)
                    }
                    onCancel={() => setCoachAssigningGroup(false)}
                  />
                )}
              </div>

              {/* RM Grid resumen */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {MOVEMENTS.map((m) => {
                  const val = getAthleteRM(m);
                  return (
                    <div
                      key={m}
                      className="card"
                      style={{
                        cursor: "pointer",
                        borderColor: selectedAthleteMov === m ? Y : BORDER,
                      }}
                      onClick={() => setSelectedAthleteMov(m)}
                    >
                      <div
                        style={{
                          fontSize: 8,
                          letterSpacing: 2,
                          color: "#444",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {m}
                      </div>
                      {val ? (
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 36,
                            lineHeight: 1,
                            color: selectedAthleteMov === m ? Y : "#ccc",
                          }}
                        >
                          {val}
                          <span
                            style={{
                              fontSize: 13,
                              color: "#555",
                              marginLeft: 3,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 28,
                            color: "#1e1e1e",
                          }}
                        >
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Porcentajes del movimiento seleccionado */}
              {getAthleteRM(selectedAthleteMov) && (
                <div className="card">
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: "#333",
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    Porcentajes — {selectedAthleteMov}
                  </div>
                  {PCTS.map((p) => {
                    const val = getAthleteRM(selectedAthleteMov);
                    return (
                      <div key={p} className="pct-row">
                        <div
                          style={{
                            width: 44,
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 20,
                            color: p >= 85 ? Y : p >= 70 ? "#ccc" : "#444",
                          }}
                        >
                          {p}%
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            background: "#1a1a1a",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p}%`,
                              height: "100%",
                              background:
                                p >= 85 ? Y : p >= 70 ? "#555" : "#2a2a2a",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            width: 64,
                            textAlign: "right",
                            fontFamily: "'Bebas Neue',sans-serif",
                            fontSize: 22,
                            color: p >= 85 ? Y : "#f0ede6",
                          }}
                        >
                          {Math.round((val * p) / 100)}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#444",
                              marginLeft: 2,
                            }}
                          >
                            kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {coachTab === "athletes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Buscador */}
              <input
                className="inp"
                placeholder="Buscar atleta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ marginBottom: 4 }}
              />
              {athletes.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN ATLETAS REGISTRADOS AÚN
                </div>
              )}
              {athletes
                .filter((a) =>
                  a.full_name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((a) => (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {a.full_name}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#333", letterSpacing: 1 }}
                      >
                        {a.groups?.name || "Sin grupo"}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <button
                        onClick={() => selectAthlete(a)}
                        style={{
                          background: "#1a1500",
                          border: `1px solid ${Y}`,
                          color: Y,
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 9,
                          letterSpacing: 1,
                          padding: "6px 10px",
                          borderRadius: 2,
                          cursor: "pointer",
                          textTransform: "uppercase",
                        }}
                      >
                        Ver atleta
                      </button>
                      <span
                        className={
                          isPaidThisMonth(a.id) ? "badge-ok" : "badge-no"
                        }
                      >
                        {isPaidThisMonth(a.id) ? "AL DÍA" : "DEBE"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {coachTab === "payments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {athletes.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN ATLETAS REGISTRADOS AÚN
                </div>
              )}
              {athletes.map((a) => {
                const paid = isPaidThisMonth(a.id);
                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {a.full_name}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: 1,
                          color: paid ? "#4ade80" : "#f87171",
                        }}
                      >
                        {paid ? "✓ Al día este mes" : "Cuota pendiente"}
                      </div>
                    </div>
                    {!paid ? (
                      <button
                        onClick={() => markPaid(a.id)}
                        style={{
                          background: "#0d2b1a",
                          border: "1px solid #166534",
                          color: "#4ade80",
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 9,
                          letterSpacing: 1,
                          padding: "7px 12px",
                          borderRadius: 2,
                          cursor: "pointer",
                          textTransform: "uppercase",
                        }}
                      >
                        ✓ Marcar pagado
                      </button>
                    ) : (
                      <span className="badge-ok">AL DÍA</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {coachTab === "groups" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {groups.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: "#333",
                    fontSize: 10,
                    letterSpacing: 2,
                  }}
                >
                  SIN GRUPOS CREADOS AÚN
                </div>
              )}
              {groups.map((g) => {
                const members = athletes.filter((a) => a.group_id === g.id);
                return (
                  <div key={g.id} className="card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Bebas Neue',sans-serif",
                          fontSize: 22,
                          color: Y,
                          letterSpacing: 3,
                        }}
                      >
                        {g.name}
                      </div>
                      <div
                        style={{ fontSize: 9, color: "#444", letterSpacing: 2 }}
                      >
                        {members.length} atletas
                      </div>
                    </div>
                    {members.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          fontSize: 11,
                          color: "#888",
                          padding: "4px 0",
                          borderBottom: "1px solid #161616",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {a.full_name}
                        <span
                          className={
                            isPaidThisMonth(a.id) ? "badge-ok" : "badge-no"
                          }
                        >
                          {isPaidThisMonth(a.id) ? "AL DÍA" : "DEBE"}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {achievement && (
        <AchievementCard
          achievement={achievement}
          athleteName={profile?.full_name}
          onClose={() => setAchievement(null)}
        />
      )}
    </div>
  );
}
