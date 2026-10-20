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
  const partnerName = partnerProfile?.display_name || 'Pasangan';
  const moodObj = partnerCheckin
    ? MOOD_OPTIONS.find((m) => m.value === partnerCheckin.mood)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-3xl bg-surface/80 border border-border/40 p-5 shadow-xs flex flex-col justify-between select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Kondisi {partnerName} Hari Ini
          </span>
          {partnerCheckin && (
            <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              Sudah check-in
            </span>
          )}
        </div>

        {partnerCheckin ? (
          <div className="space-y-3.5">
            {/* Mood representation */}
            <div className="flex items-center gap-3 bg-card/60 rounded-2xl p-3 border border-border/30">
              <span className="text-2xl">{moodObj?.emoji || '✨'}</span>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Suasana Hati</p>
                <p className="text-sm font-medium text-foreground">{moodObj?.label || partnerCheckin.mood}</p>
              </div>
            </div>

            {/* Batteries */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-card/40 rounded-2xl p-2.5 border border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Energi
                  </span>
                  <span className="font-mono text-xs">{partnerCheckin.energy}%</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${partnerCheckin.energy}%` }}
                  />
                </div>
              </div>

              <div className="bg-card/40 rounded-2xl p-2.5 border border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1 text-[11px]">
                    <BatteryCharging className="w-3 h-3 text-emerald-500" />
                    Baterai Sosial
                  </span>
                  <span className="font-mono text-xs">{partnerCheckin.social_battery}%</span>
                </div>
                <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${partnerCheckin.social_battery}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Needs */}
            {partnerCheckin.needs && partnerCheckin.needs.length > 0 && (
              <div className="bg-primary/5 rounded-2xl p-3 border border-primary/15 text-xs">
                <span className="text-primary font-medium block text-[10px] uppercase mb-0.5">
                  Kebutuhan saat ini:
                </span>
                <span className="text-foreground/90 font-medium">
                  {partnerCheckin.needs
                    .map((needVal) => NEED_OPTIONS.find((n) => n.value === needVal)?.label || needVal)
                    .join(', ')}
                </span>
              </div>
            )}

            {/* Note */}
            {partnerCheckin.note && (
              <div className="bg-card/30 rounded-2xl p-3 border border-border/20 text-xs italic text-muted-foreground">
                &ldquo;{partnerCheckin.note}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted-foreground">
              {partnerName} belum membagikan kondisi hari ini.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/20 flex justify-end">
        <Link
          href="/daily"
          className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <span>Buka Check-in Harian</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
