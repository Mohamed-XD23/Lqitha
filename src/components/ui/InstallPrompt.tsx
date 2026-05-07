"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import {
  sendTestPushNotification,
  subscribeUser,
} from "@/actions/push.actions";

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
}

function getPermissionMessage(permission: NotificationPermission) {
  if (permission === "denied") {
    return "Notifications are blocked. Enable them in your browser or device site settings, then reload the app.";
  }

  return "Notification permission was not allowed. Please choose Allow when the browser asks.";
}

function getPushSetupErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Browser push service registration failed. On localhost this can happen with a self-signed HTTPS certificate, blocked Google/FCM push service, VPN/firewall, or a browser profile that disables push. The local SW test can still verify notification display.";
  }

  return error instanceof Error
    ? error.message
    : "Failed to enable notifications.";
}

async function getPushDiagnostics() {
  const details = [
    `Origin: ${window.location.origin}`,
    `Secure context: ${window.isSecureContext ? "yes" : "no"}`,
    `Permission: ${Notification.permission}`,
    `Service workers supported: ${"serviceWorker" in navigator ? "yes" : "no"}`,
    `Push API supported: ${"PushManager" in window ? "yes" : "no"}`,
    `SW controller: ${navigator.serviceWorker.controller ? "yes" : "no"}`,
    `VAPID public key length: ${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length ?? 0}`,
  ];

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    details.push(`SW active: ${reg.active ? "yes" : "no"}`);
    details.push(`Existing push endpoint: ${sub?.endpoint ? "yes" : "no"}`);
  } catch (error) {
    details.push(
      `SW diagnostics failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
  }

  return details;
}

export default function InstallPrompt({
  isAuthenticated = false,
}: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isLocalTestLoading, setIsLocalTestLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [pushDiagnostics, setPushDiagnostics] = useState<string[]>([]);

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
      setPushDismissed(localStorage.getItem("push-dismissed") === "true");
      setNotificationsSupported(supportsNotifications);

      if (!supportsNotifications) return;

      setNotificationPermission(Notification.permission);

      try {
        const reg = await getServiceWorkerRegistration();
        const sub = await reg.pushManager.getSubscription();

        if (cancelled) return;

        if (isAuthenticated && Notification.permission === "granted" && sub) {
          await persistPushSubscription(sub);
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
      setPushError(null);
      setPushSuccess(null);
      setIsPushLoading(true);

      if (!notificationsSupported) {
        throw new Error("Push notifications are not supported on this device.");
      }

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      setNotificationPermission(permission);

      if (permission !== "granted") {
        setPushError(getPermissionMessage(permission));
        return;
      }

      const reg = await getServiceWorkerRegistration();
      await savePushSubscription(reg);
      localStorage.removeItem("push-dismissed");
      setPushDismissed(false);
      setPushSubscribed(true);
      setPushSuccess("Device notifications are ready.");
    } catch (error) {
      setPushError(getPushSetupErrorMessage(error));
      setPushDiagnostics(await getPushDiagnostics());
    } finally {
      setIsPushLoading(false);
    }
  }

  async function testLocalServiceWorkerNotification() {
    try {
      setPushError(null);
      setPushSuccess(null);
      setIsLocalTestLoading(true);

      if (!notificationsSupported) {
        throw new Error("Notifications are not supported on this device.");
      }

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;

      setNotificationPermission(permission);

      if (permission !== "granted") {
        setPushError(getPermissionMessage(permission));
        return;
      }

      const reg = await getServiceWorkerRegistration();

      if (reg.active) {
        reg.active.postMessage({
          type: "SHOW_TEST_NOTIFICATION",
          payload: {
            title: "Lqitha local SW test",
            body: "This notification was displayed by sw.js without Web Push.",
            url: "/dashboard",
          },
        });
      } else {
        await reg.showNotification("Lqitha local SW test", {
          body: "This notification was displayed by the service worker registration.",
          icon: "/android-chrome-192x192.png",
          badge: "/android-chrome-192x192.png",
          tag: `local-sw-test-${Date.now()}`,
          data: { url: "/dashboard" },
        });
      }

      setPushSuccess("Local service worker notification sent.");
      setPushDiagnostics(await getPushDiagnostics());
    } catch (error) {
      setPushError(getPushSetupErrorMessage(error));
      setPushDiagnostics(await getPushDiagnostics());
    } finally {
      setIsLocalTestLoading(false);
    }
  }

  async function testPushNotification() {
    try {
      setPushError(null);
      setPushSuccess(null);
      setIsTestLoading(true);

      if (!notificationsSupported) {
        throw new Error("Push notifications are not supported on this device.");
      }

      if (Notification.permission !== "granted") {
        setNotificationPermission(Notification.permission);
        setPushError(getPermissionMessage(Notification.permission));
        return;
      }

      const reg = await getServiceWorkerRegistration();
      await savePushSubscription(reg);
      setPushSubscribed(true);

      const result = await sendTestPushNotification();

      if (!result.success) {
        throw new Error(result.error || "Test push notification failed.");
      }

      setPushSuccess("Test sent. Check your device notifications.");
    } catch (error) {
      setPushError(
        error instanceof Error
          ? error.message
          : "Failed to test push notification.",
      );
      setPushDiagnostics(await getPushDiagnostics());
    } finally {
      setIsTestLoading(false);
    }
  }

  function dismiss() {
    if (!isStandalone) {
      localStorage.setItem("pwa-dismissed", "true");
      setDismissed(true);
    }

    localStorage.setItem("push-dismissed", "true");
    setPushDismissed(true);
  }

  const canPromptForPush =
    isAuthenticated &&
    notificationsSupported &&
    !pushSubscribed &&
    !pushDismissed &&
    notificationPermission !== "denied";
  const canTestPush =
    isAuthenticated &&
    notificationsSupported &&
    pushSubscribed &&
    notificationPermission === "granted";
  const canTestLocalSw =
    isAuthenticated &&
    notificationsSupported &&
    notificationPermission !== "denied";
  const shouldShowPermissionStatus =
    isAuthenticated &&
    notificationsSupported &&
    notificationPermission === "denied";
  const showInstallPrompt = !isStandalone && !dismissed;

  if (
    !showInstallPrompt &&
    !canPromptForPush &&
    !canTestPush &&
    !canTestLocalSw &&
    !shouldShowPermissionStatus
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-primary/20 bg-card p-4 shadow-xl md:left-auto md:right-4 md:max-w-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <span className="font-interface text-sm font-semibold text-foreground">
            Install Lqitha
          </span>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss prompt">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {showInstallPrompt && (
        <p className="mb-3 text-xs text-muted-foreground">
          Add the app to your home screen for faster access.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {showInstallPrompt && isIOS && (
          <p className="text-xs text-muted-foreground">
            Tap Share, then Add to Home Screen.
          </p>
        )}

        {showInstallPrompt && !isIOS && deferredPrompt && (
          <button
            type="button"
            onClick={() => deferredPrompt.prompt()}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background"
          >
            Install app
          </button>
        )}

        {canPromptForPush && (
          <button
            type="button"
            onClick={enablePushNotifications}
            disabled={isPushLoading}
            className="rounded-lg border border-primary/30 px-4 py-2 text-xs text-primary transition-opacity disabled:opacity-60"
          >
            {isPushLoading ? "Activating notifications..." : "Enable device notifications"}
          </button>
        )}

        {canTestPush && (
          <button
            type="button"
            onClick={testPushNotification}
            disabled={isTestLoading}
            className="rounded-lg border border-emerald-400/30 px-4 py-2 text-xs text-emerald-400 transition-opacity disabled:opacity-60"
          >
            {isTestLoading ? "Sending test..." : "Test device notification"}
          </button>
        )}

        {canTestLocalSw && (
          <button
            type="button"
            onClick={testLocalServiceWorkerNotification}
            disabled={isLocalTestLoading}
            className="rounded-lg border border-primary/20 px-4 py-2 text-xs text-muted-foreground transition-opacity disabled:opacity-60"
          >
            {isLocalTestLoading ? "Testing SW..." : "Test local SW notification"}
          </button>
        )}

        {shouldShowPermissionStatus && (
          <p className="text-xs text-red-400">
            {getPermissionMessage(notificationPermission)}
          </p>
        )}
        {pushSuccess && <p className="text-xs text-emerald-400">{pushSuccess}</p>}
        {pushError && <p className="text-xs text-red-400">{pushError}</p>}
        {pushDiagnostics.length > 0 && (
          <details className="rounded-lg border border-primary/10 p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer text-primary">Push diagnostics</summary>
            <ul className="mt-2 space-y-1">
              {pushDiagnostics.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
