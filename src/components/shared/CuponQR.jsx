// ── COMPONENTE: CUPÓN CON QR ──────────────────────────────────────────────────
// Muestra el cupón del atleta (QR + código corto) y permite descargarlo como
// imagen. Si ya fue utilizado o venció se muestra en gris y sin QR.
// Los cupones son mensuales: vencen a fin de mes (o antes si termina el descuento).
import { useEffect, useState } from "react";
import { Y } from "../../lib/constants";
import { fechaCorta, fechaHora, hoyAR, nombreMes, venceCupon } from "../../lib/fechas";
import { qrDataUrl, generarImagenCupon, compartirODescargar } from "../../lib/tarjetaCupon";

export default function CuponQR({ cupon, descuento, comercio, nombreAtleta, vencido = false }) {
  const [qr, setQr] = useState(null);
  const [descargando, setDescargando] = useState(false);
  const usado = cupon.status === "redeemed";
  const vence = venceCupon(cupon, descuento);
  const inactivo = usado || vencido || hoyAR() > vence;

  useEffect(() => {
    let vivo = true;
    if (!inactivo) qrDataUrl(cupon.token).then((url) => vivo && setQr(url));
    return () => {
      vivo = false;
    };
  }, [cupon.token, inactivo]);

  const descargar = async () => {
    setDescargando(true);
    try {
      const blob = await generarImagenCupon({ cupon, descuento, comercio, nombreAtleta });
      const slug = String(comercio?.name || "ragnar").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await compartirODescargar(blob, `cupon-${slug}-${cupon.short_code}.png`);
    } finally {
      setDescargando(false);
    }
  };

  if (inactivo) {
    return (
      <div className="card" style={{ textAlign: "center", opacity: 0.6, borderStyle: "dashed" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 3, color: "#999" }}>
          {usado ? "CUPÓN UTILIZADO" : "CUPÓN VENCIDO"}
        </div>
        <div style={{ fontSize: 10, color: "#7a7a7a", letterSpacing: 1, marginTop: 6 }}>
          {cupon.short_code} · {usado ? fechaHora(cupon.redeemed_at) : `venció el ${fechaCorta(vence)}`}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ textAlign: "center", borderColor: Y }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 12 }}>
        Cupón de {nombreMes(cupon.period)} · mostrá este QR en el comercio
      </div>
      <div
        style={{
          background: "#fff",
          padding: 10,
          borderRadius: 4,
          width: "min(100%, 260px)",
          aspectRatio: "1 / 1",
          margin: "0 auto",
        }}
      >
        {qr ? (
          <img src={qr} alt={`QR del cupón ${cupon.short_code}`} style={{ width: "100%", height: "100%", display: "block" }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            <span className="spin">◌</span>
          </div>
        )}
      </div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20, letterSpacing: 4, color: "#fff", margin: "14px 0 4px" }}>
        {cupon.short_code}
      </div>
      <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1, marginBottom: 16 }}>
        Uso único · válido hasta el {fechaCorta(vence)} · personal e intransferible
      </div>
      <button className="btn-y" onClick={descargar} disabled={descargando}>
        {descargando ? <span className="spin">◌</span> : "DESCARGAR CUPÓN"}
      </button>
    </div>
  );
}
