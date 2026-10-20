'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { BottomNav } from './bottom-nav';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';
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
}

export function AppShell({ children, profile, couple, coupleId, partner }: AppShellProps) {
  return (
    <CoupleContext.Provider value={{ profile, couple, coupleId, partner }}>
      <div className="min-h-dvh flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-dvh">
          {/* Mobile Top Header */}
          <TopHeader />

          <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
            {children}
          </div>

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <BottomNav />
          </div>
        </main>
      </div>
    </CoupleContext.Provider>
  );
}
