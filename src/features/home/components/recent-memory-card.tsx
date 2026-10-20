'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Image as ImageIcon, MapPin, Calendar, ArrowRight, Heart } from 'lucide-react';
import type { MemoryWithMedia } from '@/types/database';
import { formatDatePretty } from '@/lib/date-utils';

interface RecentMemoryCardProps {
  memory: MemoryWithMedia | null;
}

export function RecentMemoryCard({ memory }: RecentMemoryCardProps) {
  if (!memory) {
    return (
      <div className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium block mb-3">
            Kenangan Terkini
          </span>
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs text-muted-foreground">
              Belum ada kenangan yang tersimpan di scrapbook kita.
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-border/20 flex justify-end">
          <Link
            href="/memories"
            className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
          >
            <span>Simpan Kenangan Pertama</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const firstMedia = memory.media && memory.media.length > 0 ? memory.media[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.25 }}
      className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between select-none"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
        {firstMedia ? (
          <div className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-border/30 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstMedia.url}
              alt={memory.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full sm:w-28 h-28 rounded-2xl bg-card border border-border/30 flex items-center justify-center text-muted-foreground shrink-0">
            <ImageIcon className="w-8 h-8 opacity-40" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Kenangan Terkini
            </span>
            {memory.is_favorite && (
              <span className="text-[10px] text-rose-500 flex items-center gap-0.5">
                <Heart className="w-3 h-3 fill-rose-500" />
                Favorit
              </span>
            )}
          </div>

          <h4 className="text-base font-serif font-medium text-foreground truncate">
            {memory.title}
          </h4>

          {memory.story && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {memory.story}
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDatePretty(memory.memory_date)}
            </span>
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary/70" />
                {memory.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="self-end md:self-center shrink-0">
        <Link
          href="/memories"
          className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 bg-primary/10 px-3.5 py-2 rounded-full transition-colors"
        >
          <span>Buka Scrapbook</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
