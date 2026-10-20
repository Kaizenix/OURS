'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, ArrowRight, Sparkles } from 'lucide-react';
import type { LittleNote } from '@/types/database';

interface LittleNoteCardProps {
  note: LittleNote | null;
}

export function LittleNoteCard({ note }: LittleNoteCardProps) {
  const [isOpen, setIsOpen] = useState(note ? !!note.opened_at : false);

  if (!note) {
    return (
      <div className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-3">
            Surat Kecil
          </span>
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
              <Mail className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs text-muted-foreground">
              Belum ada surat kecil yang tersegel untukmu.
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-border/20 flex justify-end">
          <Link
            href="/us/notes"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
          >
            <span>Kirim Surat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Surat Kecil Tersegel
          </span>
          <span className="text-[10px] text-primary/80 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Dari Pasanganmu
          </span>
        </div>

        <div className="my-2">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.button
                key="sealed"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-card via-card/80 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-serif font-medium text-foreground truncate">
                      &ldquo;{note.title}&rdquo;
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Ketuk untuk membuka segel surat
                    </p>
                  </div>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="opened"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <MailOpen className="w-4 h-4" />
                  <span>{note.title}</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-serif whitespace-pre-wrap pl-6 border-l-2 border-primary/40">
                  {note.content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-3 border-t border-border/20 flex justify-end">
        <Link
          href="/us/notes"
          className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
        >
          <span>Buka Semua Surat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
