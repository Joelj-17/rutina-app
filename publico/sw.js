/* Service worker de la app Rutina.
   Estrategia: red primero para el HTML (así ves los cambios al desplegar),
   caché primero para iconos y manifiesto. Todo sigue funcionando sin conexión. */

/* Al cambiar este nombre, al activarse se borran las cachés anteriores.
   Súbelo cuando un despliegue tenga que llegar sí o sí a los dispositivos. */
const CACHE = "rutina-v3";
const BASE = new URL("./", self.location).pathname;
const ESENCIALES = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ESENCIALES))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Una respuesta solo se guarda si es del propio sitio y ha ido bien. Guardar un
   error es peor que no guardar nada: se sirve luego como si fuera la app. */
const guardable = r => r && r.ok && r.status === 200 && r.type === "basic";

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* La sincronización NUNCA se guarda en caché, ni se responde desde ella.
     Una respuesta vieja aquí no es una molestia: significa creerse que la nube
     está vacía cuando no lo está, y a partir de ahí el dispositivo sube su
     vacío encima de lo bueno. Es exactamente lo que pasó el 6 de agosto de
     2026. Si no hay conexión, que falle y se vea, que para eso están los datos
     guardados en el propio aparato. */
  if (url.pathname.indexOf("/api/") === 0) return;

  const esPagina = req.mode === "navigate" ||
                   (req.headers.get("accept") || "").includes("text/html");

  if (esPagina) {
    // Red primero: si hay conexión ves la última versión; si no, tira de caché.
    e.respondWith(
      fetch(req)
        .then(r => {
          /* Solo se guarda una respuesta BUENA. Sin esta comprobacion, un 500
             del hosting durante un despliegue —o el 502 de un portal cautivo,
             como el wifi de un gimnasio— sustituia la copia offline de la app
             por la pagina de error, y luego, sin cobertura, eso era lo que se
             pintaba: la app no arrancaba hasta que volviera la red. */
          if (guardable(r)) {
            const copia = r.clone();
            caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
          }
          return r;
        })
        .catch(() => caches.match(req).then(r => r || caches.match(BASE + "index.html")))
    );
    return;
  }

  // Resto (iconos, manifiesto): caché primero.
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      if (guardable(resp)) {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
      }
      return resp;
    }))
  );
});
