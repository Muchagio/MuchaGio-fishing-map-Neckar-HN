/* MuchaGio Fishing Maps — Service Worker
 *
 * Strategy:
 *  - App shell + same-origin assets/data: stale-while-revalidate
 *    (instant load, refreshes in background, works offline after first visit).
 *  - Map tiles (Esri / OSM): network-first with cache fallback and a size
 *    cap — this is the foundation for the "Offline Maps" roadmap item:
 *    every tile you view online becomes available offline.
 *  - Cross-origin libraries (Leaflet CDN): cache-first.
 *
 * Bump CACHE_VERSION on release to invalidate old caches.
 */
'use strict';

const CACHE_VERSION = 'v2.3.0';
const STATIC_CACHE = `muchagio-static-${CACHE_VERSION}`;
const TILE_CACHE = `muchagio-tiles-${CACHE_VERSION}`;
const TILE_CACHE_LIMIT = 600;

// Minimal shell precached on install so the very first offline launch works.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/tokens.css',
  './styles/app.css',
  './src/main.js',
  './data/registry.json',
];

const TILE_HOSTS = ['arcgisonline.com', 'tile.openstreetmap.org'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== TILE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isTileRequest(url) {
  return TILE_HOSTS.some((host) => url.hostname.includes(host));
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  // FIFO eviction of the oldest entries.
  await Promise.all(keys.slice(0, keys.length - maxItems).map((k) => cache.delete(k)));
}

async function networkFirstTile(request) {
  const cache = await caches.open(TILE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      trimCache(TILE_CACHE, TILE_CACHE_LIMIT);
    }
    return response;
  } catch (_) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('Tile nicht verfügbar (offline)');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type !== 'opaque') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || network || fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (isTileRequest(url)) {
    event.respondWith(networkFirstTile(request));
    return;
  }

  // Navigation requests fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      staleWhileRevalidate(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
