'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, Trash2 } from 'lucide-react';
import type { MemoryWithMedia } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';
import { toggleFavoriteMemoryAction, deleteMemoryAction } from '@/features/memories/actions';

interface MemoryCardProps {
  memory: MemoryWithMedia;
  layout?: 'grid' | 'timeline';
}

export function MemoryCard({ memory, layout = 'grid' }: MemoryCardProps) {
  const [isFav, setIsFav] = useState(memory.is_favorite);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = memory.media && memory.media.length > 0 ? memory.media[0].url : null;

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(!isFav);
    try {
      await toggleFavoriteMemoryAction(memory.id, isFav);
    } catch {
      setIsFav(isFav);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this memory?')) return;
    setIsDeleting(true);
    try {
      await deleteMemoryAction(memory.id);
    } catch {
      setIsDeleting(false);
    }
  };

  if (isDeleting) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-3xl bg-surface/70 border border-border/40 overflow-hidden backdrop-blur-sm shadow-xs hover:border-primary/40 transition-all ${
        layout === 'timeline' ? 'p-5 sm:p-6' : 'p-4 flex flex-col justify-between'
      }`}
    >
      <div>
        {/* Photo if available */}
        {imageUrl && (
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden mb-3.5 bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            />
          </div>
        )}

        {/* Date and Location */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <div className="flex items-center gap-3">
            {memory.memory_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary/70" />
                {formatDatePretty(memory.memory_date)}
              </span>
            )}
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary/70" />
                {memory.location}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleFav}
              className="p-1 rounded-full text-muted-foreground hover:text-primary transition-colors"
              title="Favorite"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFav ? 'fill-primary text-primary' : 'text-muted-foreground/60'
                }`}
              />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-full text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-serif font-medium text-foreground tracking-tight">
          {memory.title}
        </h3>

        {/* Story */}
        {memory.story && (
          <p className="text-xs sm:text-sm text-secondary-foreground/80 font-serif leading-relaxed mt-2 line-clamp-3 italic">
            &ldquo;{memory.story}&rdquo;
          </p>
        )}
      </div>

      {/* Tags */}
      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/20">
          {memory.tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-full text-[10px] bg-secondary/20 text-secondary-foreground font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
