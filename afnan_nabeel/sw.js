const CACHE_NAME = 'afnan-store-v4'; 
const assets = [
  './manifest.json', 
  '../icon-192.png', 
  '../icon-512.png'
];

// 1. التثبيت والتفعيل الفوري
self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache.startsWith('afnan-store')) {
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 2. جلب البيانات (استراتيجية الشبكة أولاً Network First)
self.addEventListener('fetch', e => {
  const acceptHeader = e.request.headers.get('accept');
  if (e.request.mode === 'navigate' || (acceptHeader && acceptHeader.includes('text/html'))) {
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(response => response || fetch(e.request))
    );
  }
});
