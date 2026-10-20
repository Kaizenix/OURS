'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  MessageCircle,
  Sun,
  Image as ImageIcon,
  Users,
  Target,
  Calendar,
  StickyNote,
  BookOpen,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoupleContext } from './app-shell';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { NotificationBell } from '@/features/notifications/components/notifications-sheet';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  { href: '/home', label: 'Beranda', icon: Home },
  { href: '/daily', label: 'Harian', icon: Sun },
  { href: '/memories', label: 'Kenangan', icon: ImageIcon },
  { href: '/us', label: 'Kita', icon: Users },
];

const secondaryNavItems: NavItem[] = [
  { href: '/chat', label: 'WhatsApp Chat', icon: MessageCircle },
  { href: '/us/goals', label: 'Mimpi Bersama', icon: Target },
  { href: '/us/calendar', label: 'Kalender', icon: Calendar },
  { href: '/us/notes', label: 'Surat Kecil', icon: StickyNote },
  { href: '/us/journal', label: 'Catatan Hati', icon: BookOpen },
  { href: '/us/talk', label: 'Ruang Bicara', icon: MessageSquare },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || (item.href !== '/home' && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, coupleId } = useCoupleContext();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 border-r border-border/40 bg-card/60 flex flex-col justify-between p-4 h-dvh sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-4 mb-4">
          <Link href="/home" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold tracking-[0.15em] text-foreground">
              OURS
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* Main Nav */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Separator */}
        <div className="my-4 border-t border-border/30" />

        {/* Sub Features */}
        <div className="px-3 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Ruang Cerita
          </span>
        </div>
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-border/30 pt-4">
        <div className="flex items-center justify-between px-2">
          <Link
            href="/us/profile"
            className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center font-serif text-sm font-medium overflow-hidden shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'Profil'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(profile.display_name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {profile.display_name || 'Saya'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Lihat profil
              </p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted/40 transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
