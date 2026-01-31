self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('piano-cache').then(cache =>
      cache.addAll([
        './',
        './index.html',
        './piano.js',
        './staff.js',
        './scale.js',
        './manifest.json'
      ])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});