"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema} from "@/lib/validation/item.schema";
import { ItemType, ItemStatus } from "@prisma/client";
import { recalculateTrustScore } from "./dashboard.actions";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { sendVerificationEmailIfNeeded } from "@/lib/email-verification";
import { getDictionary, getLocale } from "@/lib/dictionary";
import enDict from "@/lib/dictionaries/en.json";

// Always use English for stored notification text so rendering
// can re-localise at display time based on the reader's locale.
const en = enDict.Toast;


function fillNotificationTemplate(
  template: string,
  placeholder: string,
  value: string,
) {
  return template.replace(placeholder, value);
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
      error:
        t.verifyEmailReq,
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
    type,
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
  const lat = data && typeof data === 'object' && 'lat' in data ? (data as Record<string, number | null>).lat : null;
  const lng = data && typeof data === 'object' && 'lng' in data ? (data as Record<string, number | null>).lng : null;

  const hashedAnswer = secretAnswer
    ? await bcrypt.hash(secretAnswer.toLowerCase().trim(), 12)
    : null;

  const item = await db.item.create({
    data: {
      type,
      title,
      category,
      description,
      location,
      date: new Date(date),
      imageUrl: imageUrl ?? null,
      phone,
      secretQuestion: secretQuestion ?? null,
      secretAnswer: hashedAnswer,
      lat: lat,
      lng: lng || undefined,
      userId: session.user.id,
    },
  });

  await recalculateTrustScore(session.user.id);
  return { success: true, itemId: item.id };
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
  if (item.userId === claimantId)
    return { error: t.claimOwnItem };

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
  await recalculateTrustScore(session.user.id)

  // 8. Create Notification for Owner (if verified)
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

export async function getItemWithClaims(itemId:string) {
  const session = await auth();
  if(!session?.user?.id) return null;

  return db.item.findUnique({
    where:{
      id: itemId,
      userId: session.user.id 
    },
    include:{
      claims:{
        where:{ isVerified: true}, 
        include:{
          claimant:{
            select:{ 
              id: true,
              name: true,
              image: true,
              trustScore: true,
            },
          },
        },
        orderBy: {createdAt: "desc"},
      },
    },
  });
}

export async function respondToClaim(
  claimId: string,
  itemId: string,
  response: "ACCEPTED" | "REJECTED"
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
    select: { claimantId: true, item: { select: { title: true } } }
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
    const acceptedClaim = await db.claimRequest.findUnique({ where: { id: claimId }, select: { claimantId: true } });
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
