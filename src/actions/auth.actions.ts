"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { sendVerificationEmailIfNeeded } from "@/lib/email-verification";
import { forgotRateLimit, registerRateLimit , resetRateLimit } from "@/lib/rate-limit";
import { getDictionary, getLocale } from "@/lib/dictionary";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8),
});

// ── REGISTER ──────────────────────────────────────────────────────────────────
export async function registerUser(formData: FormData) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t =dict.auth.error;

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: t.invalid };
  }

  const { name, email, password } = parsed.data;

  const { success } = await registerRateLimit.limit(email);
  if (!success) return { error: t.tooManyRequests };

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: t.emailInUse };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, email, password: hashedPassword },
  });

  await sendVerificationEmailIfNeeded(email);

  return { success: true };
}

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t =dict.auth.error;
  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) return { error: t.invalidLink };
  if (record.expiresAt < new Date())
    return { error: t.expiredLink };

  await db.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  await db.emailVerificationToken.deleteMany({ where: { email: record.email } });

  return { success: true };
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t =dict.auth.error;

  const normalizedEmail = email.toLowerCase().trim();

  const { success } = await forgotRateLimit.limit(normalizedEmail);
  if (!success) return { error: t.tooManyRequests };

  const user = await db.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.password) return { success: true };

  await db.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: { email: normalizedEmail, token, expiresAt },
  });
  await sendPasswordResetEmail(normalizedEmail, token);

  return { success: true };
}

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t =dict.auth.error;

  const { success } = await resetRateLimit.limit(`reset:${token}`);
  if (!success) return { error: t.tooManyRequests };

  if (newPassword.length < 8)
    return { error: t.passwordlength };

  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record) return { error: t.invalidResetToken };
  if (record.expiresAt < new Date())
    return { error: t.expiredResetToken };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({ where: { token } });

  return { success: true };
}

// ── SESSION ───────────────────────────────────────────────────────────────────
export async function handleSignOut() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/" });
}
