"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/lib/dictionary";

export async function updateProfile(data: {
  name: string;
  image?: string | null;
}) {
  const dict = await getDictionary();
  const t = dict.settings;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        ...(data.image !== undefined && { image: data.image }),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: t.success.profileUpdated };
  } catch (error) {
    console.error(t.error.profileUpdatedFailed, error);
    return { error: t.error.profileUpdatedFailed };
  }
}

export async function changePassword(current: string, newPass: string) {
  const dict = await getDictionary();
  const t = dict.settings;

  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: t.error.accountWithoutPassword };
    }

    const isValid = await bcrypt.compare(current, user.password);
    if (!isValid) {
      return { error: t.error.incorrectPassword };
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: t.success.passwordChange };
  } catch (error) {
    console.error(t.error.failedToChangePassword, error);
    return { error: t.error.failedToChangePassword };
  }
}

export async function deleteAccount() {
  const dict = await getDictionary();
  const t = dict.settings;
  const session = await auth();
  if (!session?.user?.id) {
    return { error: t.error.unauthorized };
  }

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return { success: t.success.accountDelete };
  } catch (error) {
    console.error(t.error.accountDeleteFailed, error);
    return { error: t.error.accountDeleteFailed };
  }
}
