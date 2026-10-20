'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { NotificationBell } from '@/features/notifications/components/notifications-sheet';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useCoupleContext } from './app-shell';

export function TopHeader() {
  const { profile } = useCoupleContext();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 bg-background/80 backdrop-blur-md border-b border-border/40">
      <Link href="/home" className="flex items-center gap-2">
        <span className="font-serif text-lg tracking-[0.15em] font-semibold text-foreground">
          OURS
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <Link
          href="/us/profile"
          className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-serif text-primary border border-primary/30 overflow-hidden ml-1"
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{profile.display_name?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
