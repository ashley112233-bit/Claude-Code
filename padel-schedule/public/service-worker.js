// Padel Schedule — service worker
// Caches the app shell so it opens instantly and works installed to the
// Home Screen. Match data (/api/*) is always fetched live, never cached.

const CACHE = 'padel-schedule-v1';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache live data or the auth flow — always hit the network.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/oauth2callback')) {
    return; // let the browser handle it normally
  }

  // App shell: serve from cache first, fall back to network.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
