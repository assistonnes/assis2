// sw.js - fully offline-ready for Assistonnes Piano
const CACHE_NAME = 'assis2-piano-v1';
const FILES_TO_CACHE = [
  '/index.html',
  '/piano.js',
  '/staff.js',
  '/scale.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache all essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing and caching files...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache first
self.addEventListener('fetch', (event) => {
  // Handle page navigation (user typing / reloading)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        return cached || fetch('/index.html');
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle other requests (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});