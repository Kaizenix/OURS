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
  const partnerName = partnerProfile?.display_name || 'pasanganmu';

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-surface/80 border border-border/40 p-5 md:p-7 shadow-xs"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2.5">
            <Heart className="w-3.5 h-3.5 fill-primary/30" />
            <span>Ruang Kita</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground">
            {greeting}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Hari yang indah bersama <span className="text-secondary-foreground font-medium">{partnerName}</span>.
          </p>

          {/* Couple counter */}
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Telah bersama</span>
            <span className="text-lg sm:text-xl font-serif text-foreground font-medium">
              {duration.formatted}
            </span>
          </div>

          {couple.start_date && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Calendar className="w-3.5 h-3.5" />
              <span>Hari Jadi: {formatDatePretty(couple.start_date)}</span>
            </div>
          )}
        </div>

        {/* Couple Avatars */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-background bg-card flex items-center justify-center font-serif text-sm font-medium overflow-hidden shadow-xs">
              {userProfile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.display_name || 'Anda'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(userProfile.display_name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="w-4 h-0.5 bg-border rounded-full" />

          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-background bg-card flex items-center justify-center font-serif text-sm font-medium overflow-hidden shadow-xs">
              {partnerProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partnerProfile.avatar_url}
                  alt={partnerProfile.display_name || 'Pasangan'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(partnerProfile?.display_name || 'P').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
