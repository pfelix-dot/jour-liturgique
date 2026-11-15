/* Mode hors ligne : on sert les fichiers depuis le cache, puis on les met à jour en arrière-plan. */
var VERSION = 'jour-liturgique-v5';
var FICHIERS = [
  './', 'index.html', 'style.css', 'app.js', 'liturgie.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(e.request, { ignoreSearch: true }).then(function (enCache) {
      var reseau = fetch(e.request).then(function (rep) {
        if (rep && rep.ok) cache.put(e.request, rep.clone());
        return rep;
      }).catch(function () { return enCache; });
      return enCache || reseau;
    });
  }));
});
