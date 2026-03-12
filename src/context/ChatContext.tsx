"use client";

import { createContext, useContext, useState } from "react";

interface ChatMeta {
  channelId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
}

interface ChatContextType {
  isOpen: boolean;
  chatMeta: ChatMeta | null;
  openChat: (meta: ChatMeta) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMeta, setChatMeta] = useState<ChatMeta | null>(null);

  function openChat(meta: ChatMeta) {
    setChatMeta(meta);
    setIsOpen(true);
  }

  function closeChat() {
    setIsOpen(false);
  }

  return (
    <ChatContext.Provider value={{ isOpen, chatMeta, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
