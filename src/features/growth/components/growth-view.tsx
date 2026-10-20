'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  UtensilsCrossed,
  Target,
  MessageSquareHeart,
  CalendarCheck,
} from 'lucide-react';
import type { GrowthMetrics } from '@/features/growth/actions';

interface GrowthViewProps {
  metrics: GrowthMetrics;
}

export function GrowthView({ metrics }: GrowthViewProps) {
  const items = [
    {
      title: 'Daily Questions Answered',
      value: metrics.questionsAnswered,
      subtitle: 'honest reflections shared with each other',
      icon: HelpCircle,
    },
    {
      title: 'Memories Saved',
      value: metrics.memoriesSaved,
      subtitle: 'moments and milestones in our digital scrapbook',
      icon: ImageIcon,
    },
    {
      title: 'Dates Completed',
      value: metrics.datesCompleted,
      subtitle: 'special evenings, walks, and dedicated time together',
      icon: UtensilsCrossed,
    },
    {
      title: 'Shared Goals Achieved',
      value: metrics.goalsAchieved,
      subtitle: 'dreams and bucket list plans checked off as a team',
      icon: Target,
    },
    {
      title: 'Meaningful Talks Held',
      value: metrics.conversationsHeld,
      subtitle: 'conversations navigated with care and perspective',
      icon: MessageSquareHeart,
    },
    {
      title: 'Daily Check-ins Recorded',
      value: metrics.checkinsRecorded,
      subtitle: 'days of listening to each other\'s energy and needs',
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Back to Us */}
      <Link
        href="/us"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Us</span>
      </Link>

      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-primary" />
          Meaningful Progress
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
          Things You&apos;ve Built Together
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
          A relationship isn&apos;t a test score. It&apos;s built from everyday attention, honest answers, and shared memories.
        </p>
      </div>

      {/* Duration banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-surface/80 border border-border/40 backdrop-blur-sm text-center space-y-1 shadow-xs"
      >
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Together in This Space
        </span>
        <p className="text-2xl sm:text-3xl font-serif text-foreground font-medium">
          {metrics.durationFormatted}
        </p>
      </motion.div>

      {/* Grid of accomplishments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-3xl bg-surface/70 border border-border/40 backdrop-blur-sm shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-card border border-border/30 flex items-center justify-center text-primary shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-2xl font-serif font-semibold text-foreground">
                  {item.value}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
