'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, BookOpen, Lock, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { Journal, JournalVisibility } from '@/types/database';
import { JournalCard } from './journal-card';
import { AddJournalDialog } from './add-journal-dialog';

interface JournalViewProps {
  initialJournals: Journal[];
}

export function JournalView({ initialJournals }: JournalViewProps) {
  const [journals, setJournals] = useState<Journal[]>(initialJournals);
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredJournals = journals.filter((j) => {
    if (selectedVisibility === 'all') return true;
    return j.visibility === selectedVisibility;
  });

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
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            Reflections & Thoughts
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Relationship Journal
          </h1>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setSelectedVisibility('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedVisibility === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
          }`}
        >
          All Entries
        </button>

        <button
          onClick={() => setSelectedVisibility('shared')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedVisibility === 'shared'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>Shared</span>
        </button>

        <button
          onClick={() => setSelectedVisibility('private')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedVisibility === 'private'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>Private to Me</span>
        </button>
      </div>

      {/* Entries List */}
      {filteredJournals.length === 0 ? (
        <EmptyState
          title="No journal reflections yet"
          description="Write shared entries to remember growth and memories, or private reflections only you can see."
          actionLabel="Write an entry"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredJournals.map((j) => (
            <JournalCard key={j.id} journal={j} />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddJournalDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
