const CACHE_NAME = "lqitha-cache-v1";

const OFFLINE_HTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لا يوجد اتصال — لقيتها</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #080810;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      padding: 1rem;
      text-align: center;
    }
    .icon {
      width: 96px; height: 96px;
      border-radius: 50%;
      background: #13131F;
      border: 1px solid rgba(196,163,90,0.2);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
    }
    svg { width: 48px; height: 48px; color: #C4A35A; stroke: #C4A35A; }
    h1 { color: #F2EFE8; font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #7A7A8C; font-size: 0.875rem; max-width: 280px; margin-bottom: 2rem; }
    button {
      background: #C4A35A; color: #080810;
      font-weight: 600; padding: 0.625rem 1.5rem;
      border-radius: 0.5rem; border: none;
      font-size: 0.875rem; cursor: pointer;
    }
    .hint { color: rgba(122,122,140,0.5); font-size: 0.75rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="icon">
    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M3 3l18 18M8.111 8.111A5.97 5.97 0 006 12a6 6 0 006 6c1.5 0 2.874-.553 3.919-1.461M10.584 5.659A6.001 6.001 0 0118 12a5.97 5.97 0 01-.948 3.248M12 3c4.97 0 9 4.03 9 9a9 9 0 01-1.04 4.21"/>
    </svg>
  </div>
  <h1>No Internet Connection</h1>
  <p>Please check your internet connection and try again.</p>
  <button onclick="window.location.reload()">Retry</button>
</body>
</html>`;

const STATIC_ASSETS = [
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon.ico',
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.put(
                new Request("/offline"),
                new Response(OFFLINE_HTML, {
                    headers: { "content-type": "text/html; charset=UTF-8" },
                })
            );
            await Promise.allSettled(
                STATIC_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('Failed to cache:', url, err)
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    )
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    if (
        event.request.method !== "GET" ||
        event.request.url.includes("/api/") ||
        event.request.url.includes("pusher") ||
        event.request.url.includes("stream-io") ||
        event.request.url.includes("cloudinary")
    ) {
        return;
    }

    // Navigation requests (HTML pages)
    if (event.request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    console.log('[SW] Fetching:', event.request.url);
                    const response = await fetch(event.request);
                    console.log('[SW] Response ok:', response.ok, response.status);

                    if (response.ok) {
                        const clone = response.clone();
                        const cache = await caches.open(CACHE_NAME);
                        await cache.put(event.request, clone);
                        console.log('[SW] Cached:', event.request.url);
                    }
                    return response;
                } catch (err) {
                    console.log('[SW] Fetch failed:', err);
                    const cached = await caches.match(event.request);
                    return cached || caches.match('/offline');
                }
            })()
        );
        return;
    }

    // Static assets - Cache first
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // نحفظ فقط static assets
                if (
                    event.request.url.includes("/_next/static/") ||
                    event.request.url.includes("/android-chrome") ||
                    event.request.url.includes("/favicon")
                ) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});

self.addEventListener("push", function (event) {
    if (!event.data) return;

    // Only show notification if permission is granted
    if (Notification.permission !== "granted") {
        console.log("Notification permission not granted, skipping notification display");
        return;
    }

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            vibrate: [100, 50, 100],
            data: { url: data.url || "/" },
            dir: 'rtl',
            lang: 'ar',
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            const url = event.notification.data.url
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) return client.focus()
            }
            if (clients.openWindow) return clients.openWindow(url)
        })
    )
});
