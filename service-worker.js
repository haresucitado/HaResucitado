const CACHE_NAME = 'haresucitado';
const OFFLINE_URL = '/index.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/512-icon.png',
  '/192-icon.png',
  '/32x32-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(resp => {
        caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
        return resp;
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached =>
      cached ||
      fetch(request).catch(() => {
        if (request.destination === 'image') return caches.match('/512-icon.png');
      })
    )
  );
});



