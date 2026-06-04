"use client";

import { useEffect, useState } from "react";
import { Download, X, Bell } from "lucide-react";
import {
  sendTestPushNotificationToDevice,
  subscribeUser,
} from "@/actions/push.actions";
import { getCachedSW } from "@/lib/sw";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

interface InstallPromptProps {
  isAuthenticated?: boolean;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function arrayBufferEquals(left: ArrayBuffer | null, right: Uint8Array) {
  if (!left || left.byteLength !== right.byteLength) return false;

  const leftBytes = new Uint8Array(left);

  for (let i = 0; i < leftBytes.length; i += 1) {
    if (leftBytes[i] !== right[i]) return false;
  }

  return true;
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported on this device.");
  }

  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  return navigator.serviceWorker.ready;
}

async function persistPushSubscription(subscription: PushSubscription) {
  const serialized = JSON.parse(JSON.stringify(subscription));
  const result = await subscribeUser(serialized);

  if (!result.success) {
    throw new Error(result.error || "Failed to save push subscription.");
  }
}

async function savePushSubscription(reg: ServiceWorkerRegistration) {
  const applicationServerKey = urlBase64ToUint8Array(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  );
  let existingSubscription = await reg.pushManager.getSubscription();

  if (
    existingSubscription &&
    !arrayBufferEquals(
      existingSubscription.options.applicationServerKey,
      applicationServerKey,
    )
  ) {
    await existingSubscription.unsubscribe();
    existingSubscription = null;
  }

  const subscription =
    existingSubscription ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));

  await persistPushSubscription(subscription);
  return subscription;
}

async function isBraveBrowser() {
  const brave = (
    navigator as Navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    }
  ).brave;

  return Boolean(brave?.isBrave && (await brave.isBrave()));
}

export default function InstallPrompt({
  isAuthenticated = false,
}: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializePush() {
      const supportsNotifications =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && navigator.standalone === true);

      if (cancelled) return;

      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
      setIsStandalone(standalone);
      setDismissed(localStorage.getItem("pwa-dismissed") === "true");
      setNotificationsSupported(supportsNotifications);

      if (!supportsNotifications) return;

      try {
        const reg = await getServiceWorkerRegistration();
        const sub = await reg.pushManager.getSubscription();

        if (cancelled) return;

        if (isAuthenticated && Notification.permission === "granted" && !sub) {
          await savePushSubscription(reg);
          if (!cancelled) setPushSubscribed(true);
          return;
        }

        setPushSubscribed(!!sub);
      } catch {
        if (!cancelled) setPushSubscribed(false);
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    void initializePush();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      cancelled = true;
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [isAuthenticated]);

  async function enablePushNotifications() {
    try {
      setMessage(null);
      setIsPushLoading(true);

      if (!notificationsSupported) {
        throw new Error("Push notifications are not supported on this device.");
      }

      const t0 = performance.now();
      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      // log permission timing
      // eslint-disable-next-line no-console
      console.debug('[push] permission request took', Math.round(performance.now() - t0), 'ms');

      if (permission !== "granted") {
        setMessage({
          type: "error",
          text: "Notification permission denied. Enable it in your browser settings.",
        });
        return;
      }

      const t1 = performance.now();
      const reg = await getCachedSW();
      // eslint-disable-next-line no-console
      console.debug('[push] sw ready after', Math.round(performance.now() - t1), 'ms');

      const t2 = performance.now();
      await savePushSubscription(reg);
      // eslint-disable-next-line no-console
      console.debug('[push] subscribe+save took', Math.round(performance.now() - t2), 'ms');
      setPushSubscribed(true);
      setMessage({
        type: "success",
        text: "✓ Notifications enabled! Click 'Test' to verify.",
      });
    } catch (error) {
      const isBrave = await isBraveBrowser();
      if (
        error instanceof DOMException &&
        error.name === "AbortError" &&
        isBrave
      ) {
        setMessage({
          type: "error",
          text: 'Open brave://settings/privacy and enable "Use Google services for push messaging", then try again.',
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to enable notifications. Try reloading the page.",
        });
      }
    } finally {
      setIsPushLoading(false);
    }
  }

  async function testPushNotification() {
    try {
      setMessage(null);
      setIsTestLoading(true);

      if (Notification.permission !== "granted") {
        setMessage({
          type: "error",
          text: "Notification permission not granted.",
        });
        return;
      }

      const reg = await getCachedSW();
      const subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        setMessage({ type: "error", text: "No push subscription found. Enable notifications first." });
        return;
      }

      // Optimistic UI: show queued immediately and send in background
      setMessage({ type: "success", text: "Test queued — check your device shortly." });

      void sendTestPushNotificationToDevice(subscription.endpoint).then((result) => {
        if (!result?.success) {
          // eslint-disable-next-line no-console
          console.debug('[push] server test response', result);
          setMessage({ type: 'error', text: result?.error || 'Test failed on server.' });
        } else {
          // server succeeded; keep optimistic message or update
          setMessage({ type: 'success', text: '✓ Test sent! Check your device for a notification.' });
        }
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.debug('[push] test push error', err);
        setMessage({ type: 'error', text: 'Test notification failed.' });
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Test notification failed.",
      });
    } finally {
      setIsTestLoading(false);
    }
  }

  async function testLocalServiceWorkerNotification() {
    try {
      setMessage(null);

      if (!notificationsSupported) {
        setMessage({ type: 'error', text: 'Notifications are not supported on this device.' });
        return;
      }

      if (Notification.permission !== 'granted') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') {
          setMessage({ type: 'error', text: 'Notification permission not granted.' });
          return;
        }
      }

      const reg = await getCachedSW();
      if (reg.active) {
        reg.active.postMessage({ type: 'SHOW_TEST_NOTIFICATION', payload: { title: 'Lqitha local test', body: 'Local SW can display notifications.' } });
      } else {
        await reg.showNotification('Lqitha local test', { body: 'Local SW can display notifications.' });
      }

      setMessage({ type: 'success', text: 'Local notification displayed (if allowed).' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('[push] local test error', err);
      setMessage({ type: 'error', text: 'Local notification failed.' });
    }
  }

  function dismiss() {
    localStorage.setItem("pwa-dismissed", "true");
    setDismissed(true);
  }

  const canPromptForInstall = !isStandalone && !dismissed && deferredPrompt;
  const canPromptForPush =
    isAuthenticated &&
    notificationsSupported &&
    !pushSubscribed &&
    !dismissed &&
    Notification.permission !== "denied";
  const canTestPush =
    isAuthenticated &&
    notificationsSupported &&
    pushSubscribed &&
    !dismissed &&
    Notification.permission === "granted";

  const shouldShow =
    canPromptForInstall || canPromptForPush || canTestPush;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-primary/20 bg-card p-4 shadow-xl md:left-auto md:right-4 md:max-w-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {canPromptForInstall ? (
            <>
              <Download className="h-5 w-5 text-primary" />
              <span className="font-interface text-sm font-semibold text-foreground">
                Install Lqitha App
              </span>
            </>
          ) : (
            <>
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-interface text-sm font-semibold text-foreground">
                Enable Notifications
              </span>
            </>
          )}
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss prompt">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {canPromptForInstall && !isIOS && (
          <button
            type="button"
            onClick={() => deferredPrompt?.prompt()}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background hover:bg-primary/90 transition-colors"
          >
            Install app
          </button>
        )}

        {canPromptForInstall && isIOS && (
          <p className="text-xs text-muted-foreground">
            Tap Share, then Add to Home Screen
          </p>
        )}

        {canPromptForPush && (
          <button
            type="button"
            onClick={enablePushNotifications}
            disabled={isPushLoading}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPushLoading ? "Enabling..." : "Enable notifications"}
          </button>
        )}

        {canTestPush && (
          <button
            type="button"
            onClick={testPushNotification}
            disabled={isTestLoading}
            className="rounded-lg border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTestLoading ? "Testing..." : "Test notification"}
          </button>
        )}

        {notificationsSupported && !dismissed && (
          <button
            type="button"
            onClick={testLocalServiceWorkerNotification}
            className="rounded-lg border border-primary/20 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-primary/5 transition-colors"
          >
            Test local notification
          </button>
        )}

        {message && (
          <div
            className={`rounded-lg p-2 text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                : "bg-red-400/10 text-red-400 border border-red-400/30"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}