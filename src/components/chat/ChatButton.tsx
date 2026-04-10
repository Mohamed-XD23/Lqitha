"use client";

import { useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { createChatChannel } from "@/actions/chat.actions";
import { useChatContext } from "@/context/ChatContext";
import { Dictionary } from "@/lib/dictionary.types";

interface Props {
  claimId: string;
  ownerId: string;
  claimantId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
  dict: Dictionary;
}

export default function ChatButton({
  claimId,
  ownerId,
  claimantId,
  currentUserId,
  currentUserName,
  currentUserImage,
  dict,
}: Props) {
  const t = dict.chat;
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
      className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium font-interface bg-primary text-background hover:bg-foreground transition-colors disabled:opacity-50"
    >
      <MessageSquare className="w-3 h-3" />
      {isPending ? "..." : t.chatbtn}
    </button>
  );
}
