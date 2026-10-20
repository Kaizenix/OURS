'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Heart,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { MEMORY_TAGS } from '@/lib/constants';
import type { MemoryWithMedia } from '@/types/database';
import { MemoryCard } from './memory-card';
import { AddMemoryDialog } from './add-memory-dialog';

interface MemoriesViewProps {
  initialMemories: MemoryWithMedia[];
}

export function MemoriesView({ initialMemories }: MemoriesViewProps) {
  const [memories, setMemories] = useState<MemoryWithMedia[]>(initialMemories);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredMemories = memories.filter((m) => {
    const matchesTag =
      selectedTag === 'all'
        ? true
        : selectedTag === 'favorite'
        ? m.is_favorite
        : m.tags?.includes(selectedTag);

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.story?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTag && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Our Digital Scrapbook
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Memories
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-surface/70 border border-border/40">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-xl text-xs transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Timeline view"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="h-10 pl-9 rounded-2xl bg-surface/60 border-border/40 text-xs"
            />
          </div>

          {/* Tags scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setSelectedTag('favorite')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === 'favorite'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Favorites</span>
            </button>

            {MEMORY_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface/60 text-muted-foreground hover:text-foreground border border-border/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memories Container */}
      {filteredMemories.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          description="Your first memory is waiting to be saved. Store private moments, trips, and late-night conversations."
          actionLabel="Add our first memory"
          onAction={() => setIsAddOpen(true)}
        />
      ) : viewMode === 'timeline' ? (
        /* Timeline View (Default) */
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {filteredMemories.map((mem) => (
            <div key={mem.id} className="relative">
              {/* Timeline marker */}
              <div className="absolute -left-6 sm:-left-8 top-6 w-3 h-3 rounded-full bg-primary border-2 border-background ring-4 ring-primary/20" />
              <MemoryCard memory={mem} layout="timeline" />
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => (
            <MemoryCard key={mem.id} memory={mem} layout="grid" />
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      <AddMemoryDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => {
          // Re-fetch or reload
          window.location.reload();
        }}
      />
    </div>
  );
}
