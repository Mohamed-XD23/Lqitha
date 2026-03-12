"use server";

import { auth } from "@/lib/auth";
import { StreamChat } from "stream-chat";

const serverClient = new StreamChat(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!,
  { timeout: 10000 },
);

export async function getChatToken() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const token = serverClient.createToken(session.user.id);
  return { token };
}

export async function createChatChannel(
  claimId: string,
  ownerId: string,
  claimantId: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (session.user.id !== ownerId && session.user.id !== claimantId) {
    return { error: "Unauthorized" };
  }

  await serverClient.upsertUsers([{ id: ownerId }, { id: claimantId }]);

  const channel = serverClient.channel("messaging", `claim-${claimId}`, {
    members: [ownerId, claimantId],
    created_by_id: ownerId,
  });

  await channel.create();
  return { channelId: `claim-${claimId}` };
}
