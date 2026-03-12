"use client";

import { X } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";
import ChatWindow from "./ChatWindow";

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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">المحادثة</h3>
          <button
            onClick={closeChat}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
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
