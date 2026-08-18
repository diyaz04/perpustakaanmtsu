const CACHE_NAME = 'mts-library-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Install event - Pre-cache basic app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Serve from cache and update in background (Stale-While-Revalidate)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Bypass cache for Supabase sync API calls and non-GET requests
  if (
    requestUrl.hostname.includes('supabase.co') || 
    event.request.method !== 'GET' ||
    requestUrl.pathname.includes('/api/')
  ) {
    return; // Fetch directly from network without caching
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch new version in background and update cache (Stale-While-Revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Ignore background fetch errors (e.g. when offline)
        });
        return cachedResponse;
      }

      // If resource is not in cache, fetch from network and add to cache
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(err => {
        console.log('[SW] Fetch failed and resource not in cache:', err);
      });
    })
  );
});
