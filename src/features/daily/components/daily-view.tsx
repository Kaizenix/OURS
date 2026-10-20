'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, HeartHandshake, HelpCircle } from 'lucide-react';
import type { DailyPageData } from '@/features/daily/actions';
import { CheckinForm } from './checkin-form';
import { PartnerCheckinDisplay } from './partner-checkin-display';
import { QuestionSection } from './question-section';

interface DailyViewProps {
  data: DailyPageData;
}

export function DailyView({ data }: DailyViewProps) {
  const [activeTab, setActiveTab] = useState<'question' | 'checkin'>('question');

  const {
    userProfile,
    partnerProfile,
    userCheckin,
    partnerCheckin,
    todayQuestion,
  } = data;

  const partnerName = partnerProfile?.display_name || 'Partner';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      {/* Top Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface/80 border border-border/40 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('question')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'question'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Today&apos;s Question</span>
            {todayQuestion?.isRevealed && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'checkin'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Daily Check-in</span>
            {userCheckin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'question' && (
        <motion.div
          key="question-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {todayQuestion ? (
            <QuestionSection
              todayQuestion={todayQuestion}
              userProfile={userProfile}
              partnerProfile={partnerProfile}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground rounded-3xl bg-surface/50 border border-border/40">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No question available for today yet.</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'checkin' && (
        <motion.div
          key="checkin-tab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Partner's condition card */}
          <PartnerCheckinDisplay
            partnerProfile={partnerProfile}
            partnerCheckin={partnerCheckin}
          />

          {/* User's own check-in form */}
          <CheckinForm existingCheckin={userCheckin} />
        </motion.div>
      )}
    </div>
  );
}
