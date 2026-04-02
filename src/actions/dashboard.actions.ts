"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { getDictionary } from "@/lib/dictionary";
import { revalidatePath } from "next/cache";

// Full data for Dashboard
export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      trustScore: true,
      createdAt: true,

      //البلاغات
      items: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
          _count: { select: { claims: true } }, // counter for num of claims for each post
        },
      },

      //Claims
      claims: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          rejectedBy: true,
          createdAt: true,
          item: {
            select: {
              id: true,
              title: true,
              type: true,
              userId: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export async function getTrustScoreHistory() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const sixMonthsAgo = new Date(); // we get the last 6 months
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [items, claims] = await Promise.all([
    db.item.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    }),
    db.claimRequest.findMany({
      where: { claimantId: userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true, rejectedBy: true },
    }),
  ]);

  // Create an Array for the previous 6 months
  const months: { month: string; score: number }[] = []; //empty array

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthKey = date.toLocaleString("fr-DZ", { month: "short" }); // the month will look like this : Jan,Feb,...
    const year = date.getFullYear();
    const month = date.getMonth();

    /*Calcule the trust Score with those equation:
        +5  لكل بلاغ تنشره
        +10  لكل مطالبة تُقبل (ACCEPTED)
        +15  لكل بلاغ يُحلّ (RESOLVED)
        -10  لكل مطالبة مرفوضة (REJECTED)
        */

    //It is for Charts
    let score = 0;
    items.forEach((item) => {
      const d = new Date(item.createdAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        score += 5;
        if (item.status == "RESOLVED") score += 15;
      }
    });
    claims.forEach((claim) => {
      const d = new Date(claim.createdAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (claim.status == "ACCEPTED") score += 10;
        if (claim.status == "REJECTED" && claim.rejectedBy === "system")
          score -= 10;
      }
    });
    months.push({ month: monthKey, score: Math.max(0, score) }); // don't accept neg(-) numbers
  }

  return months;
}

//Update the Trust Score in Database
//we call this func in any effect happens to the score

export async function recalculateTrustScore(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      items: { select: { status: true } },
      claims: { select: { status: true, rejectedBy: true } },
    },
  });

  if (!user) return;

  let score = 0;
  user.items.forEach((item) => {
    score += 5;
    if (item.status === "RESOLVED") score += 15;
  });

  user.claims.forEach((claim) => {
    if (claim.status === "ACCEPTED") score += 10;
    if (claim.status === "REJECTED" && claim.rejectedBy === "system")
      score -= 10;
  });

  await db.user.update({
    where: { id: userId },
    data: { trustScore: Math.max(0, score) },
  });

  revalidatePath("/dashboard");
}

export async function updateProfileImage(imageUrl: string) {
  const dict = await getDictionary();
  const t = dict.dashboard.error;
  const session = await auth();
  if (!session?.user?.id) return { error: t.unauthorized };

  await db.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
