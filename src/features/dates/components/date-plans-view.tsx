'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { DatePlanWithVotes } from '@/features/dates/actions';
import { DatePlanCard } from './date-plan-card';
import { AddDateDialog } from './add-date-dialog';

interface DatePlansViewProps {
  initialPlans: DatePlanWithVotes[];
}

export function DatePlansView({ initialPlans }: DatePlansViewProps) {
  const [plans, setPlans] = useState<DatePlanWithVotes[]>(initialPlans);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredPlans = plans.filter((p) => {
    if (selectedStatus === 'all') return true;
    return p.status === selectedStatus;
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
            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
            Quality Time Ideas
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Date Planner
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a Date</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Dates' },
          { id: 'idea', label: 'Ideas' },
          { id: 'planned', label: 'Planned' },
          { id: 'done', label: 'Done' },
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

      {/* Date Plans Grid */}
      {filteredPlans.length === 0 ? (
        <EmptyState
          title="No date ideas yet"
          description="Suggest dinner spots, arcade evenings, cozy picnics, or late-night drives and vote together!"
          actionLabel="Suggest a date idea"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => (
            <DatePlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddDateDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
