// Service Worker for GlucoBalance PWA - Performance Optimized
const CACHE_NAME = 'glucobalance-v1.3';
const STATIC_CACHE = 'glucobalance-static-v1.3';
const DYNAMIC_CACHE = 'glucobalance-dynamic-v1.3';
const IMAGE_CACHE = 'glucobalance-images-v1.3';
const PERFORMANCE_CACHE = 'glucobalance-performance-v1.3';

const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/components.css',
  '/js/app.js',
  '/js/database.js',
  '/js/error-handler.js',
  '/js/auth.js',
  '/js/performance-monitor.js',
  '/js/asset-optimizer.js',
  '/js/module-loader.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Performance-critical resources that should be cached immediately
const PERFORMANCE_CRITICAL = [
  '/js/performance-monitor.js',
  '/js/asset-optimizer.js',
  '/js/module-loader.js'
];

// Lazy-loaded modules that can be cached on demand
const LAZY_MODULES = [
  '/js/ai.js',
  '/js/auth-ui.js',
  '/js/risk-assessment.js',
  '/js/nutrition-service.js',
  '/js/nutrition-ui.js',
  '/js/mental-health.js',
  '/js/mental-health-ui.js',
  '/js/progress-dashboard.js',
  '/js/pdf-export.js',
  '/js/doctor-report.js',
  '/js/doctor-report-ui.js',
  '/js/notification-service.js',
  '/js/notification-ui.js'
];

// Critical resources for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/database.js',
  '/manifest.json'
];

// Install event - cache static assets with performance optimization
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  const startTime = performance.now();
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources first
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching critical static assets');
        return cache.addAll(urlsToCache);
      }),
      // Cache performance-critical resources
      caches.open(PERFORMANCE_CACHE).then(cache => {
        console.log('Caching performance-critical resources');
        return cache.addAll(PERFORMANCE_CRITICAL);
      })
    ]).then(() => {
      const installTime = performance.now() - startTime;
      console.log(`Service Worker installed in ${installTime.toFixed(2)}ms`);
      
      // Track installation performance
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_INSTALL_PERFORMANCE',
            installTime,
            cachedResources: urlsToCache.length + PERFORMANCE_CRITICAL.length
          });
        });
      });
    }).catch(error => {
      console.error('Failed to cache static assets:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch event with mobile-first strategies and improved offline support
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Enhanced caching strategies for essential app features
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  }
  // Critical resources - cache first with stale-while-revalidate for performance
  else if (CRITICAL_RESOURCES.some(resource => request.url.endsWith(resource))) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
  // Static assets - cache first with background update
  else if (urlsToCache.some(cachedUrl => request.url.includes(cachedUrl))) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
  // API calls - network first with intelligent fallback and caching
  else if (url.pathname.includes('/api/') || url.hostname.includes('gemini') || url.hostname.includes('googleapis')) {
    event.respondWith(networkFirstWithIntelligentFallback(request));
  }
  // Navigation requests - network first with offline shell
  else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationWithOfflineShell(request));
  }
  // Other requests - network first with cache fallback
  else {
    event.respondWith(networkFirstWithCache(request));
  }
});

// Enhanced caching strategies for essential app features with improved offline support
async function staleWhileRevalidate(request, cacheName = STATIC_CACHE) {
  try {
    const cachedResponse = await caches.match(request);
    
    // Always try to fetch from network in background with enhanced error handling
    const networkResponsePromise = fetch(request, {
      // Add timeout and retry logic for better reliability
      signal: AbortSignal.timeout(10000) // 10 second timeout
    }).then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then(c => {
          // Add enhanced headers for better cache management
          const responseToCache = response.clone();
          const headers = new Headers(responseToCache.headers);
          headers.set('sw-cached-at', Date.now().toString());
          headers.set('sw-cache-strategy', 'stale-while-revalidate');
          headers.set('sw-request-url', request.url);
          
          const modifiedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          c.put(request, modifiedResponse);
        });
      }
      return response;
    }).catch(error => {
      console.log('Network request failed in stale-while-revalidate:', error.name);
      return null;
    });

    // Return cached version immediately if available with enhanced headers
    if (cachedResponse) {
      // Add offline mode indicators
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-served-from-cache', 'true');
      headers.set('x-cache-strategy', 'stale-while-revalidate');
      
      const enhancedResponse = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
      
      // Update cache in background
      networkResponsePromise;
      return enhancedResponse;
    }

    // If no cache, wait for network with timeout
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }

    // Enhanced fallback for essential resources with better user guidance
    return new Response(JSON.stringify({
      error: 'Resource unavailable offline',
      message: 'This content is not available while offline. Please check your connection and try again.',
      offlineMode: true,
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page when online',
        'Use available offline features'
      ],
      timestamp: new Date().toISOString()
    }), { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 
        'Content-Type': 'application/json',
        'x-offline-fallback': 'true'
      }
    });
  } catch (error) {
    console.error('Stale while revalidate strategy failed:', error);
    return new Response(JSON.stringify({
      error: 'Cache strategy failed',
      message: 'Unable to serve content due to caching error.',
      offlineMode: true,
      timestamp: new Date().toISOString()
    }), { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - content not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    return new Response('Offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function networkFirstWithIntelligentFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful API responses with intelligent TTL
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp and content-type specific headers
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      headers.set('sw-cache-strategy', 'network-first');
      
      // Set different TTL based on content type
      const contentType = headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        headers.set('sw-ttl', (24 * 60 * 60 * 1000).toString()); // 24 hours for JSON
      } else {
        headers.set('sw-ttl', (7 * 24 * 60 * 60 * 1000).toString()); // 7 days for other content
      }
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
      
      // Cache AI responses in IndexedDB for better offline support
      if (request.url.includes('gemini') || request.url.includes('ai')) {
        const responseData = await networkResponse.clone().json();
        await cacheAIResponse(request.url, responseData);
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('API request failed, using intelligent fallback:', error);
    
    // Try to get from cache with intelligent expiration
    const cachedResponse = await getCachedResponseWithIntelligentExpiration(request);
    if (cachedResponse) {
      // Add comprehensive offline indicator headers
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-served-from-cache', 'true');
      headers.set('x-offline-mode', 'true');
      headers.set('x-cache-age', (Date.now() - parseInt(cachedResponse.headers.get('sw-cached-at') || '0')).toString());
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }

    // Enhanced AI fallback with cached responses
    if (request.url.includes('gemini') || request.url.includes('ai')) {
      const cachedAIResponse = await getCachedAIResponse(request.url);
      if (cachedAIResponse) {
        return new Response(JSON.stringify(cachedAIResponse), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'x-served-from-cache': 'true',
            'x-ai-fallback': 'true',
            'x-offline-mode': 'true'
          }
        });
      }
      
      // Return contextual AI fallback response
      const fallbackResponse = await generateContextualAIFallback(request);
      return new Response(JSON.stringify(fallbackResponse), {
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'x-ai-fallback': 'true',
          'x-offline-mode': 'true'
        }
      });
    }

    // Enhanced generic offline fallback with user guidance
    return new Response(JSON.stringify({
      error: 'Service unavailable',
      offline: true,
      message: 'You are currently offline. Your data is safely stored locally and will sync automatically when connection is restored.',
      timestamp: new Date().toISOString(),
      capabilities: {
        available: [
          'View previous assessments',
          'Log mood entries', 
          'View nutrition plans',
          'Access progress dashboard'
        ],
        unavailable: [
          'AI-powered insights',
          'Generate new meal plans',
          'Doctor report generation',
          'Real-time data synchronization'
        ]
      },
      actions: [
        'Continue using available features',
        'Your data will sync when online',
        'Check offline status in the app'
      ]
    }), {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'x-offline-mode': 'true'
      }
    });
  }
}

async function networkFirstWithFallback(request) {
  return networkFirstWithIntelligentFallback(request);
}

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // Attempt to sync with server
      for (const data of offlineData) {
        try {
          await syncDataItem(data);
          await markDataAsSynced(data.id);
        } catch (error) {
          console.error('Failed to sync data item:', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Mobile-optimized caching strategies
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      // Only cache images smaller than 1MB for mobile optimization
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 1024 * 1024) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Image request failed:', error);
    // Return a placeholder image or cached version
    return caches.match('/icons/placeholder.png') || new Response('', { status: 404 });
  }
}

async function handleNavigationWithOfflineShell(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation request failed, serving offline shell:', error);
    
    // Serve the main app shell for offline navigation
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      // Add offline mode headers to help the app detect offline state
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-offline-mode', 'true');
      headers.set('x-served-from-cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GlucoBalance - Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
          .offline-message { max-width: 400px; margin: 0 auto; }
          .retry-btn { background: #007FFF; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="offline-message">
          <h1>You're Offline</h1>
          <p>GlucoBalance is not available right now. Please check your connection and try again.</p>
          <button class="retry-btn" onclick="location.reload()">Retry</button>
        </div>
      </body>
      </html>
    `, { 
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add cache headers
      const headers = new Headers(cachedResponse.headers);
      headers.set('x-served-from-cache', 'true');
      headers.set('x-offline-mode', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function handleNavigationRequest(request) {
  return handleNavigationWithOfflineShell(request);
}

// Enhanced data sync functions with improved offline support and better error handling
async function getOfflineData() {
  try {
    // Check for offline data in IndexedDB with enhanced error handling
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    
    // Add timeout handling for database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timeout')), 5000);
    });
    
    const dataPromise = new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const data = request.result || [];
        // Filter out expired or invalid operations
        const validData = data.filter(item => {
          const age = Date.now() - new Date(item.timestamp).getTime();
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          return age < maxAge && item.operation && item.table;
        });
        resolve(validData);
      };
      request.onerror = () => resolve([]);
    });
    
    return await Promise.race([dataPromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to get offline data:', error);
    // Fallback to localStorage if IndexedDB fails
    try {
      const fallbackData = localStorage.getItem('glucobalance-offline-queue');
      return fallbackData ? JSON.parse(fallbackData) : [];
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
      return [];
    }
  }
}

async function syncDataItem(data) {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('Successfully synced data item:', data.id);
      return true;
    }
    throw new Error(`Sync failed with status: ${response.status}`);
  } catch (error) {
    console.error('Failed to sync data item:', error);
    return false;
  }
}

async function markDataAsSynced(id) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    await store.delete(id);
    console.log('Marked as synced and removed:', id);
  } catch (error) {
    console.error('Failed to mark data as synced:', error);
  }
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GlucoBalanceOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Offline queue store
      if (!db.objectStoreNames.contains('offlineQueue')) {
        const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('timestamp', 'timestamp');
        queueStore.createIndex('operation', 'operation');
        queueStore.createIndex('table', 'table');
      }
      
      // Cached responses store
      if (!db.objectStoreNames.contains('cachedResponses')) {
        const cacheStore = db.createObjectStore('cachedResponses', { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp');
        cacheStore.createIndex('type', 'type');
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New health reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('GlucoBalance', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Enhanced caching helper functions
async function getCachedResponseWithIntelligentExpiration(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (!cachedResponse) return null;
    
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    const ttl = cachedResponse.headers.get('sw-ttl');
    
    if (cachedAt && ttl) {
      const age = Date.now() - parseInt(cachedAt);
      const maxAge = parseInt(ttl);
      
      if (age > maxAge) {
        // Cache expired, remove it
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.delete(request);
        return null;
      }
    }
    
    return cachedResponse;
  } catch (error) {
    console.error('Error checking cached response with intelligent expiration:', error);
    return null;
  }
}

async function getCachedResponseWithExpiration(request, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
  try {
    const cachedResponse = await caches.match(request);
    if (!cachedResponse) return null;
    
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    if (cachedAt) {
      const age = Date.now() - parseInt(cachedAt);
      if (age > maxAge) {
        // Cache expired, remove it
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.delete(request);
        return null;
      }
    }
    
    return cachedResponse;
  } catch (error) {
    console.error('Error checking cached response:', error);
    return null;
  }
}

async function generateContextualAIFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Generate contextual fallback based on the AI endpoint
  if (pathname.includes('risk') || pathname.includes('assessment')) {
    return {
      error: 'AI risk analysis unavailable',
      fallback: true,
      message: 'AI-powered risk insights are temporarily unavailable while offline.',
      suggestions: [
        'Your risk assessment has been saved locally',
        'Review your previous risk assessments',
        'Continue logging health data for future analysis',
        'AI insights will be available when you\'re back online'
      ],
      offlineCapabilities: [
        'View assessment history',
        'Complete new assessments',
        'Access saved recommendations'
      ]
    };
  } else if (pathname.includes('nutrition') || pathname.includes('meal')) {
    return {
      error: 'AI nutrition planning unavailable',
      fallback: true,
      message: 'AI-powered meal planning is temporarily unavailable while offline.',
      suggestions: [
        'View your existing meal plans',
        'Log meal adherence for current plans',
        'Review nutrition guidelines',
        'New AI meal plans will be available when online'
      ],
      offlineCapabilities: [
        'View saved meal plans',
        'Track meal adherence',
        'Access nutrition tips'
      ]
    };
  } else if (pathname.includes('mood') || pathname.includes('mental')) {
    return {
      error: 'AI mental health support unavailable',
      fallback: true,
      message: 'AI-powered mental health insights are temporarily unavailable while offline.',
      suggestions: [
        'Continue logging your daily mood',
        'Review your mood history and patterns',
        'Practice self-care techniques',
        'AI support will resume when you\'re back online'
      ],
      offlineCapabilities: [
        'Log daily mood',
        'View mood trends',
        'Access coping strategies'
      ]
    };
  } else {
    return {
      error: 'AI service unavailable',
      fallback: true,
      message: 'AI insights are temporarily unavailable while offline.',
      suggestions: [
        'Continue using available app features',
        'Your data is safely stored locally',
        'AI features will resume when connection is restored'
      ],
      offlineCapabilities: [
        'View previous data',
        'Log new entries',
        'Access saved content'
      ]
    };
  }
}

async function getCachedAIResponse(url) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['cachedResponses'], 'readonly');
    const store = transaction.objectStore('cachedResponses');
    
    // Create a key from the URL
    const key = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
    const request = store.get(key);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && new Date(result.expiresAt) > new Date()) {
          resolve(result.response);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error getting cached AI response:', error);
    return null;
  }
}

async function cacheAIResponse(url, response) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['cachedResponses'], 'readwrite');
    const store = transaction.objectStore('cachedResponses');
    
    const key = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
    const cacheItem = {
      key,
      response,
      type: 'ai-response',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours
    };
    
    store.put(cacheItem);
  } catch (error) {
    console.error('Error caching AI response:', error);
  }
}

// Enhanced offline data management
async function queueOfflineOperation(operation, table, data, recordId = null) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    const queueItem = {
      operation,
      table,
      data,
      recordId,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    };
    
    store.add(queueItem);
    
    // Notify main thread about queued operation
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_OPERATION_QUEUED',
        operation: queueItem
      });
    });
    
  } catch (error) {
    console.error('Failed to queue offline operation:', error);
  }
}

// Periodic cache cleanup
async function cleanupExpiredCache() {
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('dynamic') || cacheName.includes('images')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          const cachedAt = response.headers.get('sw-cached-at');
          
          if (cachedAt) {
            const age = Date.now() - parseInt(cachedAt);
            const maxAge = cacheName.includes('images') ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days for images, 1 day for others
            
            if (age > maxAge) {
              await cache.delete(request);
              console.log('Cleaned up expired cache entry:', request.url);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Run cache cleanup periodically
setInterval(cleanupExpiredCache, 60 * 60 * 1000); // Every hour

// Message handling for communication with main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CACHE_AI_RESPONSE':
      cacheAIResponse(data.url, data.response);
      break;
    case 'QUEUE_OFFLINE_OPERATION':
      queueOfflineOperation(data.operation, data.table, data.data, data.recordId);
      break;
    case 'CLEANUP_CACHE':
      cleanupExpiredCache();
      break;
  }
});

// Error reporting
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});