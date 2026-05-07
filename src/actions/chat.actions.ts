"use server";

import { auth } from "@/lib/auth";
import { StreamChat } from "stream-chat";
import {getDictionary, getLocale} from "@/lib/dictionary"
import db from "@/lib/db";
import { sendPushToUser } from "./push.actions";

const serverClient = new StreamChat(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!,
  { timeout: 10000 },
);

export async function getChatToken() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.chat.error
  const session = await auth();
  if (!session?.user?.id) return { error: t.unauthorized };

  const token = serverClient.createToken(session.user.id);
  return { token };
}

export async function createChatChannel(
  claimId: string,
  ownerId: string,
  claimantId: string,
) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.chat.error;

  const session = await auth();
  if (!session?.user?.id) return { error: t.unauthorized };

  if (session.user.id !== ownerId && session.user.id !== claimantId) {
    return { error: t.unauthorized };
  }

  await serverClient.upsertUsers([{ id: ownerId }, { id: claimantId }]);

  const channel = serverClient.channel("messaging", `claim-${claimId}`, {
    members: [ownerId, claimantId],
    created_by_id: ownerId,
  });

  await channel.create();
  return { channelId: `claim-${claimId}` };
}

export async function sendChatMessagePushNotification(data: {
  channelId: string;
  messageId: string;
  text?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (!data.channelId.startsWith("claim-")) {
    return { error: "Unsupported chat channel" };
  }

  const claimId = data.channelId.replace("claim-", "");
  const claim = await db.claimRequest.findUnique({
    where: { id: claimId },
    select: {
      claimantId: true,
      item: {
        select: {
          title: true,
          userId: true,
        },
      },
    },
  });

  if (!claim) return { error: "Claim not found" };

  const senderId = session.user.id;
  const ownerId = claim.item.userId;
  const claimantId = claim.claimantId;

  if (senderId !== ownerId && senderId !== claimantId) {
    return { error: "Unauthorized" };
  }

  const recipientId = senderId === ownerId ? claimantId : ownerId;
  const senderName = session.user.name || "Lqitha";
  const messagePreview = data.text?.trim() || "New message";

  await sendPushToUser(recipientId, {
    title: `New message from ${senderName}`,
    body:
      claim.item.title
        ? `${claim.item.title}: ${messagePreview}`
        : messagePreview,
    url: "/dashboard",
    tag: data.messageId,
  });

  return { success: true };
}
