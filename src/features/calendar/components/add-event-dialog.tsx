'use client';

import { useState } from 'react';
import { Loader2, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { EventType } from '@/types/database';
import { createCalendarEventAction } from '@/features/calendar/actions';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'date', label: 'Date' },
  { value: 'trip', label: 'Trip' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'custom', label: 'Custom' },
];

export function AddEventDialog({ open, onOpenChange, onSuccess }: AddEventDialogProps) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('date');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createCalendarEventAction({
        title: title.trim(),
        event_type: eventType,
        event_date: eventDate,
        notes: notes.trim() || undefined,
      });

      setTitle('');
      setNotes('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md p-6 bg-surface border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Add Calendar Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Event Type pills */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Event Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((t) => {
                const isSelected = eventType === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setEventType(t.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Event Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dinner Date, Weekend Getaway, Birthday"
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              Date
            </label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="rounded-xl h-11 bg-background/60 text-xs"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Notes / Location (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Table booked under Ardan for 7:30 PM..."
              className="rounded-xl bg-background/60 min-h-[70px] text-sm font-serif"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="rounded-xl px-5 text-xs font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
