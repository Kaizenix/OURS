'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { GOAL_CATEGORIES } from '@/lib/constants';
import type { GoalWithTasks, GoalStatus, GoalCategory } from '@/types/database';
import { GoalCard } from './goal-card';
import { AddGoalDialog } from './add-goal-dialog';

interface GoalsViewProps {
  initialGoals: GoalWithTasks[];
}

export function GoalsView({ initialGoals }: GoalsViewProps) {
  const [goals, setGoals] = useState<GoalWithTasks[]>(initialGoals);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredGoals = goals.filter((g) => {
    const matchesStatus = selectedStatus === 'all' || g.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
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
            <Target className="w-3.5 h-3.5 text-primary" />
            Our Bucket List & Dreams
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Goals Together
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2.5">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Goals' },
            { id: 'planning', label: 'Planning' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'someday', label: 'Someday' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-secondary/40 text-secondary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {GOAL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-secondary/40 text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          title="What should you two experience together?"
          description="Build your shared bucket list: travel, cozy home projects, food trips, and personal milestones."
          actionLabel="Add a goal"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddGoalDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
