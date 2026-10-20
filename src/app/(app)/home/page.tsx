import { getHomeDashboardData } from '@/features/home/actions';
import { getLatestSnap } from '@/features/locket/actions';
import { HeroSection } from '@/features/home/components/hero-section';
import { WhatsAppChatCard } from '@/features/home/components/whatsapp-chat-card';
import { LocketWidget } from '@/features/locket/components/locket-widget';
import { PartnerMoodCard } from '@/features/home/components/partner-mood-card';
import { LittleNoteCard } from '@/features/home/components/little-note-card';
import { TodayQuestionCard } from '@/features/home/components/today-question-card';
import { NextDateCard } from '@/features/home/components/next-date-card';
import { RecentMemoryCard } from '@/features/home/components/recent-memory-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [data, latestSnap] = await Promise.all([
    getHomeDashboardData(),
    getLatestSnap(),
  ]);

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        Memuat ruang kita...
      </div>
    );
  }

  const {
    userProfile,
    partnerProfile,
    couple,
    partnerCheckin,
    littleNote,
    todayQuestion,
    nextEvent,
    recentMemory,
    latestMessage,
    unreadCount,
  } = data;

  return (
    <div className="max-w-4xl mx-auto px-3.5 py-4 md:px-8 md:py-6 space-y-4 md:space-y-6">
      {/* 1. Greeting & Couple Hero */}
      <HeroSection
        userProfile={userProfile}
        partnerProfile={partnerProfile}
        couple={couple}
      />

      {/* 2. WhatsApp-Style Direct Chat Card */}
      <WhatsAppChatCard
        partnerProfile={partnerProfile}
        latestMessage={latestMessage}
        unreadCount={unreadCount}
      />

      {/* 3. Locket Widget (Live Instant Photo / Instagram-style Snap) */}
      <LocketWidget
        coupleId={couple.id}
        initialSnap={latestSnap}
        userProfile={userProfile}
        partnerProfile={partnerProfile}
      />

      {/* 4. Grid of cards: Suasana Hati Pasangan & Relationship Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5">
        {/* Partner Mood from latest check-in */}
        <PartnerMoodCard
          partnerProfile={partnerProfile}
          partnerCheckin={partnerCheckin}
        />

        {/* Little Note (Sealed envelope micro-interaction) */}
        <LittleNoteCard note={littleNote} />

        {/* Today's Question status & preview */}
        <TodayQuestionCard todayQuestion={todayQuestion} />

        {/* Next Special Moment / Date countdown */}
        <NextDateCard nextEvent={nextEvent} />
      </div>

      {/* 5. Full-width: Recent Memory */}
      <div className="w-full">
        <RecentMemoryCard memory={recentMemory} />
      </div>
    </div>
  );
}
