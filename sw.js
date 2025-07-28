// Service Worker for Fernando McKenzie Portfolio
// Version: 1.0

const CACHE_NAME = "fernando-portfolio-v1.0";
const STATIC_CACHE = "static-cache-v1.0";
const DYNAMIC_CACHE = "dynamic-cache-v1.0";

// Files to cache for offline functionality (only local files to avoid CORS issues)
const STATIC_FILES = ["/", "/index.html", "/styles.css", "/script.js"];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error("Service Worker: Cache installation failed", error);
      })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip requests to external analytics and tracking
  if (
    event.request.url.includes("google-analytics.com") ||
    event.request.url.includes("googletagmanager.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", event.request.url);
        return cachedResponse;
      }

      // Fetch from network and cache dynamically
      return fetch(event.request)
        .then((networkResponse) => {
          // Check if we received a valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response (can only be consumed once)
          const responseToCache = networkResponse.clone();

          // Add to dynamic cache
          caches.open(DYNAMIC_CACHE).then((cache) => {
            // Only cache same-origin requests
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error("Service Worker: Fetch failed", error);

          // Return offline fallback for HTML pages
          if (event.request.destination === "document") {
            return caches.match("/offline.html") || caches.match("/index.html");
          }

          // Return placeholder for images
          if (event.request.destination === "image") {
            return new Response(
              '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }

          throw error;
        });
    })
  );
});

// Background sync for form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "contact-form-sync") {
    event.waitUntil(syncContactForm());
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/assets/images/icon-192x192.png",
      badge: "/assets/images/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "View Portfolio",
          icon: "/assets/images/checkmark.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/assets/images/xmark.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  try {
    if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
      event.ports[0]?.postMessage({ success: true });
    }

    if (event.data && event.data.type === "CACHE_CONTACT_FORM") {
      // Store form data for background sync
      const formData = event.data.payload;
      storeContactFormData(formData);
      event.ports[0]?.postMessage({ success: true });
    }
  } catch (error) {
    console.error("ServiceWorker message handler error:", error);
    event.ports[0]?.postMessage({ success: false, error: error.message });
  }
});

// Utility functions
async function syncContactForm() {
  try {
    const formData = await getStoredContactFormData();
    if (formData) {
      // Attempt to send the form data
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear stored data on successful send
        await clearStoredContactFormData();

        // Show success notification
        self.registration.showNotification("Contact form sent successfully!", {
          icon: "/assets/images/icon-192x192.png",
          tag: "contact-form-success",
        });
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function storeContactFormData(data) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = new Response(JSON.stringify(data));
  await cache.put("/contact-form-data", response);
}

async function getStoredContactFormData() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = await cache.match("/contact-form-data");
  return response ? response.json() : null;
}

async function clearStoredContactFormData() {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.delete("/contact-form-data");
}

// Performance monitoring
self.addEventListener("fetch", (event) => {
  // Monitor and log slow requests
  const startTime = Date.now();

  event.waitUntil(
    event.respondWith(
      fetch(event.request).then((response) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log slow requests (>2 seconds)
        if (duration > 2000) {
          console.warn(
            `Slow request detected: ${event.request.url} took ${duration}ms`
          );
        }

        return response;
      })
    )
  );
});

// Cache management - limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(itemsToDelete.map((key) => cache.delete(key)));
  }
}

// Periodically clean up dynamic cache
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE, 50);
}, 60000); // Every minute

console.log("Service Worker: Loaded successfully");
