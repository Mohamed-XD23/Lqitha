"use server";

import webpush from "web-push";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

type PushSendError = {
  statusCode?: number;
  message?: string;
  body?: string;
};

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function subscribeUser(sub: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: {
        userId: session.user.id,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Error saving subscription:", error);
    return { success: false, error: String(error) };
  }
}

export async function unsubscribeUser(endpoint: string) {
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  return { success: true };
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    console.info(`No browser push subscriptions found for user ${userId}`);
    return { sent: 0, failed: 0, deleted: 0 };
  }

  const browserPushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    url: payload.url || "/",
    tag: payload.tag,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        browserPushPayload,
      ),
    ),
  );

  let deleted = 0;
  let failed = 0;

  await Promise.allSettled(
    results.map((result, i) => {
      if (result.status === "fulfilled") {
        return Promise.resolve();
      }

      failed += 1;
      const error = result.reason as PushSendError;
      const shouldDeleteSubscription =
        error.statusCode === 404 || error.statusCode === 410;

      if (shouldDeleteSubscription) {
        deleted += 1;
        return db.pushSubscription.delete({
          where: { endpoint: subscriptions[i].endpoint },
        });
      }

      console.error("Failed to send browser push notification:", {
        statusCode: error.statusCode,
        message: error.message,
        body: error.body,
      });

      return Promise.resolve();
    }),
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed,
    deleted,
  };
}

export async function sendTestPushNotification() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const result = await sendPushToUser(session.user.id, {
    title: "Lqitha device notification test",
    body: "If you see this, Web Push reached your service worker.",
    url: "/dashboard",
    tag: `push-test-${Date.now()}`,
  });

  if (result.sent === 0) {
    return {
      success: false,
      error:
        result.failed > 0
          ? "The push service rejected the test notification."
          : "No saved device subscription found for this account.",
      result,
    };
  }

  return { success: true, result };
}

export async function sendTestPushNotificationToDevice(endpoint: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in." };
  }

  const subscription = await db.pushSubscription.findFirst({
    where: {
      endpoint,
      userId: session.user.id,
    },
  });

  if (!subscription) {
    return {
      success: false,
      error: "No saved subscription found for this browser.",
    };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: "Lqitha device notification test",
        body: "If you see this, Web Push reached this browser.",
        icon: "/android-chrome-192x192.png",
        badge: "/android-chrome-192x192.png",
        url: "/dashboard",
        tag: `push-test-${Date.now()}`,
      }),
    );

    return { success: true };
  } catch (error) {
    const pushError = error as PushSendError;
    const shouldDeleteSubscription =
      pushError.statusCode === 404 || pushError.statusCode === 410;

    if (shouldDeleteSubscription) {
      await db.pushSubscription.delete({
        where: { endpoint: subscription.endpoint },
      });
    }

    console.error("Failed to send browser push test notification:", {
      statusCode: pushError.statusCode,
      message: pushError.message,
      body: pushError.body,
    });

    return {
      success: false,
      error:
        pushError.statusCode === 404 || pushError.statusCode === 410
          ? "This browser subscription expired. Enable notifications again."
          : "The push service rejected this browser notification.",
    };
  }
}
