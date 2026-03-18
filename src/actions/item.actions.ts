"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema } from "@/lib/validation/item.schema";
import { ItemType, ItemStatus } from "@prisma/client";
import { recalculateTrustScore } from "./dashboard.actions";
import { revalidatePath } from "next/cache";

// ===Create Item===

export async function createItem(data: unknown) {
  // 1. التحقق من تسجيل الدخول
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول أولاً" };
  }

  // 2. التحقق من صحة البيانات عبر Zod
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

  // 3. تشفير الإجابة السرية إذا كانت موجودة
  const hashedAnswer = secretAnswer
    ? await bcrypt.hash(secretAnswer.toLowerCase().trim(), 12)
    : null;

  // 4. حفظ في قاعدة البيانات
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

  return { success: true, itemId: item.id };
}

// ===GeT Items===

interface GetItemsParams {
  page?: number; // رقم الصفحة الحالية (يبدأ من 1)
  limit?: number; // عدد البلاغات في كل صفحة
  type?: ItemType; // LOST أو FOUND أو undefined للكل
  category?: string; // فلترة حسب الفئة
  search?: string; // بحث في العنوان والوصف
}

export async function getItems({
  page = 1,
  limit = 10,
  type,
  category,
  search,
}: GetItemsParams = {}) {
  // حساب عدد العناصر التي يجب تخطيها
  // مثلاً: الصفحة 3 مع limit=10 تعني تخطي 20 عنصراً
  const skip = (page - 1) * limit;

  // بناء شرط الفلترة ديناميكياً
  const where = {
    status: ItemStatus.ACTIVE, // نعرض فقط البلاغات النشطة
    ...(type && { type }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  // نشغّل الاستعلامين معاً لتوفير الوقت بدلاً من انتظار أحدهما
  const [items, totalCount] = await Promise.all([
    db.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // الأحدث أولاً
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
        // لا نجلب phone ولا secretAnswer أبداً في القائمة العامة
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    // نحسب العدد الكلي لمعرفة عدد الصفحات
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
      secretQuestion: true, // نجلبه لنعرف إذا كان FOUND يحتوي على سؤال
      // secretAnswer لا نجلبه أبداً هنا — يُستخدم فقط في Server Action للتحقق
      // phone لا نجلبه أبداً هنا — يظهر فقط بعد Match
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
  // 1. التحقق من تسجيل الدخول
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول أولاً" };
  }

  const claimantId = session.user.id;

  // 2. جلب البلاغ مع hashedAnswer و maxAttempts
  // نجلب hashedAnswer هنا على الـ Server فقط — لا يُرسل للمتصفح أبداً
  const item = await db.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      status: true,
      userId: true,
      secretAnswer: true, // الـ Hash — يبقى على الـ Server
      maxAttempts: true,
    },
  });

  if (!item) return { error: "البلاغ غير موجود" };
  if (item.status !== "ACTIVE") return { error: "هذا البلاغ لم يعد نشطاً" };
  if (item.userId === claimantId)
    return { error: "لا يمكنك المطالبة ببلاغك الخاص" };

  // 3. إيجاد أو إنشاء ClaimRequest
  // @@unique([itemId, claimantId]) تضمن أن كل مستخدم يملك طلباً واحداً فقط
  const claimRequest = await db.claimRequest.upsert({
    where: { itemId_claimantId: { itemId, claimantId } },
    update: {}, // لا نُحدّث شيئاً — فقط نجلب الموجود
    create: { itemId, claimantId },
    include: { attempts: true },
  });

  // 4. التحقق من عدد المحاولات السابقة
  // هذا هو الـ Rate Limiting — نمنع Brute Force
  if (claimRequest.attempts.length >= item.maxAttempts) {
    return {
      error: `لقد استنفدت الحد الأقصى من المحاولات (${item.maxAttempts})`,
      locked: true,
    };
  }

  // 5. المقارنة عبر bcrypt — قلب النظام الأمني
  // نُطبّق نفس التحويل الذي طبّقناه عند الحفظ: toLowerCase().trim()
  const isCorrect = item.secretAnswer
    ? await bcrypt.compare(
        plainTextAnswer.toLowerCase().trim(),
        item.secretAnswer,
      )
    : false;

  // 6. تحديد الحالة الجديدة بناءً على النتيجة والمحاولات
  // المنطق: إجابة صحيحة → PENDING
  //         إجابة خاطئة وهذه آخر محاولة → REJECTED
  //         إجابة خاطئة وما زال هناك محاولات → PENDING
  const attemptsAfter = claimRequest.attempts.length + 1;
  const newStatus = isCorrect
    ? "PENDING"
    : attemptsAfter >= item.maxAttempts
      ? "REJECTED"
      : "PENDING";

  // 7. تسجيل المحاولة وتحديث الحالة في عملية واحدة — Transaction
  // نستخدم Transaction لضمان أن الخطوتين تحدثان معاً أو لا تحدثان أبداً
  await db.$transaction([
    db.claimAttempt.create({
      data: {
        answer: plainTextAnswer, // نخزّن النص الخام للـ Audit Trail
        isCorrect,
        claimId: claimRequest.id,
      },
    }),
    db.claimRequest.update({
      where: { id: claimRequest.id },
      data: {
        status: newStatus,
        isVerified: isCorrect, // ← أضف هذا
        ...(newStatus === "REJECTED" && { rejectedBy: "system" }),
      },
    }),
  ]);

  await recalculateTrustScore(claimantId);
  await recalculateTrustScore(session.user.id)

  // 8. إرجاع النتيجة للـ Client — بدون أي بيانات حساسة
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
      userId: session.user.id //لضمان ان المالك فقط من يرى هذا
    },
    include:{
      claims:{
        where:{ isVerified: true}, //فقط للذين قبل طلبهم 
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
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" };

  // تأكد أن المستخدم هو مالك البلاغ
  const item = await db.item.findUnique({
    where: { id: itemId, userId: session.user.id },
    select: { id: true },
  });

  if (!item) return { error: "غير مصرح لك بهذا الإجراء" };

  if (response === "ACCEPTED") {
    // 3 عمليات في transaction واحدة
    await db.$transaction([
      // 1. قبول هذه المطالبة
      db.claimRequest.update({
        where: { id: claimId },
        data: { status: "ACCEPTED" },
      }),
      // 2. رفض باقي المطالبات تلقائياً
      db.claimRequest.updateMany({
        where: {
          itemId,
          id: { not: claimId },
          status: "PENDING",
        },
        data: { status: "REJECTED", rejectedBy: "system" },
      }),
      // 3. إغلاق البلاغ
      db.item.update({
        where: { id: itemId },
        data: { status: "RESOLVED" },
      }),
    ]);

    // نحسب Trust Score للمالك أيضاً (+15 لأن البلاغ أصبح RESOLVED)
    await recalculateTrustScore(session.user.id);
    // وللمطالب المقبول (+10 لأن مطالبته قُبلت)
    const acceptedClaim = await db.claimRequest.findUnique({ where: { id: claimId }, select: { claimantId: true } });
    if (acceptedClaim) await recalculateTrustScore(acceptedClaim.claimantId);
  } else {
    // رفض يدوي من المالك
    await db.claimRequest.update({
      where: { id: claimId },
      data: { status: "REJECTED", rejectedBy: "owner" },
    });
  }

  revalidatePath(`/items/${itemId}`);
  return { success: true };
}