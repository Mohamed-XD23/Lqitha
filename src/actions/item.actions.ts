"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { itemSchema } from "@/lib/validation/item.schema";

export async function createItem(data: unknown) {
  // 1. التحقق من تسجيل الدخول
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول أولاً" };
  }

  // 2. التحقق من صحة البيانات عبر Zod
  const parsed = itemSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const {
    type, title, category, description,
    location, date, imageUrl, phone,
    secretQuestion, secretAnswer,
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