// ── TAB: ASISTENCIA (atleta) — escaneo de QR para check-in ───────────────────
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Y, QR_CHECKIN_CODE } from "../../lib/constants";

const ID_LECTOR = "lector-qr-asistencia";

export default function AthleteAsistencia({
  asistenciaHoy,
  historialAsistencia,
  onRegistrarAsistencia,
}) {
  const [escaneando, setEscaneando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok"|"error", texto }
  const [procesando, setProcesando] = useState(false);
  const lectorRef = useRef(null);

  // Función de asistencia por QR — arranca la cámara y escucha el resultado
  const iniciarEscaneo = async () => {
    setMensaje(null);
    setEscaneando(true);
  };

  // Detener la cámara (al escanear con éxito, cancelar, o desmontar el componente)
  const detenerEscaneo = async () => {
    if (lectorRef.current) {
      try {
        await lectorRef.current.stop();
        await lectorRef.current.clear();
      } catch {
        // La cámara ya pudo haber sido detenida — no hace falta hacer nada
      }
      lectorRef.current = null;
    }
    setEscaneando(false);
  };

  // Procesar el contenido leído por la cámara
  const handleLectura = async (textoLeido) => {
    if (procesando) return;
    setProcesando(true);
    await detenerEscaneo();

    if (textoLeido.trim() !== QR_CHECKIN_CODE) {
      setMensaje({
        tipo: "error",
        texto: "Ese código no es el QR de asistencia de Ragnar.",
      });
      setProcesando(false);
      return;
    }

    const resultado = await onRegistrarAsistencia();
    if (resultado === "ok") {
      setMensaje({ tipo: "ok", texto: "¡Asistencia registrada! 💪" });
    } else if (resultado === "ya_registrado") {
      setMensaje({
        tipo: "error",
        texto: "Ya habías registrado tu asistencia hoy.",
      });
    } else {
      setMensaje({
        tipo: "error",
        texto: "Hubo un problema al guardar. Probá de nuevo.",
      });
    }
    setProcesando(false);
  };

  // Montar la cámara cuando se activa el modo escaneo
  useEffect(() => {
    if (!escaneando) return;

    const lector = new Html5Qrcode(ID_LECTOR);
    lectorRef.current = lector;

    lector
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (textoLeido) => handleLectura(textoLeido),
        () => {}, // errores de frame individual (sin QR en cuadro) — se ignoran
      )
      .catch(() => {
        setMensaje({
          tipo: "error",
          texto:
            "No se pudo acceder a la cámara. Revisá los permisos del navegador.",
        });
        setEscaneando(false);
      });

    return () => {
      detenerEscaneo();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escaneando]);

  if (asistenciaHoy === null) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: "#555",
          fontSize: 11,
        }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <>
      {/* Estado de hoy */}
      <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
        {asistenciaHoy ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 6 }}>✅</div>
            <div
              style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 22,
                color: "#4ade80",
                letterSpacing: 2,
              }}
            >
              ASISTENCIA REGISTRADA HOY
            </div>
            <div style={{ fontSize: 9, color: "#7a7a7a", marginTop: 6 }}>
              {new Date(asistenciaHoy.checked_in_at).toLocaleTimeString(
                "es-AR",
                { hour: "2-digit", minute: "2-digit" },
              )}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: "#999",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Todavía no marcaste hoy
            </div>
            {!escaneando ? (
              <button className="btn-y" onClick={iniciarEscaneo}>
                📷 ESCANEAR QR
              </button>
            ) : (
              <button
                onClick={detenerEscaneo}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "transparent",
                  border: "1px solid #444",
                  borderRadius: 2,
                  color: "#b3b3b3",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  letterSpacing: 2,
                  cursor: "pointer",
                }}
              >
                CANCELAR
              </button>
            )}
          </>
        )}

        {mensaje && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 2,
              fontSize: 10,
              letterSpacing: 1,
              background: mensaje.tipo === "ok" ? "#0d2b1a" : "#2b0d0d",
              color: mensaje.tipo === "ok" ? "#4ade80" : "#f87171",
              border: `1px solid ${mensaje.tipo === "ok" ? "#166534" : "#991b1b"}`,
            }}
          >
            {mensaje.texto}
          </div>
        )}
      </div>

      {/* Recuadro de la cámara — se llena solo cuando html5-qrcode arranca el video */}
      {escaneando && (
        <div className="card" style={{ marginBottom: 16, padding: 8 }}>
          <div
            id={ID_LECTOR}
            style={{ width: "100%", borderRadius: 2, overflow: "hidden" }}
          />
          <div
            style={{
              fontSize: 9,
              color: "#7a7a7a",
              textAlign: "center",
              marginTop: 8,
              letterSpacing: 1,
            }}
          >
            Apuntá al QR pegado en la entrada del gimnasio
          </div>
        </div>
      )}

      {/* Mini historial */}
      {historialAsistencia.length > 0 && (
        <div className="card">
          <div
            style={{
              fontSize: 9,
              letterSpacing: 3,
              color: "#999",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Últimas asistencias
          </div>
          {historialAsistencia.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#ccc",
                padding: "5px 0",
                borderBottom: "1px solid #1e1e1e",
              }}
            >
              <span>
                {new Date(a.checked_in_at).toLocaleDateString("es-AR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span style={{ color: "#7a7a7a" }}>
                {new Date(a.checked_in_at).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
