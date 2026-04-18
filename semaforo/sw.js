// Minimal service worker — required for PWA installability on Chrome.
// Does NOT cache (we want fresh fetches for API + assets during MVP).

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch handler satisfies Chrome's installability criteria
// without intercepting network behavior.
self.addEventListener('fetch', () => {});
