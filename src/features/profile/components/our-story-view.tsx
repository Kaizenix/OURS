'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar,
  Sparkles,
  Edit,
  Quote,
  ArrowLeft,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OurStoryData } from '@/features/profile/actions';
import { calculateRelationshipDuration, formatDatePretty } from '@/lib/date-utils';
import { EditProfileDialog } from './edit-profile-dialog';
import { EditCoupleDialog } from './edit-couple-dialog';

interface OurStoryViewProps {
  data: OurStoryData;
}

export function OurStoryView({ data }: OurStoryViewProps) {
  const { userProfile, partnerProfile, couple, favoriteMemory } = data;
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditCoupleOpen, setIsEditCoupleOpen] = useState(false);

  const duration = calculateRelationshipDuration(couple.start_date);
  const partnerName = partnerProfile?.display_name || 'Partner';
  const userName = userProfile?.display_name || 'You';
  const coupleTitle = couple.name || `${userName} & ${partnerName}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Back to Us */}
      <Link
        href="/us"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Us</span>
      </Link>

      {/* Hero Cover & Avatars */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-surface/70 border border-border/40 overflow-hidden backdrop-blur-sm shadow-xs"
      >
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-primary/20 via-card to-secondary/20 overflow-hidden">
          {couple.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={couple.cover_image_url}
              alt="Couple Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <Heart className="w-16 h-16 fill-current" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

          {/* Edit Couple button */}
          <button
            onClick={() => setIsEditCoupleOpen(true)}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/80 hover:bg-background text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 text-foreground transition-colors border border-border/40 shadow-xs"
          >
            <Edit className="w-3.5 h-3.5 text-primary" />
            <span>Edit Space</span>
          </button>
        </div>

        {/* Content with Overlapping Avatars */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col items-center text-center">
          {/* Linked Avatars */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-surface bg-card flex items-center justify-center font-serif text-2xl font-medium shadow-md overflow-hidden">
                {userProfile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userProfile.avatar_url} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-xs -mx-2 z-10">
              <Heart className="w-4 h-4 fill-primary" />
            </div>

            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-surface bg-card flex items-center justify-center font-serif text-2xl font-medium shadow-md overflow-hidden">
                {partnerProfile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partnerProfile.avatar_url} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{partnerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Couple Names */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground font-medium tracking-tight">
            {coupleTitle}
          </h1>

          {/* Relationship Duration Counter */}
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5 text-sm sm:text-base text-secondary-foreground font-serif">
            <span className="text-muted-foreground text-xs uppercase tracking-wider font-sans font-medium">
              Together for
            </span>
            <span className="font-semibold">{duration.formatted}</span>
          </div>

          {/* Anniversary */}
          {couple.start_date && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Anniversary: {formatDatePretty(couple.start_date)}</span>
            </div>
          )}

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              className="rounded-xl text-xs gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit My Profile</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quote Card */}
      {couple.quote && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-surface/70 border border-border/40 p-6 md:p-8 backdrop-blur-sm text-center relative overflow-hidden"
        >
          <Quote className="w-8 h-8 text-primary/20 mx-auto mb-2" />
          <p className="text-base sm:text-lg font-serif italic text-foreground/90 max-w-xl mx-auto leading-relaxed">
            &ldquo;{couple.quote}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Love Languages Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-surface/70 border border-border/40 p-5 backdrop-blur-sm space-y-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {userName}&apos;s Love Language
          </span>
          <p className="text-base font-serif text-foreground font-medium">
            {userProfile.love_language || 'Not set yet'}
          </p>
        </div>

        <div className="rounded-3xl bg-surface/70 border border-border/40 p-5 backdrop-blur-sm space-y-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {partnerName}&apos;s Love Language
          </span>
          <p className="text-base font-serif text-foreground font-medium">
            {partnerProfile?.love_language || 'Not set yet'}
          </p>
        </div>
      </div>

      {/* Favorite Memory Showcase */}
      {favoriteMemory && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-primary font-medium flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-primary" />
              A Highlight From Our Journey
            </span>
            <Link
              href="/memories"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>All Memories</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {favoriteMemory.media && favoriteMemory.media.length > 0 && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted/40 max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={favoriteMemory.media[0].url}
                alt={favoriteMemory.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-serif font-medium text-foreground">
              {favoriteMemory.title}
            </h3>
            {favoriteMemory.story && (
              <p className="text-sm font-serif italic text-secondary-foreground/80 mt-1 leading-relaxed">
                &ldquo;{favoriteMemory.story}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={userProfile}
        onSuccess={() => window.location.reload()}
      />

      <EditCoupleDialog
        open={isEditCoupleOpen}
        onOpenChange={setIsEditCoupleOpen}
        couple={couple}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
