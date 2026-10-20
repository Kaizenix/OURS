'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Mail, Calendar } from 'lucide-react';
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
import type { NoteCondition } from '@/types/database';
import { createNoteAction } from '@/features/notes/actions';

interface SendNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerName: string;
  onSuccess?: () => void;
}

const PRESET_TITLES = [
  "Read when you're sad",
  "Open tomorrow morning",
  "Something I want you to remember",
  "Open when you miss me",
  "A little appreciation for today",
];

export function SendNoteDialog({
  open,
  onOpenChange,
  partnerName,
  onSuccess,
}: SendNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openCondition, setOpenCondition] = useState<NoteCondition>('whenever');
  const [openDate, setOpenDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createNoteAction({
        title: title.trim(),
        content: content.trim(),
        open_condition: openCondition,
        open_date: openCondition === 'date' && openDate ? openDate : undefined,
      });

      setTitle('');
      setContent('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Leave a Little Note for {partnerName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Preset Prompts */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Suggested Opening Prompts
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TITLES.map((preset) => (
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
            <label className="text-xs text-muted-foreground font-medium">Envelope Inscription / Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open when you need a gentle hug..."
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* When to open */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              When should {partnerName} open this?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'whenever', label: 'When they choose' },
                { id: 'now', label: 'Right away' },
                { id: 'date', label: 'On a specific date' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setOpenCondition(opt.id as NoteCondition)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                    openCondition === opt.id
                      ? 'bg-primary/15 border-primary text-foreground'
                      : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker if date is selected */}
          {openCondition === 'date' && (
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Target Date
              </label>
              <Input
                type="date"
                value={openDate}
                onChange={(e) => setOpenDate(e.target.value)}
                className="rounded-xl h-11 bg-background/60 text-xs"
                required
              />
            </div>
          )}

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Your Message *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something honest, comforting, or funny that will make their day..."
              className="rounded-xl bg-background/60 min-h-[120px] text-sm font-serif leading-relaxed"
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
              Seal & Send Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
