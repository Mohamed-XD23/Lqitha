"use client";

import { useEffect, useRef } from "react";
import { sendHeartbeat } from "@/actions/heartbeat.actions";

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

export default function HeartbeatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Send initial heartbeat
    void sendHeartbeat();

    // Start interval
    intervalRef.current = setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab became visible — send heartbeat and restart interval
        void sendHeartbeat();
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          void sendHeartbeat();
        }, HEARTBEAT_INTERVAL_MS);
      } else {
        // Tab hidden — stop heartbeat to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
}
