"use client";

import PusherClient from "pusher-js";

declare global {
  interface Window {
    __lqithaPusherClient?: PusherClient | null;
  }
}

function createPusherClient(): PusherClient | null {
  if (
    !process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
    !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  ) {
    return null;
  }

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });
}

export const pusherClient =
  typeof window !== "undefined"
    ? (window.__lqithaPusherClient ??= createPusherClient())
    : null;
