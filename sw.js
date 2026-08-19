const CACHE_NAME = 'dxn-store-v52'; 
const assets = [
  './manifest.json', 
  './icon-192.png', 
  './icon-512.png'
];

// 1. تثبيت السيرفس وركر
self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// 2. التفعيل وتنظيف الكاش القديم الخاص بالموقع الرئيسي فقط
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // حماية كاش الأعضاء الآخرين مثل afnan-store من المسح
          if (cache !== CACHE_NAME && cache.startsWith('dxn-store')) {
            console.log('جاري حذف الكاش القديم لبلال:', cache);
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 3. جلب البيانات (الإنترنت أولاً لصفحة الموقع، والكاش للملفات الثابتة)
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
        .catch(() => {
          return caches.match(e.request);
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});
