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
  AvatarProps,
} from "stream-chat-react";
import { Channel as StreamChannel } from "stream-chat";
import { useStreamChat } from "@/components/providers/StreamChatProvider";
import "stream-chat-react/dist/css/v2/index.css";


const MessengerAvatar = (props: AvatarProps) => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();

  if (!channel || !client) return <Avatar {...props} />;

  const members = channel.state?.members;
  if (!members) return <Avatar {...props} />;

  // Find the other member in a 1-on-1 chat
  const outOfMe = Object.values(members).filter(
    (m) => m.user?.id !== client.userID
  );
  
  const otherMember = outOfMe[0];

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

export default function ChatWindow({ channelId }: { channelId: string }) {
  const { client } = useStreamChat();
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    if (!client) return;

    async function init() {
      const ch = client!.channel("messaging", channelId);
      await ch.watch();
      setChannel(ch);
    }

    init();

    // No need to disconnect globally managed client on unmount
  }, [client, channelId]);

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
