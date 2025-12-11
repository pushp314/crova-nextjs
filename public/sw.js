/**
 * Service Worker for CROVA Fashion Store
 * Provides caching and offline support
 */

const CACHE_NAME = 'crova-cache-v1';
const STATIC_CACHE_NAME = 'crova-static-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/favicon.ico',
];

// Cache strategies
const CACHE_STRATEGIES = {
    staleWhileRevalidate: ['fonts.googleapis.com', 'fonts.gstatic.com'],
    cacheFirst: ['/api/categories', '/api/banners'],
    networkFirst: ['/api/products', '/api/cart', '/api/wishlist'],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // Handle different caching strategies
    if (shouldUseStaleWhileRevalidate(url)) {
        event.respondWith(staleWhileRevalidate(request));
    } else if (shouldUseCacheFirst(url)) {
        event.respondWith(cacheFirst(request));
    } else if (shouldUseNetworkFirst(url)) {
        event.respondWith(networkFirst(request));
    } else {
        // Default: network with cache fallback
        event.respondWith(networkWithCacheFallback(request));
    }
});

// Strategy implementations
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cachedResponse = await cache.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

async function networkWithCacheFallback(request) {
    try {
        return await fetch(request);
    } catch {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// Helper functions
function shouldUseStaleWhileRevalidate(url) {
    return CACHE_STRATEGIES.staleWhileRevalidate.some((domain) => url.hostname.includes(domain));
}

function shouldUseCacheFirst(url) {
    return CACHE_STRATEGIES.cacheFirst.some((path) => url.pathname.startsWith(path));
}

function shouldUseNetworkFirst(url) {
    return CACHE_STRATEGIES.networkFirst.some((path) => url.pathname.startsWith(path));
}
