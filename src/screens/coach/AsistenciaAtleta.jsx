// ── VISTA: ASISTENCIA DE UN ATLETA (coach) ────────────────────────────────────
// Calendario mensual con los días que vino, total del mes, promedio semanal
// de las últimas 4 semanas comparado con la frecuencia de su grupo, y último
// día que vino. Tocando un día, el profe puede marcar o quitar la asistencia
// (para Kids o Adultos Mayores que no escanean el QR).
import { useState, useEffect } from "react";
import { Y } from "../../lib/constants";
import { fechaISO } from "../../lib/helpers";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

const estiloFlecha = (habilitada) => ({
  background: "transparent",
  border: "1px solid #3a3a3a",
  color: habilitada ? "#ddd" : "#333",
  fontFamily: "'DM Mono',monospace",
  fontSize: 12,
  width: 30,
  height: 30,
  borderRadius: 2,
  cursor: habilitada ? "pointer" : "default",
});

const formatearDia = (iso) => {
  if (!iso) return "—";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export default function AsistenciaAtleta({
  atleta,
  grupo,
  cargarAsistenciaAtleta,
  cargarUltimaAsistencia,
  onMarcar,
  onQuitar,
}) {
  const hoy = new Date();
  const [mes, setMes] = useState({ mes: hoy.getMonth() + 1, anio: hoy.getFullYear() });
  const [diasMes, setDiasMes] = useState(new Set());
  const [ultimas4Semanas, setUltimas4Semanas] = useState(0);
  const [ultima, setUltima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0); // se incrementa para recargar

  const primerDia = new Date(mes.anio, mes.mes - 1, 1);
  const ultimoDia = new Date(mes.anio, mes.mes, 0);
  const hoyISO = fechaISO(hoy);
  const esMesActual = mes.mes === hoy.getMonth() + 1 && mes.anio === hoy.getFullYear();

  useEffect(() => {
    let vigente = true;
    const hace28 = new Date();
    hace28.setDate(hace28.getDate() - 27);
    Promise.all([
      cargarAsistenciaAtleta(atleta.id, fechaISO(new Date(mes.anio, mes.mes - 1, 1)), fechaISO(new Date(mes.anio, mes.mes, 0))),
      cargarAsistenciaAtleta(atleta.id, fechaISO(hace28), fechaISO(new Date())),
      cargarUltimaAsistencia(atleta.id),
    ]).then(([delMes, recientes, ult]) => {
      if (!vigente) return;
      setDiasMes(new Set(delMes.map((r) => r.check_date)));
      setUltimas4Semanas(recientes.length);
      setUltima(ult);
      setCargando(false);
    });
    return () => {
      vigente = false;
    };
  }, [atleta.id, mes, version, cargarAsistenciaAtleta, cargarUltimaAsistencia]);

  const moverMes = (n) => {
    const total = mes.anio * 12 + (mes.mes - 1) + n;
    setCargando(true);
    setMes({ mes: (total % 12) + 1, anio: Math.floor(total / 12) });
  };

  const toggleDia = async (iso) => {
    if (iso > hoyISO) return;
    const vino = diasMes.has(iso);
    const confirmado = window.confirm(
      vino
        ? `¿Quitar la asistencia de ${atleta.full_name} del ${formatearDia(iso)}?`
        : `¿Marcar a ${atleta.full_name} presente el ${formatearDia(iso)}?`,
    );
    if (!confirmado) return;
    const ok = vino ? await onQuitar(atleta.id, iso) : await onMarcar(atleta.id, iso);
    if (!ok) window.alert("No se pudo guardar. Probá de nuevo.");
    setVersion((v) => v + 1);
  };

  // Frecuencia esperada según el grupo ("8AM — 3x semana" → 3)
  const frecuencia = Number((grupo?.name || "").match(/(\d)x semana/)?.[1]) || null;
  const promedioSemanal = ultimas4Semanas / 4;

  // Celdas del calendario: huecos hasta el primer día (semana arranca lunes)
  const offset = (primerDia.getDay() + 6) % 7;
  const celdas = [
    ...Array(offset).fill(null),
    ...Array.from({ length: ultimoDia.getDate() }, (_, i) => i + 1),
  ];

  const stat = (valor, label, color = "#fff") => (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, lineHeight: 1, color }}>{valor}</div>
      <div style={{ fontSize: 8, letterSpacing: 1, color: "#999", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );

  const colorPromedio = !frecuencia
    ? "#fff"
    : promedioSemanal >= frecuencia
      ? "#4ade80"
      : promedioSemanal >= frecuencia * 0.6
        ? Y
        : "#f87171";

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
        Asistencia
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {stat(cargando ? "…" : diasMes.size, `Clases en ${MESES[mes.mes - 1].slice(0, 3)}`)}
        {stat(
          cargando ? "…" : promedioSemanal.toLocaleString("es-AR", { maximumFractionDigits: 1 }),
          frecuencia ? `Por semana (de ${frecuencia})` : "Por semana",
          colorPromedio,
        )}
        {stat(cargando ? "…" : formatearDia(ultima), "Última vez")}
      </div>

      {/* Selector de mes */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button style={estiloFlecha(true)} onClick={() => moverMes(-1)}>←</button>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2 }}>
          {MESES[mes.mes - 1]} {mes.anio}
        </div>
        <button style={estiloFlecha(!esMesActual)} disabled={esMesActual} onClick={() => moverMes(1)}>→</button>
      </div>

      {/* Calendario */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, opacity: cargando ? 0.4 : 1 }}>
        {DIAS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 8, color: "#666", letterSpacing: 1, paddingBottom: 2 }}>{d}</div>
        ))}
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`v${i}`} />;
          const iso = fechaISO(new Date(mes.anio, mes.mes - 1, dia));
          const vino = diasMes.has(iso);
          const futuro = iso > hoyISO;
          return (
            <button
              key={iso}
              onClick={() => toggleDia(iso)}
              disabled={futuro || cargando}
              title={vino ? "Vino" : futuro ? "" : "Tocá para marcar presente"}
              style={{
                aspectRatio: "1",
                background: vino ? "#1a1500" : "transparent",
                border: `1px solid ${vino ? Y : iso === hoyISO ? "#666" : "#222"}`,
                color: vino ? Y : futuro ? "#333" : "#999",
                fontFamily: "'DM Mono',monospace",
                fontSize: 11,
                borderRadius: 2,
                cursor: futuro ? "default" : "pointer",
                padding: 0,
              }}
            >
              {dia}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginTop: 10 }}>
        Tocá un día para marcar o quitar la asistencia.
      </div>
    </div>
  );
}
