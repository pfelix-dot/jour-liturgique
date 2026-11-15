/*
 * Mode hors ligne.
 * Réseau d'abord : avec une connexion, on prend toujours la dernière version publiée
 * (tous les fichiers de la même version, sans mélange). Sans connexion, ou si le réseau
 * ne répond pas en 4 secondes, on sert la copie gardée sur le téléphone.
 * Changer VERSION à chaque mise à jour.
 */
var VERSION = 'jour-liturgique-v8';
var FICHIERS = [
  './', 'index.html', 'style.css', 'app.js', 'liturgie.js', 'explications.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];
var DELAI_RESEAU = 4000;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return c.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(caches.open(VERSION).then(function (cache) {
    var depuisCache = function () {
      return cache.match(req, { ignoreSearch: true }).then(function (r) {
        return r || (req.mode === 'navigate' ? cache.match('index.html') : undefined);
      });
    };
    var reseau = fetch(req, { cache: 'no-cache' }).then(function (rep) {
      if (rep && rep.ok) cache.put(req, rep.clone());
      return rep;
    });
    var delai = new Promise(function (ok) { setTimeout(ok, DELAI_RESEAU); }).then(depuisCache);

    return Promise.race([reseau, delai])
      .then(function (r) { return r || reseau; })
      .catch(function () { return depuisCache().then(function (r) { return r || Response.error(); }); });
  }));
});
