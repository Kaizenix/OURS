'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, History, Heart, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { Milestone } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';
import { deleteMilestoneAction } from '@/features/timeline/actions';
import { AddMilestoneDialog } from './add-milestone-dialog';

interface TimelineViewProps {
  initialMilestones: Milestone[];
}

export function TimelineView({ initialMilestones }: TimelineViewProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this milestone?')) return;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMilestoneAction(id);
    } catch {
      window.location.reload();
    }
  };

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
            <History className="w-3.5 h-3.5 text-primary" />
            Our Story & Journey
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Relationship Timeline
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </Button>
      </div>

      {/* Vertical Timeline */}
      {milestones.length === 0 ? (
        <EmptyState
          title="No milestones added yet"
          description="Mark important dates like your first met, first date, or when you made things official."
          actionLabel="Add our first milestone"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group"
            >
              {/* Glowing node on vertical line */}
              <div className="absolute -left-6 sm:-left-8 top-5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background ring-4 ring-primary/20 group-hover:scale-125 transition-transform" />

              <div className="rounded-3xl bg-surface/70 border border-border/40 p-5 sm:p-6 backdrop-blur-sm shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-primary font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDatePretty(milestone.milestone_date)}
                    </span>

                    <button
                      onClick={() => handleDelete(milestone.id)}
                      className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-serif font-medium text-foreground tracking-tight">
                    {milestone.title}
                  </h3>

                  {milestone.description && (
                    <p className="text-xs sm:text-sm text-secondary-foreground/80 mt-2 font-serif leading-relaxed italic">
                      &ldquo;{milestone.description}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddMilestoneDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
