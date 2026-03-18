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
  Avatar,
  useChannelStateContext,
  useChatContext,
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

const MessengerAvatar = (props: any) => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();

  if (!channel || !client) return <Avatar {...props} />;

  const members = channel.state?.members;
  if (!members) return <Avatar {...props} />;

  // Find the other member in a 1-on-1 chat
  const otherMember = Object.values(members).find(
    (m: any) => m.user?.id !== client.userID
  ) as any;

  // Check if they are currently online
  const isOnline = otherMember?.user?.online;

  return (
    <div style={{ position: "relative" }}>
      <Avatar {...props} />
      {isOnline && (
        <span
          style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            width: "12px",
            height: "12px",
            backgroundColor: "#31a24c", // Messenger Green
            border: "2px solid white",
            borderRadius: "50%",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

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
        Loading...
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader Avatar={MessengerAvatar} />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}