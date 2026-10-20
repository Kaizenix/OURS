'use client';

import { useState } from 'react';
import { Loader2, Calendar, Clock, MapPin, DollarSign, Sparkles } from 'lucide-react';
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
import type { DatePlanStatus } from '@/types/database';
import { createDatePlanAction } from '@/features/dates/actions';

interface AddDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DATE_PRESETS = [
  'Dinner & Wine',
  'Cozy Movie Night',
  'Arcade & Games',
  'Late-night Drive',
  'Sunset Picnic',
  'Cook Together at Home',
  'Museum / Gallery Walk',
];

export function AddDateDialog({ open, onOpenChange, onSuccess }: AddDateDialogProps) {
  const [title, setTitle] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [plannedTime, setPlannedTime] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DatePlanStatus>('idea');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createDatePlanAction({
        title: title.trim(),
        planned_date: plannedDate || undefined,
        planned_time: plannedTime || undefined,
        location: location.trim() || undefined,
        budget: budget.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      });

      setTitle('');
      setLocation('');
      setBudget('');
      setNotes('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create date plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Plan a Date Together
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Quick Inspiration
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DATE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setTitle(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    title === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Date Concept / Name *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Candlelight Pasta Night, Stargazing"
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Target Date (Optional)
              </label>
              <Input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Time (Optional)
              </label>
              <Input
                type="time"
                value={plannedTime}
                onChange={(e) => setPlannedTime(e.target.value)}
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>
          </div>

          {/* Location & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown / At home"
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                Estimated Budget
              </label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. Free / $$ / Under 300k"
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Notes / Dress code / Ideas</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to wear, playlist to bring, reservations needed..."
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
              Add Date Idea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
