
const CACHE_NAME = 'netlistore-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';
const IMAGE_CACHE = 'images-v3';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add uploaded images to static cache
  '/lovable-uploads/45b49ee8-3ccc-492c-9608-f089b4883e33.png',
  '/lovable-uploads/1ce6f11c-05f5-4d00-963e-d05f6337e480.png'
];

// Install event - cache static assets and product images
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(IMAGE_CACHE).then((cache) => {
        console.log('Pre-caching product images');
        // Pre-cache important product images
        const productImages = [
          'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=600&fit=crop',
          'https://i.postimg.cc/cLjxXSTM/images.jpg',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop'
        ];
        return cache.addAll(productImages.map(url => new Request(url, { mode: 'no-cors' })));
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle images with cache-first strategy
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Return a fallback image if network fails
          return new Response(
            '<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="14">Image Unavailable</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        });
      })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // For CSS/JS files, return a basic fallback
        if (request.url.includes('.css')) {
          return new Response('/* Offline fallback */', { headers: { 'Content-Type': 'text/css' } });
        }
        if (request.url.includes('.js')) {
          return new Response('console.log("Offline fallback");', { headers: { 'Content-Type': 'application/javascript' } });
        }
        // For other requests, return empty response
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when back online
  return Promise.resolve();
}

// Push notifications support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update available!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Netlistore', options)
  );
});

// Handle message events for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
