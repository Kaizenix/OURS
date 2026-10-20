import { getHomeDashboardData } from '@/features/home/actions';
import { HeroSection } from '@/features/home/components/hero-section';
import { PartnerMoodCard } from '@/features/home/components/partner-mood-card';
import { LittleNoteCard } from '@/features/home/components/little-note-card';
import { TodayQuestionCard } from '@/features/home/components/today-question-card';
import { NextDateCard } from '@/features/home/components/next-date-card';
import { RecentMemoryCard } from '@/features/home/components/recent-memory-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomeDashboardData();

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading our space...
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
  } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* 1. Greeting & Couple Hero */}
      <HeroSection
        userProfile={userProfile}
        partnerProfile={partnerProfile}
        couple={couple}
      />

      {/* 2. Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* 3. Full-width or featured: Recent Memory */}
      <div className="w-full">
        <RecentMemoryCard memory={recentMemory} />
      </div>
    </div>
  );
}
