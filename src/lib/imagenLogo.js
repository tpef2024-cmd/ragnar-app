// ── HELPERS DE IMÁGENES: LOGOS Y PORTADAS DE COMERCIOS ────────────────────────
// Achica las fotos del celular antes de subirlas a Supabase Storage (el bucket
// business-media acepta hasta 2 MB). A diferencia de lib/imagen.js (tienda),
// genera WebP/PNG en vez de JPEG para no perder la transparencia de los logos.

export async function comprimirImagenLogo(file, maxLado = 800, calidad = 0.85) {
  const url = URL.createObjectURL(file);
  try {
    const img = await cargarImagen(url);
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const w = Math.round(img.width * escala);
    const h = Math.round(img.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    // WebP mantiene la transparencia de los logos. Safari viejo no lo genera
    // y devuelve PNG: en ese caso usamos PNG (también está permitido).
    const blob = await new Promise((res) => canvas.toBlob(res, "image/webp", calidad));
    if (blob && blob.type === "image/webp") return { blob, ext: "webp" };
    const png = await new Promise((res) => canvas.toBlob(res, "image/png"));
    return { blob: png, ext: "png" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Carga una imagen y espera a que esté lista. `crossOrigin` es necesario para
// poder dibujar logos de Supabase Storage en un canvas y luego exportarlo.
export function cargarImagen(src, { crossOrigin = false, timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = src;
  });
}
