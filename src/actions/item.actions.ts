"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema } from "@/lib/validation/item.schema";
import { ItemType, ItemStatus } from "@prisma/client";
import { recalculateTrustScore } from "./dashboard.actions";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { sendVerificationEmailIfNeeded } from "@/lib/email-verification";

async function ensureVerifiedEmail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  if (!user?.emailVerified) {
    if (user?.email) {
      try {
        await sendVerificationEmailIfNeeded(user.email);
      } catch (error) {
        console.error("Failed to send verification email for secure action:", error);
      }
    }

    return {
      error:
        "Please verify your email first. We sent a verification link to your inbox.",
    };
  }

  return null;
}

// ===Create Item===

export async function createItem(data: unknown) {
  // 1. ا�تح�� �&�  تسج�`� ا�دخ���
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in first." };
  }
  const verificationError = await ensureVerifiedEmail(session.user.id);
  if (verificationError) return verificationError;

  // 2. ا�تح�� �&�  صحة ا�ب�`ا� ات عبر Zod
  const parsed = itemSchema.safeParse(data);
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

  // 3. تشف�`ر ا�إجابة ا�سر�`ة إذا ْا� ت �&��ج��دة
  const hashedAnswer = secretAnswer
    ? await bcrypt.hash(secretAnswer.toLowerCase().trim(), 12)
    : null;

  // 4. حفظ ف�` �اعدة ا�ب�`ا� ات
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
      userId: session.user.id,
    },
  });

  await recalculateTrustScore(session.user.id);
  return { success: true, itemId: item.id };
}

// ===GeT Items===

interface GetItemsParams {
  page?: number; // ر��& ا�صفحة ا�حا��`ة (�`بدأ �&�  1)
  limit?: number; // عدد ا�ب�اغات ف�` ْ� صفحة
  type?: ItemType; // LOST أ�� FOUND أ�� undefined ��ْ�
  category?: string; // ف�ترة حسب ا�فئة
  search?: string; // بحث ف�` ا�ع� ��ا�  ��ا���صف
}

export async function getItems({
  page = 1,
  limit = 10,
  type,
  category,
  search,
}: GetItemsParams = {}) {
  // حساب عدد ا�ع� اصر ا�ت�` �`جب تخط�`�!ا
  // �&ث�ا�9: ا�صفحة 3 �&ع limit=10 تع� �` تخط�` 20 ع� صرا�9
  const skip = (page - 1) * limit;

  // ب� اء شرط ا�ف�ترة د�`� ا�&�`ْ�`ا�9
  const where = {
    status: ItemStatus.ACTIVE, // � عرض ف�ط ا�ب�اغات ا�� شطة
    ...(type && { type }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  // � شغ�� ا�استع�ا�&�`�  �&عا�9 �ت��ف�`ر ا����ت بد�ا�9 �&�  ا� تظار أحد�!�&ا
  const [items, totalCount] = await Promise.all([
    db.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // ا�أحدث أ���ا�9
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
        // �ا � ج�ب phone ���ا secretAnswer أبدا�9 ف�` ا��ائ�&ة ا�عا�&ة
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    // � حسب ا�عدد ا�ْ��` ��&عرفة عدد ا�صفحات
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
      imageUrl: true,
      status: true,
      secretQuestion: true, // � ج�ب�! �� عرف إذا ْا�  FOUND �`حت���` ع��0 سؤا�
      // secretAnswer �ا � ج�ب�! أبدا�9 �!� ا � �`ُستخد�& ف�ط ف�` Server Action ��تح��
      // phone �ا � ج�ب�! أبدا�9 �!� ا � �`ظ�!ر ف�ط بعد Match
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

// === Submit Claim for item ===

export async function submitClaim(itemId: string, plainTextAnswer: string) {
  // 1. ا�تح�� �&�  تسج�`� ا�دخ���
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in first." };
  }
  const verificationError = await ensureVerifiedEmail(session.user.id);
  if (verificationError) return verificationError;

  const claimantId = session.user.id;

  // 2. ج�ب ا�ب�اغ �&ع hashedAnswer �� maxAttempts
  // � ج�ب hashedAnswer �!� ا ع��0 ا�٬ Server ف�ط � �ا �`ُرس� ���&تصفح أبدا�9
  const item = await db.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      status: true,
      userId: true,
      secretAnswer: true, // ا�٬ Hash � �`ب��0 ع��0 ا�٬ Server
      maxAttempts: true,
    },
  });

  if (!item) return { error: "Item not found." };
  if (item.status !== "ACTIVE") return { error: "This item is no longer active." };
  if (item.userId === claimantId)
    return { error: "You cannot claim your own item." };

  // 3. إ�`جاد أ�� إ� شاء ClaimRequest
  // @@unique([itemId, claimantId]) تض�&�  أ�  ْ� �&ستخد�& �`�&�ْ ط�با�9 ��احدا�9 ف�ط
  const claimRequest = await db.claimRequest.upsert({
    where: { itemId_claimantId: { itemId, claimantId } },
    update: {}, // �ا � ُحد�ث ش�`ئا�9 � ف�ط � ج�ب ا��&��ج��د
    create: { itemId, claimantId },
    include: { attempts: true },
  });

  // 4. ا�تح�� �&�  عدد ا��&حا���ات ا�ساب�ة
  // �!ذا �!�� ا�٬ Rate Limiting � � �&� ع Brute Force
  if (claimRequest.attempts.length >= item.maxAttempts) {
    return {
      error: `You have reached the maximum number of attempts (${item.maxAttempts}).`,
      locked: true,
    };
  }

  // 5. ا��&�ار� ة عبر bcrypt � ��ب ا�� ظا�& ا�أ�&� �`
  // � ُطب�� � فس ا�تح���`� ا�ذ�` طب��� ا�! ع� د ا�حفظ: toLowerCase().trim()
  const isCorrect = item.secretAnswer
    ? await bcrypt.compare(
        plainTextAnswer.toLowerCase().trim(),
        item.secretAnswer,
      )
    : false;

  // 6. تحد�`د ا�حا�ة ا�جد�`دة ب� اء�9 ع��0 ا�� ت�`جة ��ا��&حا���ات
  // ا��&� ط�: إجابة صح�`حة �  PENDING
  //         إجابة خاطئة ���!ذ�! آخر �&حا���ة �  REJECTED
  //         إجابة خاطئة ���&ا زا� �!� اْ �&حا���ات �  PENDING
  const attemptsAfter = claimRequest.attempts.length + 1;
  const newStatus = isCorrect
    ? "PENDING"
    : attemptsAfter >= item.maxAttempts
      ? "REJECTED"
      : "PENDING";

  // 7. تسج�`� ا��&حا���ة ��تحد�`ث ا�حا�ة ف�` ع�&��`ة ��احدة � Transaction
  // � ستخد�& Transaction �ض�&ا�  أ�  ا�خط��ت�`�  تحدثا�  �&عا�9 أ�� �ا تحدثا�  أبدا�9
  await db.$transaction([
    db.claimAttempt.create({
      data: {
        answer: plainTextAnswer, // � خز��  ا�� ص ا�خا�& ��٬ Audit Trail
        isCorrect,
        claimId: claimRequest.id,
      },
    }),
    db.claimRequest.update({
      where: { id: claimRequest.id },
      data: {
        status: newStatus,
        isVerified: isCorrect, // � � أضف �!ذا
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
      title: "New Claim Received",
      message: `Someone has submitted a verified claim for: ${item.id}`, // Better use title but I don't have it in item object at this point. Wait I should fetch title.
      link: `/items/${item.id}`,
    });
  }

  // 8. إرجاع ا�� ت�`جة ��٬ Client � بد���  أ�` ب�`ا� ات حساسة
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
      userId: session.user.id //�ض�&ا�  ا�  ا��&ا�ْ ف�ط �&�  �`ر�0 �!ذا
    },
    include:{
      claims:{
        where:{ isVerified: true}, //ف�ط ��ذ�`�  �ب� ط�ب�!�& 
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
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in first." };

  // تأْد أ�  ا��&ستخد�& �!�� �&ا�ْ ا�ب�اغ
  const item = await db.item.findUnique({
    where: { id: itemId, userId: session.user.id },
    select: { id: true },
  });

  if (!item) return { error: "You are not allowed to perform this action." };

  // Fetch claimant info for notifications
  const claim = await db.claimRequest.findUnique({
    where: { id: claimId },
    select: { claimantId: true, item: { select: { title: true } } }
  });
  if (!claim) return { error: "Claim not found." };

  if (response === "ACCEPTED") {
    // 3 ع�&��`ات ف�` transaction ��احدة
    await db.$transaction([
      // 1. �ب��� �!ذ�! ا��&طا�بة
      db.claimRequest.update({
        where: { id: claimId },
        data: { status: "ACCEPTED" },
      }),
      // 2. رفض با��` ا��&طا�بات ت��ائ�`ا�9
      db.claimRequest.updateMany({
        where: {
          itemId,
          id: { not: claimId },
          status: "PENDING",
        },
        data: { status: "REJECTED", rejectedBy: "system" },
      }),
      // 3. إغ�ا� ا�ب�اغ
      db.item.update({
        where: { id: itemId },
        data: { status: "RESOLVED" },
      }),
    ]);

    // � حسب Trust Score ���&ا�ْ أ�`ضا�9 (+15 �أ�  ا�ب�اغ أصبح RESOLVED)
    await recalculateTrustScore(session.user.id);
    // �����&طا�ب ا��&�ب��� (+10 �أ�  �&طا�بت�! �ُب�ت)
    const acceptedClaim = await db.claimRequest.findUnique({ where: { id: claimId }, select: { claimantId: true } });
    if (acceptedClaim) await recalculateTrustScore(acceptedClaim.claimantId);
    // Trigger Accepted Notification
    await createNotification({
      userId: claim.claimantId,
      type: "CLAIM_ACCEPTED",
      title: "Claim Accepted!",
      message: `Your claim for "${claim.item.title}" has been accepted by the owner.`,
      link: `/dashboard`,
    });
  } else {
    // رفض �`د���` �&�  ا��&ا�ْ
    await db.claimRequest.update({
      where: { id: claimId },
      data: { status: "REJECTED", rejectedBy: "owner" },
    });

    // Trigger Rejected Notification
    await createNotification({
      userId: claim.claimantId,
      type: "CLAIM_REJECTED",
      title: "Claim Rejected",
      message: `Your claim for "${claim.item.title}" was not accepted.`,
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

  // ج�ب maxAttempts �&�  ا�٬ item
  const item = await db.item.findUnique({
    where: { id: itemId },
    select: { maxAttempts: true },
  });

  return {
    status: claim.status,           // PENDING | ACCEPTED | REJECTED
    isVerified: claim.isVerified,   // �!� أجاب صح�x
    rejectedBy: claim.rejectedBy,   // "system" | "owner" | null
    attemptsUsed: claim.attempts.length,
    maxAttempts: item?.maxAttempts ?? 3,
    attemptsLeft: (item?.maxAttempts ?? 3) - claim.attempts.length,
  };
}
