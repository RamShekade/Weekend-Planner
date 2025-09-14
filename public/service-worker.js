const CACHE_NAME = 'beach-planner-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // add your built JS/CSS/assets paths here
];

// Install: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Fetch: serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});