'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Sparkles, Heart, Mail, CheckCircle2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types/database';
import { formatDatePretty, formatTimePretty } from '@/lib/date-utils';
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/features/notifications/actions';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await getNotificationsAction();
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifs();
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationReadAction(id);
    } catch {
      // revert if error
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsReadAction();
    } catch {
      // revert if error
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="relative p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-surface/80 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </SheetTrigger>
      <SheetContent className="rounded-l-3xl p-6 bg-surface border-border/50 flex flex-col justify-between max-w-sm">
        <div>
          <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-serif text-foreground">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-[11px] text-primary h-7 px-2 gap-1 rounded-xl"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </Button>
            )}
          </SheetHeader>

          <div className="py-4 space-y-3 overflow-y-auto max-h-[75vh]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Heart className="w-8 h-8 mx-auto opacity-30 text-primary" />
                <p className="text-xs">No notifications right now.</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Updates on notes, check-ins, and questions will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !n.is_read
                      ? 'bg-primary/10 border-primary/30 text-foreground'
                      : 'bg-card/40 border-border/20 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium text-foreground">{n.title}</span>
                    <span className="text-[10px] opacity-70">
                      {formatTimePretty(n.created_at)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-xs text-secondary-foreground/90 font-serif line-clamp-2">
                      {n.body}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
