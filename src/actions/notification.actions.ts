"use server";

import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher.server";
import { NotificationType } from "@prisma/client";
import { getDictionary , getLocale } from "@/lib/dictionary";

export async function getNotifications() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.notifications;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized, notifications: null };
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20, // Fetch recent 20
    });

    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error(t.error.failedFetch, error);
    return { error: t.error.failedFetch, notifications: null };
  }
}

export async function markAsRead(notificationId: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.notifications;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized };
  }

  try {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (notification?.userId !== session.user.id) {
      return { error: t.error.unauthorized };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error(t.error.markReadFailed, error);
    return { error: t.error.markReadFailed };
  }
}

export async function markAllAsRead() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.notifications;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized };
  }

  try {
    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error(t.error.markAllReadFailed, error);
    return { error: t.error.markAllReadFailed };
  }
}

// System function to create a notification (Server-side use only)
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.notifications;
  try {
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
    // Trigger real-time event via Pusher
    if (pusherServer) {
      await pusherServer.trigger(
        `user-${data.userId}`,
        "new-notification",
        notification,
      );
    }
    return { success: true, notification };
  } catch (error) {
    console.error(t.error.createFailed, error);
    return { error: t.error.createFailed };
  }
}
