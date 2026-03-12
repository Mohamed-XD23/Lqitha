"use client";

import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { getChatToken } from "@/actions/chat.actions";
import "stream-chat-react/dist/css/v2/index.css";

interface Props {
  userId: string;
  userName: string;
  userImage?: string | null;
  channelId: string;
}

export default function ChatWindow({ userId, userName, userImage, channelId }: Props) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    let chatClient: StreamChat;

    async function init() {
      const { token, error } = await getChatToken();
      if (error || !token) return;

      chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY!);

      await chatClient.connectUser(
        { id: userId, name: userName, image: userImage ?? undefined },
        token
      );

      const ch = chatClient.channel("messaging", channelId);
      await ch.watch();

      setClient(chatClient);
      setChannel(ch);
    }

    init();

    return () => {
      chatClient?.disconnectUser();
    };
  }, [userId, channelId]);

  if (!client || !channel) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-gray-400">
        جارٍ تحميل المحادثة...
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}