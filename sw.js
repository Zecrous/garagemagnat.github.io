/* Гаражный Магнат — Service Worker (сердце офлайна)
 * Кэширует ВСЕ файлы игры при первом запуске. Список ASSETS должен
 * включать каждый файл папки game/ — иначе что-то не загрузится без сети.
 * Проверка полноты: npm run check:assets
 */
const CACHE = 'garage-tycoon-v6';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './sw.js',
  // fonts/
  './fonts/RussoOne-Regular.ttf',
  './fonts/Manrope-Variable.ttf',
  // img/
  './img/icon-192.png',
  './img/icon-512.png',
  './img/icon-maskable-512.png',
  './img/favicon-64.png',
  // snd/
  './snd/click.wav',
  './snd/click2.wav',
  './snd/click3.wav',
  './snd/click4.wav',
  './snd/crit.wav',
  './snd/buy.wav',
  './snd/error.wav',
  './snd/levelup.wav',
  './snd/overheat.wav',
  './snd/win.wav',
];

// Установка: кладём все ASSETS в кэш
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Активация: чистим старые версии кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// Запросы: сначала кэш, потом сеть; навигация офлайн → index.html
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
    })
  );
});
