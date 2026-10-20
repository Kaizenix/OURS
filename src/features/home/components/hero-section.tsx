'use client';

import { motion } from 'framer-motion';
import { Calendar, Heart } from 'lucide-react';
import type { Profile, Couple } from '@/types/database';
import { getGreeting, calculateRelationshipDuration, formatDatePretty } from '@/lib/date-utils';

interface HeroSectionProps {
  userProfile: Profile;
  partnerProfile: Profile | null;
  couple: Couple;
}

export function HeroSection({ userProfile, partnerProfile, couple }: HeroSectionProps) {
  const greeting = getGreeting(userProfile.display_name);
  const duration = calculateRelationshipDuration(couple.start_date);
  const partnerName = partnerProfile?.display_name || 'your partner';

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-surface/70 border border-border/40 p-6 md:p-8 backdrop-blur-sm shadow-sm"
    >
      {/* Subtle warm glow background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Heart className="w-3.5 h-3.5 fill-primary/30" />
            <span>Our Space</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground">
            {greeting}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Another day with <span className="text-secondary-foreground font-medium">{partnerName}</span>.
          </p>

          {/* Couple counter */}
          <div className="mt-5 flex flex-wrap items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Together for</span>
            <span className="text-lg sm:text-xl font-serif text-foreground font-medium">
              {duration.formatted}
            </span>
          </div>

          {couple.start_date && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Calendar className="w-3.5 h-3.5" />
              <span>Anniversary: {formatDatePretty(couple.start_date)}</span>
            </div>
          )}
        </div>

        {/* Couple Avatars */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-14 h-14 rounded-full border-2 border-background bg-card flex items-center justify-center text-lg font-serif font-medium shadow-sm overflow-hidden">
              {userProfile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userProfile.avatar_url} alt={userProfile.display_name || 'You'} className="w-full h-full object-cover" />
              ) : (
                <span>{(userProfile.display_name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          <div className="h-0.5 w-6 bg-border/80" />

          <div className="relative group">
            <div className="w-14 h-14 rounded-full border-2 border-background bg-card flex items-center justify-center text-lg font-serif font-medium shadow-sm overflow-hidden">
              {partnerProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partnerProfile.avatar_url} alt={partnerProfile.display_name || 'Partner'} className="w-full h-full object-cover" />
              ) : (
                <span>{(partnerProfile?.display_name || 'P').charAt(0).toUpperCase()}</span>
              )}
            </div>
            {partnerProfile && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
