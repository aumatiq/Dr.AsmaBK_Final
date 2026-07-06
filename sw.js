/* ═══════════════════════════════════════════════════════════
   SkyBlue Clinic — Service Worker
   AUMATIQ PWA Layer v1.0
   ───────────────────────────────────────────────────────────
   কী করে:
   1. App shell (HTML/CSS/JS/icons) cache করে রাখে → offline এও app খোলে
   2. Google Apps Script backend call (data fetch/save) সবসময়
      NETWORK FIRST — কারণ patient data সবসময় fresh থাকা লাগবে,
      কখনো stale/cached data দেখানো যাবে না
   3. Old cache version গুলো automatically clean করে
   ═══════════════════════════════════════════════════════════ */

// ⚠️ প্রতিবার নতুন version deploy করলে এই নাম্বার বাড়াও (v1 → v2 → v3)
// তাহলেই সব user-এর পুরনো cache clear হয়ে নতুন ভার্সন লোড হবে
const CACHE_VERSION = 'skyblue-clinic-v1';

// App shell — এই ফাইলগুলো সবসময় cache থাকবে, offline এও লোড হবে
// ⚠️ যদি তোমার index.html আলাদা style.css / script.js ফাইল ব্যবহার করে,
//    সেগুলোর নাম এখানে যোগ করে দাও
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

/* ── INSTALL: app shell cache করা ── */
self.addEventListener('install', function (event) {
  self.skipWaiting(); // নতুন service worker সাথে সাথে active হবে
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function (err) {
        console.warn('[SW] কিছু ফাইল cache করা যায়নি (ঠিক আছে, বাকিগুলো হবে):', err);
      });
    })
  );
});

/* ── ACTIVATE: পুরনো cache version মুছে ফেলা ── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* ── FETCH: request handle করা ──
   Logic:
   - Google Apps Script API call (script.google.com) → সবসময় NETWORK FIRST
     (patient/appointment data কখনো stale দেখানো যাবে না)
   - বাকি সব static file (HTML/CSS/JS/images) → CACHE FIRST, network fallback
*/
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // শুধু GET request handle করব — POST (data save) কখনো cache করব না
  if (event.request.method !== 'GET') {
    return;
  }

  // ── Google Apps Script backend calls → Network First ──
  var isBackendCall =
    url.indexOf('script.google.com') !== -1 ||
    url.indexOf('script.googleusercontent.com') !== -1;

  if (isBackendCall) {
    event.respondWith(
      fetch(event.request).catch(function () {
        return new Response(
          JSON.stringify({
            error: true,
            message: 'Offline — ইন্টারনেট কানেকশন চেক করুন।'
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // ── Static assets → Cache First, fallback to network ──
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(function (networkResponse) {
          // সফল response হলে cache-এ save করে রাখো পরের বার offline এর জন্য
          if (networkResponse && networkResponse.status === 200) {
            var responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          // সম্পূর্ণ offline এবং cache-এও নেই → offline page দেখাও
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
