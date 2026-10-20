'use client';

import { useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
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
import { createMilestoneAction } from '@/features/timeline/actions';

interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PRESETS = [
  'First Met',
  'First Chat',
  'First Date',
  'Official Relationship',
  'First Trip',
  'First Apartment',
  'Anniversary',
];

export function AddMilestoneDialog({ open, onOpenChange, onSuccess }: AddMilestoneDialogProps) {
  const [title, setTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createMilestoneAction({
        title: title.trim(),
        milestone_date: milestoneDate,
        description: description.trim() || undefined,
      });

      setTitle('');
      setDescription('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Add Relationship Milestone
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Presets */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Quick Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setTitle(preset)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    title === preset
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Milestone Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First Met / Official Relationship"
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              When did this happen?
            </label>
            <Input
              type="date"
              value={milestoneDate}
              onChange={(e) => setMilestoneDate(e.target.value)}
              className="rounded-xl h-11 bg-background/60 text-xs"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Details or Memory (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how it felt, where you were..."
              className="rounded-xl bg-background/60 min-h-[80px] text-sm font-serif"
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
              Save Milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
