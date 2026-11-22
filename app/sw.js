/* KoʻzMadad AI — oflayn kesh */
var VERSION = "kozmadad-v2";
var SHELL = ["./", "index.html", "app.css", "app.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return c.addAll(SHELL.concat(["audio/phrases.json"])).then(function () {
      // Barcha ovozli iboralarni oldindan saqlab qoʻyish (internetsiz ishlashi uchun)
      return fetch("audio/phrases.json").then(function (r) { return r.json(); }).then(function (j) {
        return c.addAll(Object.keys(j).map(function (id) { return "audio/" + id + ".mp3"; }));
      }).catch(function () {});
    });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var isLib = url.origin === location.origin && (url.pathname.indexOf("/lib/") !== -1 || url.pathname.indexOf("/audio/") !== -1);
  if (isLib) {
    // SI modellari va kutubxonalar: avval kesh (bir marta yuklanadi, keyin internetsiz ishlaydi)
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      });
    }));
  } else if (url.origin === location.origin) {
    // Ilova fayllari: avval tarmoq, boʻlmasa kesh
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req, { ignoreSearch: true }); }));

  }
});
