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
  claimId,
  ownerId,
  claimantId,
  currentUserId,
  currentUserName,
  currentUserImage,
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
      className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
      style={{
        background: "#F2EFE8",
        cursor: isPending ? "not-allowed" : "pointer",
        textAlign: "right",
        opacity: isPending ? 0.7 : 1,
        color: "#080810",
        fontSize: "15px",
        fontWeight: 500,
        fontFamily: "var(--font-interface)",
      }}
    >
      <MessageSquare className="w-3 h-3" />
      {isPending ? "..." : "Chat"}
    </button>
  );
}
