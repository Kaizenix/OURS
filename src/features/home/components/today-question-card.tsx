'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquareQuote, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
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
  const answeredCount = (todayQuestion?.userAnswer ? 1 : 0) + (todayQuestion?.partnerAnswer ? 1 : 0);
  const isBothAnswered = todayQuestion?.isRevealed ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Pertanyaan Hari Ini
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
            {isBothAnswered ? (
              <span className="text-emerald-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Terbuka Berdua
              </span>
            ) : answeredCount === 1 ? (
              <span className="text-amber-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                1 sudah menjawab
              </span>
            ) : (
              <span>Menunggu jawaban</span>
            )}
          </div>
        </div>

        <div className="bg-card/60 rounded-2xl p-3.5 border border-border/30 my-2">
          <div className="flex items-start gap-2.5">
            <MessageSquareQuote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-serif text-foreground leading-relaxed line-clamp-3">
              {todayQuestion?.question?.question ||
                'Apa satu hal sederhana yang aku lakukan baru-baru ini yang membuatmu merasa sangat dicintai?'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/20 flex justify-end">
        <Link
          href="/daily"
          className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
        >
          <span>{isBothAnswered ? 'Lihat Jawaban' : 'Jawab Sekarang'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
