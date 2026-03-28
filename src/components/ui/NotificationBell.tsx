"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, Circle } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification.actions";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher.client";

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

export default function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasFetchedNotificationsRef = useRef(false);
  const unreadCountRef = useRef(0);
  const router = useRouter();

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

  const playNotificationSound = useCallback(async () => {
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
      console.error("Failed to play notification sound:", error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (data.notifications) {
        const nextUnreadCount = data.unreadCount || 0;
        if (
          hasFetchedNotificationsRef.current &&
          nextUnreadCount > unreadCountRef.current
        ) {
          void playNotificationSound();
        }

        setNotifications(data.notifications);
        setUnreadCount(nextUnreadCount);
        unreadCountRef.current = nextUnreadCount;
        hasFetchedNotificationsRef.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playNotificationSound]);

  useEffect(() => {
    void fetchNotifications();
    const unlockAudio = () => {
      primeAudio();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, 10000);

    const handleFocus = () => {
      void fetchNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (pusherClient && userId) {
      try {
        const channel = pusherClient.subscribe(`user-${userId}`);
        channel.bind("new-notification", (newNotif: Notification) => {
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => {
            const nextCount = prev + 1;
            unreadCountRef.current = nextCount;
            return nextCount;
          });
          hasFetchedNotificationsRef.current = true;
          void playNotificationSound();
        });
      } catch (error) {
        console.error("Failed to subscribe to notifications channel:", error);
      }
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
      if (pusherClient && userId) {
        pusherClient.unsubscribe(`user-${userId}`);
      }
    };
  }, [userId, fetchNotifications, playNotificationSound, primeAudio]);

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

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      unreadCountRef.current = 0;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CLAIM_NEW":
        return <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>;
      case "CLAIM_ACCEPTED":
        return <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>;
      case "CLAIM_REJECTED":
        return <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0"><Circle className="w-4 h-4" /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate hover:text-gold transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={2} />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gold/35 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border border-obsidian flex items-center justify-center text-xs font-bold text-white font-interface ltr:right-[-4px] rtl:left-[-4px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-1/2 mt-2 w-[min(20rem,calc(90vw-1rem))] md:w-80 md:max-w-[calc(100vw-1rem)] bg-obsidian border border-gold/15 rounded-sm shadow-2xl z-50 overflow-visible origin-top transition-all"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="p-4 border-b border-gold/10 flex justify-between items-center bg-void/50">
            <h3 className="font-interface text-sm font-semibold text-ivory tracking-widest uppercase">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-gold hover:text-ivory transition-colors font-interface"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,400px)] overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-slate text-xs font-interface animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate text-xs font-interface">
                No notifications yet
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-gold/5 cursor-pointer hover:bg-gold/5 transition-colors flex gap-3 ${
                      !notif.isRead ? "bg-gold/5" : ""
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-interface truncate ${!notif.isRead ? "text-ivory font-medium" : "text-slate"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate/60 mt-2 uppercase tracking-widest font-interface">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
