"use server";

import webpush from "web-push";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

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
      update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
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
  payload: { title: string; body: string; url?: string  },
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
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
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: "/icon-192x192.png",
          badge: "icon-192x192.png",
          url: payload.url || "/",
        }),
      ),
    ),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      db.pushSubscription.delete({
        where: { endpoint: subscriptions[i].endpoint },
      });
    }
  });
}
