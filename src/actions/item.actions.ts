"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema } from "@/lib/validation/item.schema";
import { ItemType, ItemStatus, NotificationType } from "@prisma/client";
import { recalculateTrustScore } from "./dashboard.actions";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { sendVerificationEmailIfNeeded } from "@/lib/email-verification";
import { getDictionary, getLocale } from "@/lib/dictionary";
import enDict from "@/lib/dictionaries/en.json";
import { getEmbedding } from "@/lib/embedding";
import { pusherServer } from "@/lib/pusher.server";
import { sendMatchEmail } from "@/lib/email";
import { randomUUID } from "crypto";

// Always use English for stored notification text so rendering
// can re-localise at display time based on the reader's locale.
const en = enDict.Toast;
const MAX_DISTANCE = 0.4;
const MATCH_LIMIT = 20;

function fillNotificationTemplate(
  template: string,
  placeholder: string,
  value: string,
) {
  return template.replace(placeholder, value);
}

// ===Matching Engine===

function calculateDistance(
  lat1: number | null | undefined,
  lng1: number | null | undefined,
  lat2: number | null | undefined,
  lng2: number | null | undefined,
): number | null {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null)
    return null;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateGeoBoost(distance: number | null): number {
  if (distance === null) return 0;
  if (distance < 1) return 0.2;
  if (distance < 5) return 0.1;
  return 0;
}

function calculateFinalScore(similarity: number, distance: number | null): number {
  return Math.min(similarity + calculateGeoBoost(distance), 1);
}

function buildMatchReasons(input: {
  similarity: number;
  categoryMatch: boolean;
  distance: number | null;
}) {
  const reasons: string[] = [];

  if (input.similarity > 0.75) {
    reasons.push("High semantic similarity in description and title");
  }

  if (input.categoryMatch) {
    reasons.push("Same category match");
  }

  if (input.distance !== null) {
    if (input.distance < 1) {
      reasons.push("Very close geographic location (<1km)");
    } else if (input.distance < 5) {
      reasons.push("Nearby location (<5km)");
    }
  }

  return reasons;
}

async function findMatches(newItem: {
  id: string;
  type: ItemType;
  category: string;
  lat: number | null;
  lng: number | null;
  userId: string;
  embeddings: number[];
}) {
  try {
    const oppositeType =
      newItem.type === ItemType.LOST ? ItemType.FOUND : ItemType.LOST;

    // FIX Bug 1: Convert number[] to pgvector text format '[x,y,...]'
    // Prisma's tagged template would serialize number[] as a PostgreSQL ARRAY {x,y,...}
    // which is unreliable for pgvector. Text format '[x,y,...]' is pgvector's native input.
    const vectorStr = `[${newItem.embeddings.join(",")}]`;

    const matches = await db.$queryRaw<
      Array<{
        id: string;
        type: ItemType;
        title: string;
        category: string;
        lat: number | null;
        lng: number | null;
        userId: string;
        distance: number;
      }>
    >`
      SELECT
        id,
        type,
        title,
        category,
        lat,
        lng,
        "userId",
        distance
      FROM (
        SELECT
          id,
          type,
          title,
          category,
          lat,
          lng,
          "userId",
          (embeddings <=> ${vectorStr}::vector) AS distance
        FROM "Item"
        WHERE type = ${oppositeType}::"ItemType"
          AND status = 'ACTIVE'
          AND category = ${newItem.category}
          AND "userId" != ${newItem.userId}
      ) candidates
      WHERE distance <= ${MAX_DISTANCE}
      ORDER BY distance
      LIMIT ${MATCH_LIMIT};
    `;

    const scoredMatches = matches.map((match) => {
      const similarity = 1 - Number(match.distance);
      const distanceKm = calculateDistance(
        match.lat,
        match.lng,
        newItem.lat,
        newItem.lng,
      );
      const geoBoostValue = calculateGeoBoost(distanceKm);
      const categoryMatch = match.category === newItem.category;
      const finalScore = calculateFinalScore(similarity, distanceKm);

      return {
        id: match.id,
        title: match.title,
        userId: match.userId,
        similarity,
        finalScore,
        explanation: {
          semantic: similarity,
          categoryMatch,
          geoBoost: geoBoostValue,
          distance: distanceKm,
        },
        reasons: buildMatchReasons({
          similarity,
          categoryMatch,
          distance: distanceKm,
        }),
      };
    });

    return scoredMatches;
  } catch (error) {
    console.error("Error finding matches:", error);
    return [];
  }
}

async function ensureVerifiedEmail(userId: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.Toast;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  if (!user?.emailVerified) {
    if (user?.email) {
      try {
        await sendVerificationEmailIfNeeded(user.email);
      } catch (error) {
        console.error(t.verifyEmailERR, error);
      }
    }

    return {
      error: t.verifyEmailReq,
    };
  }

  return null;
}

// ===Create Item===

export async function createItem(data: unknown) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.Toast;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.sessionerror };
  }
  const verificationError = await ensureVerifiedEmail(session.user.id);
  if (verificationError) return verificationError;

  const parsed = itemSchema(dict).safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    type: itemType,
    title,
    category,
    description,
    location,
    date,
    imageUrl,
    phone,
    secretQuestion,
    secretAnswer,
  } = parsed.data;

  // Extract lat/lng from the original data (not from schema validation)
  const lat =
    data && typeof data === "object" && "lat" in data
      ? (data as Record<string, number | null>).lat
      : null;
  const lng =
    data && typeof data === "object" && "lng" in data
      ? (data as Record<string, number | null>).lng
      : null;

  const hashedAnswer = secretAnswer
    ? await bcrypt.hash(secretAnswer.toLowerCase().trim(), 12)
    : null;

  // Generate embedding for the item
  const embeddingText = [
    `Item Type: ${itemType}`,
    `Object Name: ${title}`,
    `Description: ${description}`,
    `Category: ${category}`,
    `Location Context: ${location}`,
    "This is a lost and found object report.",
  ].join("\n");

  const embedding = await getEmbedding(embeddingText);

  const vectorStr = `[${embedding.join(",")}]`;

  const itemId = randomUUID();

  await db.$executeRaw`
  INSERT INTO "Item" (
    id,
    type,
    title,
    category,
    description,
    location,
    date,
    "imageUrl",
    phone,
    "secretQuestion",
    "secretAnswer",
    lat,
    lng,
    "userId",
    embeddings
  )
  VALUES (
    ${itemId},
    CAST(${itemType} AS "ItemType"),
    ${title},
    ${category},
    ${description},
    ${location},
    ${new Date(date)},
    ${imageUrl ?? null},
    ${phone},
    ${secretQuestion ?? null},
    ${hashedAnswer},
    ${lat},
    ${lng},
    ${session.user.id},
    ${vectorStr}::vector
  );
`;

  await recalculateTrustScore(session.user.id);

  // Trigger matching engine
  const item = {
    id: itemId,
    type: itemType,
    category,
    lat,
    lng,
    userId: session.user.id,
    embeddings: embedding,
  };

  const matches = await findMatches(item);

  // Send notifications for ALL matches (not just top 1)
  const pusher = pusherServer;
  if (matches.length > 0 && pusher) {
    const newItemType = itemType === ItemType.LOST ? "LOST" : "FOUND";
    const matchedItemType = itemType === ItemType.LOST ? "FOUND" : "LOST";
    const notificationType: NotificationType =
      itemType === ItemType.LOST
        ? NotificationType.ITEM_FOUND
        : NotificationType.ITEM_LOST;

    // Run all match notifications in parallel
    await Promise.all(
      matches.map(async (match) => {
        // Get email + name so we can send the email notification
        const matchOwner = await db.user.findUnique({
          where: { id: match.userId },
          select: { id: true, email: true, name: true },
        });

        if (!matchOwner) return;

        const message = `Someone posted a ${newItemType} item that may match your ${matchedItemType} item "${match.title}"`;

        await Promise.all([
          // 1. Pusher - real-time bell update
          pusher.trigger(`user-${matchOwner.id}`, "match-found", {
            type: notificationType,
            itemId: itemId,
            matchId: match.id,
            title: title,
            matchTitle: match.title,
            similarity: match.finalScore,
          }),

          // 2. DB notification - persisted, shown in NotificationBell
          createNotification({
            userId: matchOwner.id,
            type: notificationType,
            title: "Possible Match Found!",
            message,
            link: `/items/${itemId}`,
          }),

          // 3. Email - only if the user has an email address
          matchOwner.email
            ? sendMatchEmail({
                to: matchOwner.email,
                ownerName: matchOwner.name ?? "User",
                newItemType,
                newItemTitle: title,
                matchedItemType,
                matchedItemTitle: match.title,
                newItemId: itemId,
                similarity: match.finalScore,
              })
            : Promise.resolve(),
        ]);
      }),
    );
  }
  // FIX: Revalidate browse and dashboard so the new item appears immediately.
  revalidatePath("/browse");
  revalidatePath("/dashboard");

  return { success: true, itemId: itemId, matchesFound: matches.length };
}

// ===GeT Items===

interface GetItemsParams {
  page?: number;
  limit?: number;
  type?: ItemType;
  category?: string;
  search?: string;
}

export async function getItems({
  page = 1,
  limit = 10,
  type,
  category,
  search,
}: GetItemsParams = {}) {
  const skip = (page - 1) * limit;

  const where = {
    status: ItemStatus.ACTIVE,
    ...(type && { type }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, totalCount] = await Promise.all([
    db.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        category: true,
        location: true,
        date: true,
        imageUrl: true,
        status: true,
        createdAt: true,
        lat: true,
        lng: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    db.item.count({ where }),
  ]);

  return {
    items,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1,
  };
}

// === Show item details ===
export async function getItemById(id: string) {
  const item = await db.item.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      title: true,
      category: true,
      description: true,
      location: true,
      date: true,
      phone: true,
      imageUrl: true,
      status: true,
      secretQuestion: true,
      lat: true,
      lng: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          trustScore: true,
        },
      },
    },
  });

  return item;
}

export async function getItemPhone(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Check if current user has an accepted claim
  const claim = await db.claimRequest.findFirst({
    where: {
      itemId,
      claimantId: session.user.id,
      status: "ACCEPTED",
    },
  });

  if (!claim) return null;

  const item = await db.item.findUnique({
    where: { id: itemId },
    select: { phone: true, userId: true },
  });

  return item?.phone ?? null;
}

// === Submit Claim for item ===

export async function submitClaim(itemId: string, plainTextAnswer: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.Toast;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.sessionerror };
  }
  const verificationError = await ensureVerifiedEmail(session.user.id);
  if (verificationError) return verificationError;

  const claimantId = session.user.id;

  const item = await db.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      title: true,
      status: true,
      userId: true,
      secretAnswer: true,
      maxAttempts: true,
    },
  });

  if (!item) return { error: t.itemNotFound };
  if (item.status !== "ACTIVE") return { error: t.itemNoActive };
  if (item.userId === claimantId) return { error: t.claimOwnItem };

  const claimRequest = await db.claimRequest.upsert({
    where: { itemId_claimantId: { itemId, claimantId } },
    update: {},
    create: { itemId, claimantId },
    include: { attempts: true },
  });
  if (claimRequest.attempts.length >= item.maxAttempts) {
    return {
      error: `${t.attemptLimit} ${item.maxAttempts}`,
      locked: true,
    };
  }

  const isCorrect = item.secretAnswer
    ? await bcrypt.compare(
        plainTextAnswer.toLowerCase().trim(),
        item.secretAnswer,
      )
    : false;

  const attemptsAfter = claimRequest.attempts.length + 1;
  const newStatus = isCorrect
    ? "PENDING"
    : attemptsAfter >= item.maxAttempts
      ? "REJECTED"
      : "PENDING";
  await db.$transaction([
    db.claimAttempt.create({
      data: {
        answer: plainTextAnswer,
        isCorrect,
        claimId: claimRequest.id,
      },
    }),
    db.claimRequest.update({
      where: { id: claimRequest.id },
      data: {
        status: newStatus,
        isVerified: isCorrect,
        ...(newStatus === "REJECTED" && { rejectedBy: "system" }),
      },
    }),
  ]);

  await recalculateTrustScore(claimantId);
  await recalculateTrustScore(session.user.id);

  // Create Notification for Owner (if verified)
  if (isCorrect) {
    await createNotification({
      userId: item.userId,
      type: "CLAIM_NEW",
      title: en.claimNotificationTitle,
      message: fillNotificationTemplate(
        en.claimNotificationMsg,
        "{itemTitle}",
        item.title,
      ),
      link: `/items/${item.id}`,
    });
  }
  return {
    success: true,
    isCorrect,
    status: newStatus,
    attemptsLeft: item.maxAttempts - attemptsAfter,
  };
}

export async function getItemWithClaims(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.item.findUnique({
    where: {
      id: itemId,
      userId: session.user.id,
    },
    include: {
      claims: {
        where: { isVerified: true },
        include: {
          claimant: {
            select: {
              id: true,
              name: true,
              image: true,
              trustScore: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function respondToClaim(
  claimId: string,
  itemId: string,
  response: "ACCEPTED" | "REJECTED",
) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.Toast;

  const session = await auth();
  if (!session?.user?.id) return { error: t.sessionerror };

  const item = await db.item.findUnique({
    where: { id: itemId, userId: session.user.id },
    select: { id: true },
  });

  if (!item) return { error: t.unauthorized };

  // Fetch claimant info for notifications
  const claim = await db.claimRequest.findUnique({
    where: { id: claimId },
    select: { claimantId: true, item: { select: { title: true } } },
  });
  if (!claim) return { error: t.claimNotFound };

  if (response === "ACCEPTED") {
    await db.$transaction([
      db.claimRequest.update({
        where: { id: claimId },
        data: { status: "ACCEPTED" },
      }),
      db.claimRequest.updateMany({
        where: {
          itemId,
          id: { not: claimId },
          status: "PENDING",
        },
        data: { status: "REJECTED", rejectedBy: "system" },
      }),
      db.item.update({
        where: { id: itemId },
        data: { status: "RESOLVED" },
      }),
    ]);

    await recalculateTrustScore(session.user.id);
    const acceptedClaim = await db.claimRequest.findUnique({
      where: { id: claimId },
      select: { claimantId: true },
    });
    if (acceptedClaim) await recalculateTrustScore(acceptedClaim.claimantId);
    // Trigger Accepted Notification
    await createNotification({
      userId: claim.claimantId,
      type: "CLAIM_ACCEPTED",
      title: en.claimAccNotificationTitle,
      message: fillNotificationTemplate(
        en.claimAccNotificationMsg,
        "{claim.item.title}",
        claim.item.title,
      ),
      link: `/dashboard`,
    });
  } else {
    await db.claimRequest.update({
      where: { id: claimId },
      data: { status: "REJECTED", rejectedBy: "owner" },
    });

    // Trigger Rejected Notification
    await createNotification({
      userId: claim.claimantId,
      type: "CLAIM_REJECTED",
      title: en.claimRejNotificationTitle,
      message: fillNotificationTemplate(
        en.claimRejNotificationMsg,
        "{claim.item.title}",
        claim.item.title,
      ),
      link: `/dashboard`,
    });
  }

  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

export async function getUserClaimStatus(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const claim = await db.claimRequest.findUnique({
    where: {
      itemId_claimantId: {
        itemId,
        claimantId: session.user.id,
      },
    },
    include: {
      attempts: true,
    },
  });

  if (!claim) return null;

  const item = await db.item.findUnique({
    where: { id: itemId },
    select: { maxAttempts: true },
  });

  return {
    status: claim.status,
    isVerified: claim.isVerified,
    rejectedBy: claim.rejectedBy,
    attemptsUsed: claim.attempts.length,
    maxAttempts: item?.maxAttempts ?? 3,
    attemptsLeft: (item?.maxAttempts ?? 3) - claim.attempts.length,
  };
}
