/* Frontend/public/sw.js */

const VERSION = "v1";
const TILE_CACHE = `tiles-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

// Cache tile requests (OSM) with Cache-First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res && res.ok) {
    cache.put(request, res.clone());
  }
  return res;
}

// Cache API with Network-First (fallback to cache)
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      cache.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) Map tiles (OpenStreetMap)
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(cacheFirst(req, TILE_CACHE));
    return;
  }

  // 2) Items API (your app: API_URL = `${API_BASE_URL}/api`)
  // This catches: /api/items/ , /api/items/123/ , /api/items/my_items/ , ...
  if (url.pathname.includes("/api/items")) {
    event.respondWith(networkFirst(req, API_CACHE));
    return;
  }

  // otherwise: default fetch
});