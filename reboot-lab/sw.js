// ReBoot Lab — Service Worker
// Network-first for HTML (frescura), cache-first for static assets.

const CACHE_VERSION = 'reboot-lab-v1-2026-04-20';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE = [
  './',
  './index.html',
  './dashboard.html',
  './semana.html',
  './meal-plan.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo manejamos requests del mismo origen
  if (url.origin !== self.location.origin) return;

  // HTML: network-first, cache fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Imágenes, JSON, otros: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp.ok && req.method === 'GET') {
          const copy = resp.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      });
    })
  );
});
