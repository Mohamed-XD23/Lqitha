"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Circle, MessageSquare } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification.actions";
import { getMessageNotifications, type MessageNotif } from "@/actions/message-notifications.actions";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher.client";
import { useChatContext } from "@/context/ChatContext";
import { useStreamChat } from "@/components/providers/StreamChatProvider";
import type { Dictionary } from "@/lib/dictionary.types";
import { Event } from "stream-chat";
import Image from "next/image";

// Since we cannot use Prisma types reliably on frontend if it exports node modules,
// we define local types based on Prisma schema:
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

function fillTemplate(template: string, placeholder: string, value: string) {
  return template.replace(placeholder, value);
}

function extractItemTitleFromBrokenMessage(message: string) {
  const matches = [...message.matchAll(/[\"']([^\"']+)[\"']/g)];
  const candidate = matches.at(-1)?.[1]?.trim();

  if (!candidate) return null;
  if (candidate === "{itemTitle}" || candidate === "{claim.item.title}") {
    return null;
  }

  return candidate;
}

export default function NotificationBell({ userId, dict }: { userId: string; dict: Dictionary }) {
  const t = dict.ui;
  const toast = dict.Toast;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "messages">("claims");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Message notifications state
  const [messageNotifs, setMessageNotifs] = useState<MessageNotif[]>([]);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasFetchedNotificationsRef = useRef(false);
  const hasFetchedMessagesRef = useRef(false);
  const unreadCountRef = useRef(0);
  const messageUnreadCountRef = useRef(0);
  const router = useRouter();
  const { openChat } = useChatContext();
  const { client: streamClient } = useStreamChat();

  const normalizeNotification = useCallback((notif: Notification): Notification => {
    const itemTitle = extractItemTitleFromBrokenMessage(notif.message);

    if (notif.type === "CLAIM_ACCEPTED") {
      return {
        ...notif,
        title: toast.claimAccNotificationTitle,
        message: itemTitle
          ? fillTemplate(
              toast.claimAccNotificationMsg,
              "{claim.item.title}",
              itemTitle,
            )
          : toast.claimAccNotificationMsg,
      };
    }

    if (notif.type === "CLAIM_REJECTED") {
      return {
        ...notif,
        title: toast.claimRejNotificationTitle,
        message: itemTitle
          ? fillTemplate(
              toast.claimRejNotificationMsg,
              "{claim.item.title}",
              itemTitle,
            )
          : toast.claimRejNotificationMsg,
      };
    }

    if (notif.type === "CLAIM_NEW") {
      return {
        ...notif,
        title: toast.claimNotificationTitle,
        message: itemTitle
          ? fillTemplate(
              toast.claimNotificationMsg,
              "{itemTitle}",
              itemTitle,
            )
          : toast.claimNotificationMsg,
      };
    }

    return notif;
  }, [toast]);

  // ─── Audio helpers ───────────────────────────────────────────────

  const getAudioContextCtor = () => {
    if (typeof window === "undefined") return null;
    return window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
  };

  const primeAudio = useCallback(() => {
    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume().catch(() => {
        // Ignore blocked audio resume.
      });
    }
  }, []);

  /** Claims notification sound — 3-note ascending chime */
  const playClaimNotificationSound = useCallback(async () => {
    try {
      const AudioContextCtor = getAudioContextCtor();
      if (!AudioContextCtor) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") return;

      const now = ctx.currentTime;

      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.setValueAtTime(2600, now);
      masterFilter.Q.setValueAtTime(0.5, now);

      const warmthFilter = ctx.createBiquadFilter();
      warmthFilter.type = "peaking";
      warmthFilter.frequency.setValueAtTime(620, now);
      warmthFilter.Q.setValueAtTime(0.9, now);
      warmthFilter.gain.setValueAtTime(4, now);

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-26, now);
      compressor.knee.setValueAtTime(24, now);
      compressor.ratio.setValueAtTime(2.5, now);
      compressor.attack.setValueAtTime(0.002, now);
      compressor.release.setValueAtTime(0.28, now);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.34, now + 0.035);
      masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.42);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
      masterGain.connect(warmthFilter);
      warmthFilter.connect(masterFilter);
      masterFilter.connect(compressor);
      compressor.connect(ctx.destination);

      const notes = [
        { frequency: 392.0, startOffset: 0, duration: 1.05, gain: 0.95 },
        { frequency: 523.25, startOffset: 0.09, duration: 0.9, gain: 0.78 },
        { frequency: 659.25, startOffset: 0.2, duration: 0.78, gain: 0.56 },
      ];

      notes.forEach(({ frequency, startOffset, duration, gain }) => {
        const bodyOscillator = ctx.createOscillator();
        const shimmerOscillator = ctx.createOscillator();
        const airOscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const noteStart = now + startOffset;
        const noteEnd = noteStart + duration;

        bodyOscillator.type = "triangle";
        shimmerOscillator.type = "sine";
        airOscillator.type = "triangle";

        bodyOscillator.frequency.setValueAtTime(frequency, noteStart);
        shimmerOscillator.frequency.setValueAtTime(frequency * 2, noteStart);
        airOscillator.frequency.setValueAtTime(frequency * 1.5, noteStart);

        bodyOscillator.frequency.exponentialRampToValueAtTime(
          frequency * 0.992,
          noteEnd,
        );
        shimmerOscillator.frequency.exponentialRampToValueAtTime(
          frequency * 1.985,
          noteEnd,
        );
        airOscillator.frequency.exponentialRampToValueAtTime(
          frequency * 1.49,
          noteEnd,
        );

        gainNode.gain.setValueAtTime(0.0001, noteStart);
        gainNode.gain.exponentialRampToValueAtTime(
          0.34 * gain,
          noteStart + 0.03,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          noteEnd,
        );

        bodyOscillator.connect(gainNode);
        shimmerOscillator.connect(gainNode);
        airOscillator.connect(gainNode);
        gainNode.connect(masterGain);
        bodyOscillator.start(noteStart);
        shimmerOscillator.start(noteStart);
        airOscillator.start(noteStart);
        bodyOscillator.stop(noteEnd + 0.03);
        shimmerOscillator.stop(noteEnd + 0.03);
        airOscillator.stop(noteEnd + 0.03);
      });
    } catch (error) {
      console.error("Failed to play claim notification sound:", error);
    }
  }, []);

  /** Message notification sound — gentle single-tone "pop" */
  const playMessageNotificationSound = useCallback(async () => {
    try {
      const AudioContextCtor = getAudioContextCtor();
      if (!AudioContextCtor) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") return;

      const now = ctx.currentTime;

      // A soft, warm pop — single tone with subtle harmonic
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
      masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(0.7, now);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Primary tone — warm sine
      const primary = ctx.createOscillator();
      primary.type = "sine";
      primary.frequency.setValueAtTime(880, now);
      primary.frequency.exponentialRampToValueAtTime(660, now + 0.3);

      const primaryGain = ctx.createGain();
      primaryGain.gain.setValueAtTime(0.5, now);
      primaryGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      primary.connect(primaryGain);
      primaryGain.connect(masterGain);
      primary.start(now);
      primary.stop(now + 0.55);

      // Subtle harmonic overtone
      const harmonic = ctx.createOscillator();
      harmonic.type = "sine";
      harmonic.frequency.setValueAtTime(1320, now);
      harmonic.frequency.exponentialRampToValueAtTime(990, now + 0.2);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.15, now);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      harmonic.connect(harmonicGain);
      harmonicGain.connect(masterGain);
      harmonic.start(now);
      harmonic.stop(now + 0.4);
    } catch (error) {
      console.error("Failed to play message notification sound:", error);
    }
  }, []);

  // ─── Fetch helpers ───────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (data.notifications) {
        const normalizedNotifications = data.notifications.map(normalizeNotification);
        const nextUnreadCount = data.unreadCount || 0;
        if (
          hasFetchedNotificationsRef.current &&
          nextUnreadCount > unreadCountRef.current
        ) {
          void playClaimNotificationSound();
        }

        setNotifications(normalizedNotifications);
        setUnreadCount(nextUnreadCount);
        unreadCountRef.current = nextUnreadCount;
        hasFetchedNotificationsRef.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [normalizeNotification, playClaimNotificationSound]);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessageNotifications();
      const nextMessageUnread = data.unreadCount || 0;

      if (
        hasFetchedMessagesRef.current &&
        nextMessageUnread > messageUnreadCountRef.current
      ) {
        void playMessageNotificationSound();
      }

      setMessageNotifs(data.messages);
      setMessageUnreadCount(nextMessageUnread);
      messageUnreadCountRef.current = nextMessageUnread;
      hasFetchedMessagesRef.current = true;
    } catch (error) {
      console.error("Failed to fetch message notifications:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [playMessageNotificationSound]);

  // ─── Effects ─────────────────────────────────────────────────────

  useEffect(() => {
    void fetchNotifications();
    void fetchMessages();

    const unlockAudio = () => {
      primeAudio();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
      void fetchMessages();
    }, 10000);

    const handleFocus = () => {
      void fetchNotifications();
      void fetchMessages();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
        void fetchMessages();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (pusherClient && userId) {
      try {
        const channel = pusherClient.subscribe(`user-${userId}`);
        channel.bind("new-notification", (newNotif: Notification) => {
          const normalizedNotification = normalizeNotification(newNotif);
          setNotifications((prev) => [normalizedNotification, ...prev]);
          setUnreadCount((prev) => {
            const nextCount = prev + 1;
            unreadCountRef.current = nextCount;
            return nextCount;
          });
          hasFetchedNotificationsRef.current = true;
          void playClaimNotificationSound();
        });
      } catch (error) {
        console.error("Failed to subscribe to notifications channel:", error);
      }
    }

    // ─── Stream Chat Real-time Synchronization ───
    const handleEvent = (event: Event) => {
      // Refresh messages for relevant events
      const relevantEvents = [
        "message.new",
        "notification.message_new",
        "message.read",
        "message.updated",
        "message.deleted",
        "notification.mark_read"
      ];

      if (relevantEvents.includes(event.type!)) {
        // Add a small delay for server consistency if needed, 
        // but "no gap" suggests we should try immediately.
        void fetchMessages();
        
        // Play sound for new incoming messages only
        if (event.type === "notification.message_new" || (event.type === "message.new" && event.user?.id !== userId)) {
          void playMessageNotificationSound();
        }
      }
    };

    if (streamClient) {
      streamClient.on(handleEvent);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
      document.removeEventListener("mousedown", handleClickOutside);
      if (streamClient) {
        streamClient.off(handleEvent);
      }
      if (pusherClient && userId) {
        pusherClient.unsubscribe(`user-${userId}`);
      }
    };
  }, [userId, fetchNotifications, fetchMessages, normalizeNotification, playClaimNotificationSound, playMessageNotificationSound, primeAudio, streamClient]);

  useEffect(() => {
    if (!isOpen) return;

    const positionPanel = () => {
      if (!panelRef.current) return;
      const viewportPadding = 8;
      // Always measure from the unshifted base state to avoid drift on repeated scroll updates.
      panelRef.current.style.transform = "translateX(-50%)";
      const rect = panelRef.current.getBoundingClientRect();

      let shift = 0;
      if (rect.left < viewportPadding) {
        shift = viewportPadding - rect.left;
      } else if (rect.right > window.innerWidth - viewportPadding) {
        shift = window.innerWidth - viewportPadding - rect.right;
      }

      panelRef.current.style.transform = `translateX(calc(-50% + ${shift}px))`;
    };

    const rafId = window.requestAnimationFrame(positionPanel);
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [isOpen]);

  // ─── Handlers ────────────────────────────────────────────────────

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id);
        setUnreadCount((prev) => {
          const nextCount = Math.max(0, prev - 1);
          unreadCountRef.current = nextCount;
          return nextCount;
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMessageClick = (msg: MessageNotif) => {
    setIsOpen(false);
    openChat({
      channelId: msg.channelId,
      userId,
      userName: msg.otherUserName,
      userImage: msg.otherUserImage,
    });
  };

  const handleMarkAllRead = async () => {
    if (activeTab === "claims") {
      try {
        await markAllAsRead();
        setUnreadCount(0);
        unreadCountRef.current = 0;
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
      }
    }
    // For messages, there's no server-side "mark all read" since it's Stream Chat
    // Users should open individual conversations to mark them as read
  };

  // ─── Render helpers ──────────────────────────────────────────────

  const totalUnread = unreadCount + messageUnreadCount;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CLAIM_NEW":
        return <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>;
      case "CLAIM_ACCEPTED":
        return <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>;
      case "CLAIM_REJECTED":
        return <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0"><Circle className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "now";
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // ─── JSX ─────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
        aria-label={t.notifications}
      >
        <Bell className="w-5 h-5" strokeWidth={2} />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary/35 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-red-500 rounded-full border border-background flex items-center justify-center text-xs font-bold text-white font-interface ltr:-right-1 rtl:-left-1">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-1/2 -translate-x-1/3 rtl:md:translate-x-6/4  mt-4 w-[min(22rem,calc(90vw-1rem))] md:w-88 md:max-w-[calc(100vw-1rem)] bg-background border border-primary/15 rounded-sm shadow-2xl z-50 overflow-visible origin-top transition-colors duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-card/50">
            <h3 className="font-interface text-sm font-semibold text-foreground tracking-widest uppercase">{t.notifications}</h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("claims")}
              className={`flex-1 py-2.5 text-xs font-interface font-medium tracking-widest uppercase transition-colors relative ${
                activeTab === "claims"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t.claimsTab}
                {unreadCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {activeTab === "claims" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 py-2.5 text-xs font-interface font-medium tracking-widest uppercase transition-colors relative ${
                activeTab === "messages"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t.messagesTab}
                {messageUnreadCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none">
                    {messageUnreadCount > 9 ? "9+" : messageUnreadCount}
                  </span>
                )}
              </span>
              {activeTab === "messages" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[min(60vh,400px)] overflow-y-auto">
            {/* Claims Tab */}
            {activeTab === "claims" && (
              <>
                {isLoading ? (
                  <div className="p-6 text-center text-muted-foreground text-xs font-interface animate-pulse">
                    {t.loadingNotifications}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs font-interface">
                    {t.noNotifications}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-primary/5 cursor-pointer hover:bg-primary/5 transition-colors flex gap-3 ${
                          !notif.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        {getTypeIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm font-interface truncate ${!notif.isRead ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {notif.title}
                            </p>
                            {!notif.isRead && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2 uppercase tracking-widest font-interface">
                            {formatDate(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="p-4 text-xs text-primary hover:bg-primary/5 transition-colors font-interface uppercase tracking-widest text-center border-t border-primary/5"
                      >
                        {t.markAllAsRead}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <>
                {isLoadingMessages ? (
                  <div className="p-6 text-center text-muted-foreground text-xs font-interface animate-pulse">
                    {t.loadingMessages}
                  </div>
                ) : messageNotifs.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs font-interface">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {t.noMessages}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {messageNotifs.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleMessageClick(msg)}
                        className={`p-4 border-b border-primary/5 cursor-pointer hover:bg-primary/5 transition-colors flex gap-3 ${
                          !msg.isRead ? "bg-blue-500/5" : ""
                        }`}
                      >
                        {/* Avatar with online indicator */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/15 bg-primary/10 flex items-center justify-center">
                            {msg.otherUserImage ? (
                              <Image
                                src={msg.otherUserImage}
                                width={40}
                                height={40}
                                alt={msg.otherUserName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-display text-primary">
                                {msg.otherUserName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {msg.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm font-interface truncate ${!msg.isRead ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {msg.otherUserName}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 font-interface uppercase tracking-wider whitespace-nowrap shrink-0">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                          </div>
                          {msg.itemTitle && (
                            <p className="text-[10px] text-primary/60 font-interface uppercase tracking-widest mt-0.5 truncate">
                              {msg.itemTitle}
                            </p>
                          )}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {/* Check marks for all messages */}
                              <span className={`shrink-0 ${
                                (msg.isSentByMe ? msg.isReadByOther : msg.isRead) 
                                  ? "text-blue-400" 
                                  : "text-slate-400"
                              }`}>
                                {(msg.isSentByMe ? msg.isReadByOther : msg.isRead) ? (
                                  <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </span>
                              <p className={`text-xs truncate leading-relaxed ${!msg.isRead ? "text-foreground/90 font-medium" : "text-muted-foreground"}`}>
                                {msg.preview}
                              </p>
                            </div>
                        </div>

                        {/* Unread dot */}
                        {!msg.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
