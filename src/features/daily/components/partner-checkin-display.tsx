'use client';

import { motion } from 'framer-motion';
import { Zap, BatteryCharging, Heart, MessageCircleHeart } from 'lucide-react';
import type { DailyCheckin, Profile } from '@/types/database';
import { MOOD_OPTIONS, NEED_OPTIONS } from '@/lib/constants';

interface PartnerCheckinDisplayProps {
  partnerProfile: Profile | null;
  partnerCheckin: DailyCheckin | null;
}

export function PartnerCheckinDisplay({ partnerProfile, partnerCheckin }: PartnerCheckinDisplayProps) {
  const partnerName = partnerProfile?.display_name || 'Partner';
  const moodObj = partnerCheckin
    ? MOOD_OPTIONS.find((m) => m.value === partnerCheckin.mood)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 md:p-8 backdrop-blur-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-primary" />
            {partnerName}&apos;s Condition Today
          </span>
          <h2 className="text-xl font-serif text-foreground mt-1">
            Understanding {partnerName}
          </h2>
        </div>
      </div>

      {partnerCheckin ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 bg-card/50 p-4 rounded-2xl border border-border/30">
            <span className="text-3xl">{moodObj?.emoji || '✨'}</span>
            <div>
              <p className="text-xs text-muted-foreground">Current Mood</p>
              <p className="text-base font-medium capitalize text-foreground">
                {moodObj?.label || partnerCheckin.mood}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card/40 rounded-2xl p-4 border border-border/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Energy Level
                </span>
                <span className="font-mono font-medium">{partnerCheckin.energy}%</span>
              </div>
              <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${partnerCheckin.energy}%` }}
                />
              </div>
            </div>

            <div className="bg-card/40 rounded-2xl p-4 border border-border/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                  Social Battery
                </span>
                <span className="font-mono font-medium">{partnerCheckin.social_battery}%</span>
              </div>
              <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${partnerCheckin.social_battery}%` }}
                />
              </div>
            </div>
          </div>

          {partnerCheckin.needs && partnerCheckin.needs.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">How you can support:</p>
              <div className="flex flex-wrap gap-2">
                {partnerCheckin.needs.map((needKey) => {
                  const label = NEED_OPTIONS.find((n) => n.value === needKey)?.label || needKey;
                  return (
                    <span
                      key={needKey}
                      className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {partnerCheckin.note && (
            <div className="bg-card/40 rounded-2xl p-4 border border-border/20">
              <p className="text-xs text-muted-foreground mb-1">Message from {partnerName}:</p>
              <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                &ldquo;{partnerCheckin.note}&rdquo;
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground space-y-3">
          <MessageCircleHeart className="w-10 h-10 mx-auto opacity-30 text-primary" />
          <p className="text-sm">
            {partnerProfile
              ? `${partnerName} hasn't filled out today's check-in yet.`
              : 'Waiting for your partner to join your space.'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Once completed, their energy and needs will appear here.
          </p>
        </div>
      )}
    </motion.div>
  );
}
