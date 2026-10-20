'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Sun, Image, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from 'cn';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/daily', label: 'Daily', icon: Sun },
  { href: '/memories', label: 'Memories', icon: Image },
  { href: '/us', label: 'Us', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-t border-border/50 bg-surface/80 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="size-5" strokeWidth={isActive ? 2 : 1.5} />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
