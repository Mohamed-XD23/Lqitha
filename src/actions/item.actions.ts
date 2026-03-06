"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema } from "@/lib/validation/item.schema";
import { ItemType, ItemStatus } from "@/generated/prisma";

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
