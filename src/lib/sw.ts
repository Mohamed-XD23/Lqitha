"use client";

let cachedRegistration: Promise<ServiceWorkerRegistration> | null = null;

export function getCachedSW(): Promise<ServiceWorkerRegistration> {
  if (!cachedRegistration) {
    cachedRegistration = (async () => {
      const start = performance.now();
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const reg = await navigator.serviceWorker.ready;
      const duration = Math.round(performance.now() - start);
      // eslint-disable-next-line no-console
      console.debug(`[sw] service worker ready (${duration}ms)`);
      return reg;
    })();
  }

  return cachedRegistration;
}

export function preRegisterSW() {
  // Kick off registration but don't block
  if (typeof window === 'undefined') return;
  void getCachedSW().catch((err) => {
    // eslint-disable-next-line no-console
    console.debug('[sw] pre-register failed', err);
  });
}
