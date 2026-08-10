const CACHE_NAME = 'dxn-store-v49'; 
const assets = [
  './',
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

// 2. التفعيل وتنظيف أي كاش قديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('جاري حذف الكاش القديم المنتهي:', cache);
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 3. جلب البيانات (يجيب الملفات الأساسية من الكاش والباقي فريش من النت)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
