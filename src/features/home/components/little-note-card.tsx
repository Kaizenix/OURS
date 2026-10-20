'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Sparkles } from 'lucide-react';
import type { LittleNote } from '@/types/database';
import { openNoteAction } from '@/features/home/actions';
import { formatTimePretty, formatDatePretty } from '@/lib/date-utils';

interface LittleNoteCardProps {
  note: LittleNote | null;
}

export function LittleNoteCard({ note }: LittleNoteCardProps) {
  const [isOpen, setIsOpen] = useState(Boolean(note?.opened_at));
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!note || isOpen || loading) return;
    setLoading(true);
    try {
      await openNoteAction(note.id);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to open note', err);
      // fallback state
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!note) {
    return (
      <div className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center py-8">
        <Mail className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
          Little Notes
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          No new sealed notes. You can leave one in the Notes section.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Little Note
          </span>
          <span className="text-[11px] text-muted-foreground">
            {note.created_at ? formatDatePretty(note.created_at) : ''}
          </span>
        </div>

        <div className="mt-2">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.button
                key="sealed"
                onClick={handleOpen}
                disabled={loading}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-4 rounded-2xl bg-card/80 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Sealed for you</p>
                    <p className="text-sm font-medium font-serif text-foreground group-hover:text-primary transition-colors">
                      {note.title || 'Open when you wake up'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center text-xs text-primary/80 font-medium">
                  {loading ? 'Opening...' : 'Tap to break seal & read'}
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="opened"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-2xl bg-card/80 border border-border/40 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>{note.title}</span>
                </div>
                <p className="text-sm text-foreground/90 font-serif leading-relaxed italic whitespace-pre-line">
                  &ldquo;{note.content}&rdquo;
                </p>
                <div className="text-[11px] text-muted-foreground pt-1 flex justify-between">
                  <span>Opened</span>
                  <span>{note.opened_at ? formatTimePretty(note.opened_at) : 'Just now'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
