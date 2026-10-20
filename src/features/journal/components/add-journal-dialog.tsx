'use client';

import { useState } from 'react';
import { Loader2, BookOpen, Lock, Users, Sparkles } from 'lucide-react';
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
import type { JournalVisibility } from '@/types/database';
import { createJournalAction } from '@/features/journal/actions';

interface AddJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddJournalDialog({ open, onOpenChange, onSuccess }: AddJournalDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [visibility, setVisibility] = useState<JournalVisibility>('shared');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createJournalAction({
        title: title.trim(),
        content: content.trim(),
        mood: mood.trim() || undefined,
        visibility,
      });

      setTitle('');
      setContent('');
      setMood('');
      setVisibility('shared');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            New Journal Reflection
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Visibility Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Who can read this?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('shared')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-colors ${
                  visibility === 'shared'
                    ? 'bg-primary/15 border-primary text-foreground'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                }`}
              >
                <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Shared Journal</p>
                  <p className="text-[10px] text-muted-foreground">Both you and your partner can read</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-colors ${
                  visibility === 'private'
                    ? 'bg-primary/15 border-primary text-foreground'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                }`}
              >
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Private Journal</p>
                  <p className="text-[10px] text-muted-foreground">Only you can read. Never shared.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thoughts after our walk, What I want to cultivate..."
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Mood / Emotional tone */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Emotional Tone / Mood (Optional)
            </label>
            <Input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. Grateful, Reflective, Cozy, Pensive"
              className="rounded-xl h-11 bg-background/60 text-xs"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Reflection Content *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. This space is quiet, warm, and honest..."
              className="rounded-xl bg-background/60 min-h-[140px] text-sm font-serif leading-relaxed"
              required
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
              disabled={loading || !title.trim() || !content.trim()}
              className="rounded-xl px-5 text-xs font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Reflection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
