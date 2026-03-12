"use client";

import { useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { createChatChannel } from "@/actions/chat.actions";
import { useChatContext } from "@/context/ChatContext";

interface Props {
  claimId: string;
  ownerId: string;
  claimantId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
}

export default function ChatButton({
  claimId, ownerId, claimantId,
  currentUserId, currentUserName, currentUserImage,
}: Props) {
  const { openChat } = useChatContext();
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    startTransition(async () => {
      const result = await createChatChannel(claimId, ownerId, claimantId);
      if (result.channelId) {
        openChat({
          channelId: result.channelId,
          userId: currentUserId,
          userName: currentUserName,
          userImage: currentUserImage,
        });
      }
    });
  }

  return (
    <button
      onClick={handleOpen}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
    >
      <MessageSquare className="w-4 h-4" />
      {isPending ? "..." : "فتح المحادثة"}
    </button>
  );
}