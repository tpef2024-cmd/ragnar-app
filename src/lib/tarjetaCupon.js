// ── GENERADOR DE LA IMAGEN DEL CUPÓN (PNG 1080x1200) ─
// Se dibuja directo en un <canvas> en vez de usar html2canvas: es más liviano
// y el resultado es idéntico en Android, iOS y escritorio.
import QRCode from "qrcode";
import { cargarImagen } from "./imagenLogo";
import { fechaCorta, venceCupon } from "./fechas";

const AMARILLO = "#F5C400";
export const PREFIJO_QR = "RAGNAR:";

export function contenidoQR(token) {
  return PREFIJO_QR + token;
}

export function qrDataUrl(token, ancho = 480) {
  return QRCode.toDataURL(contenidoQR(token), {
    width: ancho,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
}

function partirTexto(ctx, texto, anchoMax) {
  const palabras = String(texto || "").split(/\s+/);
  const lineas = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? actual + " " + p : p;
    if (ctx.measureText(prueba).width > anchoMax && actual) {
      lineas.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export async function generarImagenCupon({ cupon, descuento, comercio, nombreAtleta }) {
  const W = 1080;
  const H = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Asegurar que Bebas Neue / DM Mono estén cargadas antes de dibujar
  try {
    await Promise.all([document.fonts.load("100px 'Bebas Neue'"), document.fonts.load("30px 'DM Mono'")]);
  } catch {
    /* si falla, se dibuja con la fuente de respaldo */
  }

  // Fondo
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = AMARILLO;
  ctx.fillRect(0, 0, W, 14);

  // Encabezado
  ctx.textBaseline = "top";
  ctx.fillStyle = AMARILLO;
  ctx.font = "64px 'Bebas Neue', sans-serif";
  ctx.fillText("RAGNAR", 80, 70);
  ctx.fillStyle = "#999";
  ctx.font = "24px 'DM Mono', monospace";
  ctx.fillText("CUPÓN RAGNERO · USO ÚNICO", 80, 140);

  // Logo del comercio (si no carga por CORS o red, se omite)
  let xNombre = 80;
  if (comercio?.logo_url) {
    try {
      const logo = await cargarImagen(comercio.logo_url, { crossOrigin: true });
      const lado = 120;
      ctx.save();
      ctx.beginPath();
      ctx.arc(80 + lado / 2, 220 + lado / 2, lado / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.clip();
      const esc = Math.max(lado / logo.width, lado / logo.height);
      ctx.drawImage(logo, 80 + (lado - logo.width * esc) / 2, 220 + (lado - logo.height * esc) / 2, logo.width * esc, logo.height * esc);
      ctx.restore();
      xNombre = 80 + lado + 30;
    } catch {
      /* sin logo */
    }
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = "60px 'Bebas Neue', sans-serif";
  ctx.fillText(String(comercio?.name || "").toUpperCase().slice(0, 28), xNombre, 236);
  if (comercio?.address) {
    ctx.fillStyle = "#888";
    ctx.font = "22px 'DM Mono', monospace";
    ctx.fillText(comercio.address.slice(0, 50), xNombre, 304);
  }

  // Porcentaje + título
  ctx.fillStyle = AMARILLO;
  ctx.font = "200px 'Bebas Neue', sans-serif";
  ctx.fillText(`${descuento.percentage}%`, 80, 380);
  ctx.fillStyle = "#ffffff";
  ctx.font = "46px 'Bebas Neue', sans-serif";
  let y = 590;
  for (const l of partirTexto(ctx, descuento.title.toUpperCase(), 520).slice(0, 3)) {
    ctx.fillText(l, 80, y);
    y += 52;
  }
  if (descuento.conditions) {
    ctx.fillStyle = "#b3b3b3";
    ctx.font = "22px 'DM Mono', monospace";
    y += 10;
    for (const l of partirTexto(ctx, descuento.conditions, 520).slice(0, 5)) {
      ctx.fillText(l, 80, y);
      y += 32;
    }
  }

  // QR
  const qr = await cargarImagen(await qrDataUrl(cupon.token, 400));
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(630, 400, 370, 370);
  ctx.drawImage(qr, 645, 415, 340, 340);
  ctx.fillStyle = "#ffffff";
  ctx.font = "34px 'DM Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(cupon.short_code, 815, 800);
  ctx.textAlign = "left";

  // Pie: titular + vencimiento
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(80, 900, W - 160, 2);
  ctx.fillStyle = "#999";
  ctx.font = "22px 'DM Mono', monospace";
  ctx.fillText("TITULAR", 80, 930);
  ctx.fillText("VÁLIDO HASTA", 640, 930);
  ctx.fillStyle = "#ffffff";
  ctx.font = "52px 'Bebas Neue', sans-serif";
  ctx.fillText(String(nombreAtleta || "").toUpperCase().slice(0, 22), 80, 964);
  ctx.fillStyle = AMARILLO;
  ctx.fillText(fechaCorta(venceCupon(cupon, descuento)), 640, 964);

  ctx.fillStyle = "#666";
  ctx.font = "20px 'DM Mono', monospace";
  ctx.fillText("Personal e intransferible. El comercio puede pedirte DNI.", 80, 1090);
  ctx.fillText("Válido solo con la cuota de Ragnar al día.", 80, 1122);

  return new Promise((res) => canvas.toBlob(res, "image/png"));
}

// Comparte (menú nativo del celular: guardar en Fotos, WhatsApp, etc.) o, si
// el navegador no soporta compartir archivos, lo descarga.
export async function compartirODescargar(blob, nombreArchivo) {
  const archivo = new File([blob], nombreArchivo, { type: "image/png" });
  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: "Cupón Ragnar" });
      return;
    } catch (e) {
      if (e?.name === "AbortError") return; // el usuario cerró el menú
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
