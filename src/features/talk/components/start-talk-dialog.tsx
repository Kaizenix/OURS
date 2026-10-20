'use client';

import { useState } from 'react';
import { Loader2, MessageSquareHeart, HeartHandshake } from 'lucide-react';
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
import { createTalkTopicAction } from '@/features/talk/actions';

interface StartTalkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StartTalkDialog({ open, onOpenChange, onSuccess }: StartTalkDialogProps) {
  const [topic, setTopic] = useState('');
  const [perspective, setPerspective] = useState('');
  const [feeling, setFeeling] = useState('');
  const [need, setNeed] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !topic.trim() ||
      !perspective.trim() ||
      !feeling.trim() ||
      !need.trim() ||
      !desiredOutcome.trim() ||
      loading
    ) {
      setError('Please answer all 5 prompts to help your partner understand.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTalkTopicAction({
        topic: topic.trim(),
        perspective: perspective.trim(),
        feeling: feeling.trim(),
        need: need.trim(),
        desired_outcome: desiredOutcome.trim(),
      });

      setTopic('');
      setPerspective('');
      setFeeling('');
      setNeed('');
      setDesiredOutcome('');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate talk topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <span>Open a Gentle Conversation</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            This structure is designed to share your feelings calmly and give your partner room to listen with care.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* 1. I want to talk about */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground font-medium">1. I want to talk about...</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How we handled our weekend plans, feeling disconnected recently..."
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* 2. What happened from my perspective */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground font-medium">2. What happened from my perspective?</label>
            <Textarea
              value={perspective}
              onChange={(e) => setPerspective(e.target.value)}
              placeholder="Describe what occurred without assigning blame..."
              className="rounded-xl bg-background/60 min-h-[70px] text-xs font-serif"
              required
            />
          </div>

          {/* 3. How did it make me feel */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground font-medium">3. How did it make me feel?</label>
            <Textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="e.g. I felt overwhelmed, lonely, or unsure where I stood..."
              className="rounded-xl bg-background/60 min-h-[70px] text-xs font-serif"
              required
            />
          </div>

          {/* 4. What do I need */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground font-medium">4. What do I need right now?</label>
            <Textarea
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              placeholder="e.g. Reassurance, a quiet hug, some clarity on our upcoming schedule..."
              className="rounded-xl bg-background/60 min-h-[70px] text-xs font-serif"
              required
            />
          </div>

          {/* 5. What outcome do I hope for */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground font-medium">5. What outcome do I hope for?</label>
            <Textarea
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. To feel like a united team again and find a rhythm that works for both of us..."
              className="rounded-xl bg-background/60 min-h-[70px] text-xs font-serif"
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
              disabled={loading}
              className="rounded-xl px-5 text-xs font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send with Care
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
