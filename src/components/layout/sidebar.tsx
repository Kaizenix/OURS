'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  MessageCircle,
  Sun,
  Image,
  Users,
  Target,
  Calendar,
  StickyNote,
  BookOpen,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { cn } from 'cn';
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
  { href: '/home', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/daily', label: 'Daily', icon: Sun },
  { href: '/memories', label: 'Memories', icon: Image },
  { href: '/us', label: 'Us', icon: Users },
];

const secondaryNavItems: NavItem[] = [
  { href: '/us/goals', label: 'Goals', icon: Target },
  { href: '/us/calendar', label: 'Calendar', icon: Calendar },
  { href: '/us/notes', label: 'Notes', icon: StickyNote },
  { href: '/us/journal', label: 'Journal', icon: BookOpen },
  { href: '/us/talk', label: 'Talk', icon: MessageSquare },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      <Icon className="size-4" strokeWidth={isActive ? 2 : 1.5} />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useCoupleContext();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="w-64 border-r border-border/50 bg-surface flex flex-col h-dvh sticky top-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-serif font-semibold tracking-wide">
          OURS
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Divider */}
        <div className="pt-4 pb-2">
          <div className="border-t border-border/50" />
        </div>

        {/* Secondary Nav */}
        <p className="px-3 pb-1 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          Together
        </p>
        {secondaryNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            {profile.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile.display_name ?? 'You'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
