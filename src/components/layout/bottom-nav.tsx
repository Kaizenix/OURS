'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Sun, Image as ImageIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/home', label: 'Beranda', icon: Home },
  { href: '/chat', label: 'Obrolan', icon: MessageCircle },
  { href: '/daily', label: 'Harian', icon: Sun },
  { href: '/memories', label: 'Kenangan', icon: ImageIcon },
  { href: '/us', label: 'Kita', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-t border-border/40 bg-background/95 backdrop-blur-md select-none touch-manipulation shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1 h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/home' && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all active:scale-95',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.6} />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span className="text-[10px] leading-tight tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
