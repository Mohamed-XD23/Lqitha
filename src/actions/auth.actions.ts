"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "@/lib/db";
import { randomUUID } from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

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
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid input data." };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.emailVerificationToken.create({ data: { email, token, expiresAt } });
  await sendVerificationEmail(email, token);

  return { success: true };
}

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) return { error: "Invalid verification link." };
  if (record.expiresAt < new Date())
    return { error: "Verification link has expired." };

  await db.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  await db.emailVerificationToken.delete({ where: { token } });

  return { success: true };
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const rl = checkRateLimit(`forgot:${normalizedEmail}`);
  if (!rl.allowed)
    return { error: "Too many requests. Please wait 15 minutes." };

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
  if (newPassword.length < 8)
    return { error: "Password must be at least 8 characters." };

  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record) return { error: "Invalid or expired reset link." };
  if (record.expiresAt < new Date())
    return { error: "Reset link has expired. Please request a new one." };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({ where: { token } });
  resetRateLimit(`forgot:${record.email}`);

  return { success: true };
}
