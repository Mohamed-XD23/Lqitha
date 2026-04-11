"use server";

import { auth } from "@/lib/auth";
import { StreamChat } from "stream-chat";
import { checkUserOnline } from "@/actions/heartbeat.actions";
import db from "@/lib/db";

const serverClient = new StreamChat(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!,
  { timeout: 10000 },
);

export interface MessageNotif {
  id: string;
  channelId: string;
  isOnline: boolean;
  senderName: string;
  senderAvatar?: string;
  senderUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage?: string;
  itemTitle: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isSentByMe: boolean;
  isReadByOther: boolean;
}

export async function getMessageNotifications(): Promise<{
  messages: MessageNotif[];
  unreadCount: number;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { messages: [], unreadCount: 0 };
  }

  const currentUserId = session.user.id;

  try {
    // Query channels where the current user is a member
    const channels = await serverClient.queryChannels(
      { members: { $in: [currentUserId] }, type: "messaging" },
      { last_message_at: -1 },
      { limit: 20, state: true, watch: false },
    );

    const messages: MessageNotif[] = [];
    let totalUnread = 0;

    for (const channel of channels) {
      const lastMessage = channel.state.messages[channel.state.messages.length - 1];
      if (!lastMessage) continue;

      const channelId = channel.id || "";

      // Find the other member
      const members = Object.values(channel.state.members);
      const otherMember = members.find((m) => m.user_id !== currentUserId);
      if (!otherMember) continue;

      const otherUserId = otherMember.user_id || "";
      const otherUserName = otherMember.user?.name || "User";
      const otherUserImage = otherMember.user?.image as string | undefined;

      // Check online status using our heartbeat system
      const isOnline = await checkUserOnline(otherUserId);

      // Determine if the last message was sent by the current user
      const isSentByMe = lastMessage.user?.id === currentUserId;

      // Check if the other user has read the last message
      const channelRead = channel.state.read;
      const otherUserRead = channelRead[otherUserId];
      const isReadByOther = otherUserRead
        ? new Date(otherUserRead.last_read).getTime() >= new Date(lastMessage.created_at ?? 0).getTime()
        : false;

      // My unread count for this channel
      const myRead = channelRead[currentUserId];
      const myUnreadCount = myRead?.unread_messages ?? 0;
      const isRead = myUnreadCount === 0;

      totalUnread += myUnreadCount > 0 ? 1 : 0;

      // Extract item title from channel ID (format: claim-{claimId})
      let itemTitle = "";
      if (channelId.startsWith("claim-")) {
        const claimId = channelId.replace("claim-", "");
        try {
          const claim = await db.claimRequest.findUnique({
            where: { id: claimId },
            select: { item: { select: { title: true } } },
          });
          itemTitle = claim?.item?.title || "";
        } catch {
          itemTitle = "";
        }
      }

      // Build preview text
      const messageText = lastMessage.text || "";
      const preview = isSentByMe
        ? `You: ${messageText}`
        : messageText;

      // Sender info (who sent the last message)
      const senderName = isSentByMe
        ? (session.user.name || "You")
        : (lastMessage.user?.name || otherUserName);
      const senderAvatar = isSentByMe
        ? (session.user.image || undefined)
        : (lastMessage.user?.image as string | undefined) || otherUserImage;

      messages.push({
        id: lastMessage.id,
        channelId,
        isOnline,
        senderName,
        senderAvatar,
        senderUserId: lastMessage.user?.id || "",
        otherUserId,
        otherUserName,
        otherUserImage,
        itemTitle,
        preview: preview.length > 60 ? preview.slice(0, 60) + "…" : preview,
        timestamp: String(lastMessage.created_at ?? ""),
        isRead,
        isSentByMe,
        isReadByOther,
      });
    }

    return { messages, unreadCount: totalUnread };
  } catch (error) {
    console.error("Failed to fetch message notifications:", error);
    return { messages: [], unreadCount: 0 };
  }
}
