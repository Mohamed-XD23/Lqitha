"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, Circle } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification.actions";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";

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
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    const data = await getNotifications();
    if (data.notifications) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount || 0);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (pusherClient && userId) {
      const channel = pusherClient.subscribe(`user-${userId}`);
      channel.bind("new-notification", (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (pusherClient && userId) {
        pusherClient.unsubscribe(`user-${userId}`);
      }
    };
  }, [userId, fetchNotifications]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border border-obsidian flex items-center justify-center text-[10px] font-bold text-white font-interface ltr:right-[-4px] rtl:left-[-4px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-80 bg-obsidian border border-gold/15 rounded-sm shadow-2xl z-50 overflow-hidden transform ltr:origin-top-right rtl:origin-top-left transition-all">
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

          <div className="max-h-[400px] overflow-y-auto">
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
                      <p className="text-[10px] text-slate/60 mt-2 uppercase tracking-widest font-interface">
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
