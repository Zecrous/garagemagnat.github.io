const CACHE_NAME = 'garage-tycoon-game-v1';
const ASSETS = [
  "./",
  "./fonts/body-regular.ttf",
  "./fonts/display-bold.ttf",
  "./game.js",
  "./img/favicon.svg",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/noise.svg",
  "./index.html",
  "./manifest.json",
  "./snd/buy.wav",
  "./snd/click.wav",
  "./snd/crit.wav",
  "./snd/levelup.wav",
  "./snd/overheat.wav",
  "./snd/win.wav",
  "./style.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          if (req.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});
