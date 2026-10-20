'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, Users, Trash2, Calendar } from 'lucide-react';
import type { Journal } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';
import { deleteJournalAction } from '@/features/journal/actions';

interface JournalCardProps {
  journal: Journal;
}

export function JournalCard({ journal }: JournalCardProps) {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    setIsDeleted(true);
    try {
      await deleteJournalAction(journal.id);
    } catch {
      setIsDeleted(false);
    }
  };

  if (isDeleted) return null;

  const isPrivate = journal.visibility === 'private';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-5 sm:p-6 backdrop-blur-sm shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                isPrivate
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              {isPrivate ? <Lock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              <span>{isPrivate ? 'Private to You' : 'Shared with Both'}</span>
            </span>

            {journal.mood && (
              <span className="text-[11px] text-muted-foreground capitalize italic">
                feeling {journal.mood}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {formatDatePretty(journal.created_at)}
            </span>
            <button
              onClick={handleDelete}
              className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-serif font-medium text-foreground tracking-tight">
          {journal.title}
        </h3>

        <p className="text-xs sm:text-sm text-secondary-foreground/90 font-serif leading-relaxed mt-2 whitespace-pre-line">
          {journal.content}
        </p>
      </div>
    </motion.div>
  );
}
