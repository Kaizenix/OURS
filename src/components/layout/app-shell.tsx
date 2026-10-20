'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';
import { DailyLoginModal } from '@/components/shared/daily-login-modal';
import type { Profile, Couple } from '@/types/database';

interface CoupleContextType {
  profile: Profile;
  couple: Couple;
  coupleId: string;
  partner: Profile | null;
}

const CoupleContext = createContext<CoupleContextType | null>(null);

export function useCoupleContext() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCoupleContext must be used within AppShell');
  return ctx;
}

interface AppShellProps {
  children: ReactNode;
  profile: Profile;
  couple: Couple;
  coupleId: string;
  partner: Profile | null;
  dailyLoginData?: {
    todayQuestion: any;
    hasCheckedInToday: boolean;
  } | null;
}

export function AppShell({ children, profile, couple, coupleId, partner, dailyLoginData }: AppShellProps) {
  return (
    <CoupleContext.Provider value={{ profile, couple, coupleId, partner }}>
      <div className="h-dvh w-full flex overflow-hidden bg-background text-foreground select-none touch-manipulation">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Top Header */}
          <TopHeader />

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain pb-20 md:pb-4 will-change-scroll">
            {children}
          </div>

          {/* Daily Check-in & Question Pop-up Modal */}
          {dailyLoginData && (
            <DailyLoginModal
              todayQuestion={dailyLoginData.todayQuestion}
              hasCheckedInToday={dailyLoginData.hasCheckedInToday}
            />
          )}

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
            <BottomNav />
          </div>
        </main>
      </div>
    </CoupleContext.Provider>
  );
}
