// Minimal service worker — required for PWA installability on Android.
// Network-first so the app always tries fresh Drive data; cache only the shell.
const SHELL = "tasks-shell-v4";
const ASSETS = ["./index.html", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Never cache Google API / auth calls — always go to network for live data + tokens.
  if (url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("google.com")) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
