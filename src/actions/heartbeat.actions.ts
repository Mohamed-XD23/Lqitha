"use server";

import db from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Called by HeartbeatProvider every 30s.
 * Upserts the UserSession row with the current timestamp.
 */
export async function sendHeartbeat() {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.userSession.upsert({
    where: { userId: session.user.id },
    update: { lastSeen: new Date(), isOnline: true },
    create: { userId: session.user.id, lastSeen: new Date(), isOnline: true },
  });
}

/**
 * Check if a user is online (lastSeen within the last 60 seconds).
 */
export async function checkUserOnline(userId: string): Promise<boolean> {
  const record = await db.userSession.findUnique({
    where: { userId },
  });

  if (!record) return false;

  const now = new Date();
  const diff = now.getTime() - record.lastSeen.getTime();
  // Consider online if lastSeen within the last 60 seconds
  return diff < 60_000;
}
