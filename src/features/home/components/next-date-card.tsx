'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import type { CalendarEvent } from '@/types/database';
import { formatDatePretty, formatEventCountdown } from '@/lib/date-utils';

interface NextDateCardProps {
  nextEvent: CalendarEvent | null;
}

export function NextDateCard({ nextEvent }: NextDateCardProps) {
  if (!nextEvent) {
    return (
      <div className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            Next Special Moment
          </span>
          <p className="text-sm text-muted-foreground my-3">
            No upcoming events scheduled. Add a dinner date, trip, or milestone in Us &gt; Calendar.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border/30">
          <Link
            href="/us"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <span>Plan something together</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const countdown = formatEventCountdown(nextEvent.event_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            Next Special Moment
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {countdown.label}
          </span>
        </div>

        <h3 className="text-lg font-serif text-foreground font-medium mt-1">
          {nextEvent.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDatePretty(nextEvent.event_date)}
        </p>

        {nextEvent.notes && (
          <p className="text-xs text-secondary-foreground/80 mt-2 line-clamp-2 italic">
            &ldquo;{nextEvent.notes}&rdquo;
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border/30">
        <Link
          href="/us"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <span>View couple calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
