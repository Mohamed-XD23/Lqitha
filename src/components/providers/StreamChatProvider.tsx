"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { getChatToken } from "@/actions/chat.actions";

interface StreamChatContextType {
  client: StreamChat | null;
  isConnected: boolean;
}

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  isConnected: false,
});

export const useStreamChat = () => useContext(StreamChatContext);

interface Props {
  children: React.ReactNode;
  userId: string;
  userName?: string | null;
  userImage?: string | null;
}

export default function StreamChatProvider({
  children,
  userId,
  userName,
  userImage,
}: Props) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let chatClient: StreamChat | null = null;

    async function init() {
      if (!userId) return;

      try {
        const { token, error } = await getChatToken();
        if (error || !token) {
          console.error("Failed to get Stream Chat token:", error);
          return;
        }

        // Use getInstance to ensure singleton behavior
        chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

        // Only connect if not already connected to the same user
        if (chatClient.userID !== userId) {
          await chatClient.connectUser(
            {
              id: userId,
              name: userName || "User",
              image: userImage || undefined,
            },
            token
          );
        }

        setClient(chatClient);
        setIsConnected(true);
      } catch (err) {
        console.error("Error initializing Stream Chat client:", err);
      }
    }

    init();

    return () => {
      // Disconnect user on unmount to cleanup
      if (chatClient) {
        void chatClient.disconnectUser().then(() => {
          setClient(null);
          setIsConnected(false);
        });
      }
    };
  }, [userId, userName, userImage]);

  return (
    <StreamChatContext.Provider value={{ client, isConnected }}>
      {children}
    </StreamChatContext.Provider>
  );
}
