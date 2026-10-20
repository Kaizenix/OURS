'use client';

import { useState } from 'react';
import { Loader2, Plus, Calendar, Sparkles } from 'lucide-react';
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
import { GOAL_CATEGORIES } from '@/lib/constants';
import type { GoalCategory, GoalStatus } from '@/types/database';
import { createGoalAction } from '@/features/goals/actions';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddGoalDialog({ open, onOpenChange, onSuccess }: AddGoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('travel');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<GoalStatus>('someday');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTaskChange = (index: number, val: string) => {
    const updated = [...tasks];
    updated[index] = val;
    setTasks(updated);
  };

  const handleAddTaskField = () => {
    setTasks((prev) => [...prev, '']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createGoalAction({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        target_date: targetDate || undefined,
        status,
        initialTasks: tasks.filter((t) => t.trim()),
      });

      setTitle('');
      setDescription('');
      setTargetDate('');
      setTasks(['']);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Add a Shared Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Goal / Experience *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Japan Together, Buy our first couch..."
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setCategory(cat.value as GoalCategory)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Target Date (Optional)
              </label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Starting Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full rounded-xl h-11 bg-background/60 border border-border/40 px-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
              >
                <option value="someday">Someday</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Why this matters to us (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this goal special to both of you?"
              className="rounded-xl bg-background/60 min-h-[70px] text-sm font-serif"
            />
          </div>

          {/* Initial Checklist */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium">
              Checklist Steps (Optional)
            </label>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <Input
                  key={idx}
                  value={task}
                  onChange={(e) => handleTaskChange(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}...`}
                  className="rounded-xl h-9 bg-background/60 text-xs"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddTaskField}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another step</span>
            </button>
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
              Add Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
