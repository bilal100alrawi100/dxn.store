const CACHE_NAME = 'dxn-store-v51'; 
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

// 2. التفعيل وتنظيف أي كاش قديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('جاري حذف الكاش القديم:', cache);
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// 3. جلب البيانات (الإنترنت أولاً لصفحة الموقع، والكاش للملفات الثابتة)
self.addEventListener('fetch', e => {
  // إذا كان الطلب فتح صفحة الـ HTML الرئيسية للموقع
  if (e.request.mode === 'navigate' || e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          // تحديث الكاش بالنسخة الجديدة فوراً من GitHub
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // إذا كان المستخدم أوفلاين (بدون إنترنت)، افتح الصفحة المخزنة سابقاً
          return caches.match(e.request);
        })
    );
  } else {
    // باقي عناصر التطبيق (الأيقونات والمانفيست) تُقرأ من الكاش لتسريع التطبيق
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});
