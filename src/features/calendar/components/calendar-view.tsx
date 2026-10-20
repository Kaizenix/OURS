'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { CalendarEvent, EventType } from '@/types/database';
import { formatDatePretty, formatEventCountdown } from '@/lib/date-utils';
import { deleteCalendarEventAction } from '@/features/calendar/actions';
import { AddEventDialog } from './add-event-dialog';

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this event?')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteCalendarEventAction(id);
    } catch {
      window.location.reload();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.event_date >= todayStr);
  const pastEvents = events.filter((e) => e.event_date < todayStr);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            Special Days & Plans
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Couple Calendar
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events on your calendar"
          description="Keep track of your anniversaries, birthdays, planned trips, and upcoming dates with real countdowns."
          actionLabel="Add your first event"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Upcoming Section */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Upcoming Moments ({upcomingEvents.length})
              </h2>

              <div className="space-y-3">
                {upcomingEvents.map((event, idx) => {
                  const countdown = formatEventCountdown(event.event_date);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group rounded-3xl bg-surface/70 border border-border/40 p-5 backdrop-blur-sm shadow-xs hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {event.event_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDatePretty(event.event_date)}
                          </span>
                        </div>

                        <h3 className="text-base font-serif font-medium text-foreground">
                          {event.title}
                        </h3>

                        {event.notes && (
                          <p className="text-xs text-secondary-foreground/80 mt-1 line-clamp-1 italic font-serif">
                            &ldquo;{event.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/20">
                        <span className="px-3 py-1 rounded-full bg-card border border-border/40 text-xs font-mono font-medium text-primary">
                          {countdown.label}
                        </span>

                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/20">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Past Moments ({pastEvents.length})
              </h2>

              <div className="space-y-2 opacity-75">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group rounded-2xl bg-card/40 border border-border/20 p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{event.event_type}</span>
                        <span>•</span>
                        <span>{formatDatePretty(event.event_date)}</span>
                      </div>
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
