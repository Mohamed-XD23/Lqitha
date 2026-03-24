import { randomUUID } from "crypto";
import db from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_LINK_TTL_MS = 24 * 60 * 60 * 1000;

export async function sendVerificationEmailIfNeeded(email: string) {
  const now = new Date();

  const existingActiveToken = await db.emailVerificationToken.findFirst({
    where: {
      email,
      expiresAt: { gt: now },
    },
    select: { id: true },
  });

  if (existingActiveToken) {
    return { sent: false };
  }

  await db.emailVerificationToken.deleteMany({ where: { email } });

  const token = randomUUID();
  const expiresAt = new Date(now.getTime() + VERIFICATION_LINK_TTL_MS);

  await db.emailVerificationToken.create({
    data: { email, token, expiresAt },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (error) {
    await db.emailVerificationToken.deleteMany({ where: { token } });
    throw error;
  }

  return { sent: true };
}
