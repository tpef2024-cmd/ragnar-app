// ── SERVICE WORKER — RAGNAR CROSS TRAINING ───────────────────────────────────
// Versión del caché — incrementar para forzar actualización
const VERSION_CACHE = "ragnar-v1";

// Archivos que se cachean al instalar
const ARCHIVOS_CACHE = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/App.css",
  "/src/index.css",
];

// Instalación: cachear archivos esenciales
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION_CACHE).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar cachés viejos
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== VERSION_CACHE)
          .map((clave) => caches.delete(clave))
      )
    )
  );
  self.clients.claim();
});

// Fetch: servir desde caché si está disponible, si no desde red
self.addEventListener("fetch", (evento) => {
  // No cachear llamadas a Supabase — siempre ir a la red
  if (evento.request.url.includes("supabase.co")) return;

  evento.respondWith(
    caches.match(evento.request).then((respuestaCacheada) => {
      if (respuestaCacheada) return respuestaCacheada;
      return fetch(evento.request).catch(() => {
        // Si no hay red y no hay caché, mostrar página offline básica
        if (evento.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
