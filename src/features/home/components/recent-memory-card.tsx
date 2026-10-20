'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Image as ImageIcon, MapPin, ArrowRight, Heart } from 'lucide-react';
import type { MemoryWithMedia } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';

interface RecentMemoryCardProps {
  memory: MemoryWithMedia | null;
}

export function RecentMemoryCard({ memory }: RecentMemoryCardProps) {
  if (!memory) {
    return (
      <div className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            Recent Memory
          </span>
          <p className="text-sm text-muted-foreground my-3">
            Nothing here yet. Your first memory is waiting to be saved.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-border/30">
          <Link
            href="/memories"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <span>Add our first memory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const firstImage = memory.media && memory.media.length > 0 ? memory.media[0].url : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            Recent Memory
          </span>
          {memory.is_favorite && (
            <Heart className="w-4 h-4 fill-primary text-primary" />
          )}
        </div>

        {firstImage && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-3 bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstImage}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        <h3 className="text-base font-serif text-foreground font-medium">
          {memory.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {memory.memory_date && (
            <span>{formatDatePretty(memory.memory_date)}</span>
          )}
          {memory.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary/70" />
              {memory.location}
            </span>
          )}
        </div>

        {memory.story && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {memory.story}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border/30">
        <Link
          href="/memories"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <span>View all memories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
