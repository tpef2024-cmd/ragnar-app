// ── SERVICE WORKER — RAGNAR CROSS TRAINING ───────────────────────────────────
// Versión del caché — incrementar para forzar actualización
const VERSION_CACHE = "ragnar-v3";

// Archivos que se cachean al instalar (solo imágenes fijas: el HTML y el JS
// NO se precachean, ver estrategia de fetch abajo)
const ARCHIVOS_CACHE = [
  "/logo-icon.png",
  "/logo-ragnar.png",
  "/icon-192.png",
  "/icon-512.png",
];

// Instalación: cachear archivos esenciales
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION_CACHE).then((cache) => cache.addAll(ARCHIVOS_CACHE)),
  );
  self.skipWaiting();
});

// Activación: limpiar cachés viejos (incluye el "ragnar-v2" anterior, que
// guardaba el index.html y causaba pantallas negras tras cada deploy)
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== VERSION_CACHE)
            .map((clave) => caches.delete(clave)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch:
//  - Páginas (index.html / navegación): SIEMPRE primero la red, así cada
//    deploy nuevo se ve al instante. El caché queda solo como respaldo si no
//    hay conexión.
//  - /assets/* (JS y CSS con hash en el nombre, nunca cambian) e imágenes:
//    primero el caché, que es seguro porque un deploy nuevo usa nombres nuevos.
//  - Todo lo demás (Supabase, otros dominios, POST, etc.): directo a la red,
//    sin pasar por el service worker.
self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    evento.respondWith(
      fetch(req)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(VERSION_CACHE).then((c) => c.put("/index.html", copia));
          }
          return respuesta;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  const esEstatico =
    url.pathname.startsWith("/assets/") || /\.(png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname);
  if (!esEstatico) return;

  evento.respondWith(
    caches.match(req).then(
      (cacheada) =>
        cacheada ||
        fetch(req).then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(VERSION_CACHE).then((c) => c.put(req, copia));
          }
          return respuesta;
        }),
    ),
  );
});
