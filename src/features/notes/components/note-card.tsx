'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, Trash2, Calendar, Sparkles } from 'lucide-react';
import type { LittleNote } from '@/types/database';
import { formatDatePretty, formatTimePretty } from '@/lib/date-utils';
import { openNoteAction, deleteNoteAction } from '@/features/notes/actions';

interface NoteCardProps {
  note: LittleNote;
  isSender: boolean;
}

export function NoteCard({ note, isSender }: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(Boolean(note.opened_at));
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleOpen = async () => {
    if (isOpen || isSender || loading) return;
    setLoading(true);
    try {
      await openNoteAction(note.id);
      setIsOpen(true);
    } catch {
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this note?')) return;
    setIsDeleted(true);
    try {
      await deleteNoteAction(note.id);
    } catch {
      setIsDeleted(false);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-5 sm:p-6 backdrop-blur-sm shadow-xs transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {isSender ? 'Note you left' : 'Sealed note'}
          </span>

          <div className="flex items-center gap-2">
            <span>{formatDatePretty(note.created_at)}</span>
            {isSender && (
              <button
                onClick={handleDelete}
                className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Note Body: Sealed or Opened */}
        <AnimatePresence mode="wait">
          {!isOpen && !isSender ? (
            /* Receiver sees Sealed Envelope */
            <motion.button
              key="sealed"
              onClick={handleOpen}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all cursor-pointer group shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Sealed Envelope
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-foreground group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                </div>
              </div>

              {note.open_date && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Requested to open: {formatDatePretty(note.open_date)}</span>
                </div>
              )}

              <div className="text-center pt-2 border-t border-border/20 text-xs text-primary font-medium">
                {loading ? 'Unsealing...' : 'Tap to break seal & read message'}
              </div>
            </motion.button>
          ) : (
            /* Opened Note / Sender view */
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-2xl bg-card/60 border border-border/30 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-primary font-medium border-b border-border/20 pb-2">
                <MailOpen className="w-4 h-4" />
                <span className="font-serif text-sm">{note.title}</span>
              </div>

              <p className="text-sm sm:text-base font-serif italic text-foreground/90 leading-relaxed whitespace-pre-line">
                &ldquo;{note.content}&rdquo;
              </p>

              <div className="text-[11px] text-muted-foreground pt-3 border-t border-border/20 flex items-center justify-between">
                <span>
                  {note.opened_at
                    ? `Opened on ${formatDatePretty(note.opened_at)} at ${formatTimePretty(note.opened_at)}`
                    : isSender
                    ? 'Waiting for partner to break seal'
                    : 'Just opened'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
