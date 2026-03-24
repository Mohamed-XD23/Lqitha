"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; image?: string | null }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
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
    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}

export async function changePassword(current: string, newPass: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: "Account uses OAuth or password is not set" };
    }

    const isValid = await bcrypt.compare(current, user.password);
    if (!isValid) {
      return { error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to change password" };
  }
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.delete({
      where: { id: session.user.id },
    });
    
    return { success: "Account deleted" };
  } catch (error) {
    console.error("Account delete error:", error);
    return { error: "Failed to delete account" };
  }
}
