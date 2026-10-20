'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, HelpCircle, Sparkles } from 'lucide-react';
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:px-6 md:py-6 space-y-5 select-none">
      {/* Top Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-surface/80 border border-border/40">
          <button
            onClick={() => setActiveTab('question')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'question'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pertanyaan Hari Ini</span>
            {todayQuestion?.isRevealed && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'checkin'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Kondisi Harian</span>
            {userCheckin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'question' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {todayQuestion ? (
            <QuestionSection
              todayQuestion={todayQuestion}
              userProfile={userProfile}
              partnerProfile={partnerProfile}
            />
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground bg-card/40 rounded-3xl border border-border/40">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <p>Belum ada pertanyaan aktif untuk hari ini.</p>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'checkin' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Partner's Check-in card if available */}
          <PartnerCheckinDisplay
            partnerProfile={partnerProfile}
            partnerCheckin={partnerCheckin}
          />

          {/* User's own check-in form */}
          <div className="pt-2">
            <div className="mb-3 px-1">
              <h3 className="font-serif text-lg font-medium">Kondisi Anda Hari Ini</h3>
              <p className="text-xs text-muted-foreground">
                Bagikan perasaan, tingkat energi, dan apa yang Anda butuhkan secara jujur.
              </p>
            </div>
            <CheckinForm existingCheckin={userCheckin} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
