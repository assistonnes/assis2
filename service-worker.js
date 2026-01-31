// sw.js - Offline-ready PWA for Assistonnes Piano

const CACHE_NAME = 'assis-piano-v1';
const OFFLINE_PAGE = '/index.html'; // main entry

// Files to cache
const FILES_TO_CACHE = [
  '/index.html',
  '/piano.js',
  '/staff.js',
  '/scale.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Install - cache everything
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app files...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// Fetch - serve cached files first, fallback to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Found in cache
        return cachedResponse;
      }
      // Not in cache: try network
      return fetch(event.request).catch(() => {
        // Network failed, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
      });
    })
  );
});