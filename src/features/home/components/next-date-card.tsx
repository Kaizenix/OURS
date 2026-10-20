'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import type { CalendarEvent } from '@/types/database';
import { formatDatePretty, formatEventCountdown } from '@/lib/date-utils';

interface NextDateCardProps {
  nextEvent: CalendarEvent | null;
}

export function NextDateCard({ nextEvent }: NextDateCardProps) {
  if (!nextEvent) {
    return (
      <div className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-3">
            Rencana Terdekat
          </span>
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
              <Calendar className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs text-muted-foreground">
              Belum ada agenda kencan atau momen penting.
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-border/20 flex justify-end">
          <Link
            href="/us/calendar"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
          >
            <span>Tambah Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const countdown = formatEventCountdown(nextEvent.event_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
      className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Rencana Terdekat
          </span>
          <span className="text-[10px] text-primary font-medium bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {countdown.label}
          </span>
        </div>

        <div className="bg-card/60 rounded-2xl p-3.5 border border-border/30 my-2">
          <h4 className="text-sm font-serif font-medium text-foreground truncate">
            {nextEvent.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{formatDatePretty(nextEvent.event_date)}</span>
          </p>
          {nextEvent.notes && (
            <p className="text-xs text-foreground/80 mt-2 italic bg-background/50 p-2 rounded-xl">
              &ldquo;{nextEvent.notes}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/20 flex justify-end">
        <Link
          href="/us/calendar"
          className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
        >
          <span>Buka Kalender</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
