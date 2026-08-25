// ── HELPER: COMPRESIÓN DE IMÁGENES ────────────────────────────────────────────
// Redimensiona y comprime una foto en el navegador ANTES de subirla a
// Supabase Storage. Sin esto, una foto de celular (3-8 MB) hace que la
// tienda pública tarde mucho en cargar — cada visitante tiene que descargar
// todas esas fotos completas para ver el catálogo.
//
// Estrategia: redimensionar al ancho máximo definido (se mantiene la
// proporción) y recodificar como JPEG con calidad reducida. El resultado
// suele pesar entre 80-250kb en vez de varios MB, sin pérdida de calidad
// visible en pantalla.
export async function comprimirImagen(file, { anchoMaximo = 1000, calidad = 0.8 } = {}) {
  // Si el archivo ya es chico, no vale la pena procesarlo — se sube tal cual.
  if (file.size < 150 * 1024) return file;

  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, anchoMaximo / bitmap.width);
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", calidad),
  );

  // Si por algún motivo la compresión no corrió bien (blob null), se sube
  // el original en vez de fallar la subida completa.
  if (!blob) return file;

  // Le renombramos la extensión a .jpg ya que siempre recodificamos a JPEG,
  // sin importar el formato original (png, heic convertido por el navegador, etc.)
  const nombreBase = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${nombreBase}.jpg`, { type: "image/jpeg" });
}
