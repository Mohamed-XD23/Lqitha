"use client";

import { useChatContext } from "@/context/ChatContext";
import ChatWindow from "./ChatWindow";
import { X } from "lucide-react";

export default function ChatSidebar() {
  const { isOpen, chatMeta, closeChat } = useChatContext();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={closeChat} />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gold border-b px-4 py-3">
          <h3 className="font-semibold text-xl text-void">Chat</h3>
          <button
            onClick={closeChat}
            className="rounded-full px-1.5 py-2 hover:bg-ivory/60 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-void" strokeWidth={2.5} />
          </button>
        </div>

        {/* Chat */}
        <div className="h-[calc(100%-57px)]">
          {isOpen && chatMeta && (
            <ChatWindow
              userId={chatMeta.userId}
              userName={chatMeta.userName}
              userImage={chatMeta.userImage}
              channelId={chatMeta.channelId}
            />
          )}
        </div>
      </div>
    </>
  );
}
