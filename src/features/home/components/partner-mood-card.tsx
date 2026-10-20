'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BatteryCharging, Zap, MessageSquareHeart, ArrowRight } from 'lucide-react';
import type { DailyCheckin, Profile } from '@/types/database';
import { MOOD_OPTIONS, NEED_OPTIONS } from '@/lib/constants';

interface PartnerMoodCardProps {
  partnerProfile: Profile | null;
  partnerCheckin: DailyCheckin | null;
}

export function PartnerMoodCard({ partnerProfile, partnerCheckin }: PartnerMoodCardProps) {
  const partnerName = partnerProfile?.display_name || 'Partner';
  const moodObj = partnerCheckin
    ? MOOD_OPTIONS.find((m) => m.value === partnerCheckin.mood)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {partnerName}&apos;s Today
            </span>
          </div>
          {partnerCheckin && (
            <span className="text-xs text-muted-foreground">Checked in today</span>
          )}
        </div>

        {partnerCheckin ? (
          <div className="space-y-4">
            {/* Mood representation */}
            <div className="flex items-center gap-3 bg-card/60 rounded-2xl p-3 border border-border/30">
              <span className="text-2xl">{moodObj?.emoji || '✨'}</span>
              <div>
                <p className="text-xs text-muted-foreground">Mood</p>
                <p className="text-sm font-medium capitalize text-foreground">{moodObj?.label || partnerCheckin.mood}</p>
              </div>
            </div>

            {/* Batteries */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/40 rounded-2xl p-3 border border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Energy
                  </span>
                  <span className="font-mono">{partnerCheckin.energy}%</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500/80 h-full rounded-full transition-all duration-500"
                    style={{ width: `${partnerCheckin.energy}%` }}
                  />
                </div>
              </div>

              <div className="bg-card/40 rounded-2xl p-3 border border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                    Social
                  </span>
                  <span className="font-mono">{partnerCheckin.social_battery}%</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400/80 h-full rounded-full transition-all duration-500"
                    style={{ width: `${partnerCheckin.social_battery}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Needs */}
            {partnerCheckin.needs && partnerCheckin.needs.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Needs today:</p>
                <div className="flex flex-wrap gap-1.5">
                  {partnerCheckin.needs.map((needKey) => {
                    const label = NEED_OPTIONS.find((n) => n.value === needKey)?.label || needKey;
                    return (
                      <span
                        key={needKey}
                        className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note */}
            {partnerCheckin.note && (
              <div className="bg-card/30 rounded-2xl p-3 border border-border/20 text-xs italic text-secondary-foreground/90">
                &ldquo;{partnerCheckin.note}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground space-y-2">
            <MessageSquareHeart className="w-8 h-8 mx-auto opacity-40 text-muted-foreground" />
            <p className="text-sm">
              {partnerProfile
                ? `${partnerName} hasn't checked in yet today.`
                : 'Waiting for partner to join your space.'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-border/30">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <span>Complete your own check-in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
