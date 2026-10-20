'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';
import type { QuestionBankItem, DailyAnswer } from '@/types/database';

interface TodayQuestionCardProps {
  todayQuestion: {
    id: string;
    question: QuestionBankItem;
    userAnswer: DailyAnswer | null;
    partnerAnswer: DailyAnswer | null;
    isRevealed: boolean;
  } | null;
}

export function TodayQuestionCard({ todayQuestion }: TodayQuestionCardProps) {
  if (!todayQuestion) {
    return (
      <div className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Daily Question
        </span>
        <p className="text-sm text-muted-foreground my-4">
          No question assigned for today yet.
        </p>
      </div>
    );
  }

  const { question, userAnswer, isRevealed } = todayQuestion;
  const hasUserAnswered = Boolean(userAnswer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            Today&apos;s Question
          </span>
          <span className="text-[11px] capitalize px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground font-medium">
            {question.category?.replace(/_/g, ' ') || 'Connection'}
          </span>
        </div>

        <p className="text-base sm:text-lg font-serif text-foreground font-medium leading-snug my-2">
          &ldquo;{question.question}&rdquo;
        </p>

        {/* Status display */}
        <div className="mt-4">
          {isRevealed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Both answered — answers revealed!</span>
            </div>
          ) : hasUserAnswered ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>You answered. Waiting for partner</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Awaiting your answer</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border/30">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <span>{isRevealed ? 'View & discuss answers' : hasUserAnswered ? 'View your answer' : 'Answer today\'s question'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
