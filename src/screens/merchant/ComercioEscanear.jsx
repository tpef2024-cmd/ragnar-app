// ── TAB: ESCANEAR (comercio Ragnero) ──────────────────────────────────────────
// Flujo: escanear QR (o tipear el código) → la base valida y muestra quién es
// el atleta y qué descuento corresponde → el comercio CONFIRMA → cupón usado.
// La validación previa no consume el cupón, así un escaneo accidental no lo quema.
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Y } from "../../lib/constants";
import { fechaCorta, fechaHora } from "../../lib/fechas";

const ID_LECTOR = "lector-qr-ragnar";

function vibrar(patron) {
  try {
    navigator.vibrate?.(patron);
  } catch {
    /* no soportado */
  }
}

export default function ComercioEscanear({ negocio, validarCupon, canjearCupon }) {
  // "camara" | "validando" | "preview" | "error" | "exito"
  const [fase, setFase] = useState("camara");
  const [resultado, setResultado] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [manual, setManual] = useState("");
  const [errorCamara, setErrorCamara] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const lectorRef = useRef(null);
  const procesandoRef = useRef(false);

  const validar = async (texto) => {
    if (procesandoRef.current) return;
    procesandoRef.current = true;
    setCodigo(texto);
    setFase("validando");
    const r = await validarCupon(texto);
    setResultado(r);
    setFase(r?.ok ? "preview" : "error");
    vibrar(r?.ok ? 80 : [80, 60, 80]);
    procesandoRef.current = false;
  };

  // Cámara: se prende solo en la fase "camara" y se apaga al salir de ella
  useEffect(() => {
    if (fase !== "camara") return;
    let cancelado = false;
    const lector = new Html5Qrcode(ID_LECTOR, { verbose: false });
    lectorRef.current = lector;

    lector
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) },
        (texto) => {
          if (!cancelado) validar(texto);
        },
        () => {},
      )
      .then(() => setErrorCamara(""))
      .catch(() => {
        if (!cancelado) setErrorCamara("No pudimos acceder a la cámara. Revisá el permiso del navegador o cargá el código a mano.");
      });

    return () => {
      cancelado = true;
      const l = lectorRef.current;
      lectorRef.current = null;
      if (l?.isScanning) l.stop().then(() => l.clear()).catch(() => {});
      else
        try {
          l?.clear();
        } catch {
          /* nada */
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  const confirmar = async () => {
    setConfirmando(true);
    const r = await canjearCupon(codigo);
    setConfirmando(false);
    setResultado(r);
    setFase(r?.ok && r.canjeado ? "exito" : "error");
    vibrar(r?.ok ? [60, 40, 160] : [80, 60, 80]);
  };

  const reiniciar = () => {
    setResultado(null);
    setCodigo("");
    setManual("");
    setFase("camara");
  };

  const info = resultado?.info;

  if (negocio && negocio.status !== "approved") {
    return (
      <div className="card" style={{ textAlign: "center", color: "#999", fontSize: 11, lineHeight: 1.7 }}>
        Tu comercio todavía no está habilitado para canjear cupones.
      </div>
    );
  }

  return (
    <div>
      {fase === "camara" && (
        <>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 10 }}>
            Escaneá el cupón del atleta
          </div>
          <div id={ID_LECTOR} className="lector-qr" />
          {errorCamara && (
            <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, lineHeight: 1.6, marginTop: 10 }}>{errorCamara}</div>
          )}

          <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", margin: "22px 0 6px" }}>
            O cargá el código
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="inp"
              style={{ marginBottom: 0, textTransform: "uppercase", flex: 1 }}
              placeholder="RGN-XXXXXX"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && manual.trim() && validar(manual)}
            />
            <button className="btn-salir" onClick={() => manual.trim() && validar(manual)} disabled={!manual.trim()}>
              Validar
            </button>
          </div>
        </>
      )}

      {fase === "validando" && (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
          <span className="spin" style={{ fontSize: 28 }}>◌</span>
          <div style={{ fontSize: 10, letterSpacing: 3, marginTop: 12 }}>VALIDANDO CUPÓN</div>
        </div>
      )}

      {fase === "preview" && info && (
        <div className="card fu" style={{ borderColor: Y }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: Y, textTransform: "uppercase", marginBottom: 8 }}>Cupón válido</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>{info.atleta}</div>
          <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, margin: "4px 0 14px" }}>
            Verificá que sea la persona (podés pedirle DNI)
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, lineHeight: 1, color: Y }}>{info.descuento}%</div>
            <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.4 }}>{info.titulo}</div>
          </div>
          {info.condiciones && <div style={{ fontSize: 11, color: "#b3b3b3", lineHeight: 1.7, marginTop: 10 }}>{info.condiciones}</div>}
          <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, marginTop: 10 }}>
            {info.codigo} · válido hasta el {fechaCorta(info.valido_hasta)}
          </div>
          <button className="btn-y" style={{ marginTop: 18 }} onClick={confirmar} disabled={confirmando}>
            {confirmando ? <span className="spin">◌</span> : "CONFIRMAR CANJE"}
          </button>
          <button className="btn-salir" style={{ width: "100%", marginTop: 8, padding: 10 }} onClick={reiniciar}>
            Cancelar
          </button>
        </div>
      )}

      {fase === "exito" && info && (
        <div className="card fu" style={{ borderColor: "#4ade80", background: "#0b1a10", textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: 3, color: "#4ade80" }}>CANJE REGISTRADO</div>
          <div style={{ fontSize: 13, color: "#fff", margin: "8px 0 4px" }}>{info.atleta}</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: Y, lineHeight: 1 }}>{info.descuento}% OFF</div>
          <div style={{ fontSize: 11, color: "#b3b3b3", marginTop: 6 }}>{info.titulo}</div>
          <button className="btn-y" style={{ marginTop: 20 }} onClick={reiniciar}>
            ESCANEAR OTRO
          </button>
        </div>
      )}

      {fase === "error" && (
        <div className="card fu" style={{ borderColor: "#f87171", background: "#1a0b0b", textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>❌</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, color: "#f87171" }}>
            {resultado?.motivo || "Cupón no válido"}
          </div>
          {resultado?.utilizado_el && (
            <div style={{ fontSize: 10, color: "#b3b3b3", letterSpacing: 1, marginTop: 6 }}>
              Se usó el {fechaHora(resultado.utilizado_el)}
            </div>
          )}
          {info?.atleta && <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>{info.atleta} · {info.titulo}</div>}
          <button className="btn-y" style={{ marginTop: 20 }} onClick={reiniciar}>
            ESCANEAR OTRO
          </button>
        </div>
      )}
    </div>
  );
}
