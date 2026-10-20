'use client';

import { Heart } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ChatHeaderProps {
  partnerProfile: Profile | null;
  isPartnerTyping: boolean;
}

export function ChatHeader({ partnerProfile, isPartnerTyping }: ChatHeaderProps) {
  const partnerName = partnerProfile?.display_name || 'Partner';

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center font-serif text-sm font-medium overflow-hidden">
            {partnerProfile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partnerProfile.avatar_url}
                alt={partnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{partnerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>

        <div>
          <h2 className="text-sm font-medium text-foreground leading-tight flex items-center gap-1.5">
            <span>{partnerName}</span>
          </h2>
          <p className="text-[11px] text-muted-foreground h-3.5">
            {isPartnerTyping ? (
              <span className="text-primary italic animate-pulse">
                typing a message...
              </span>
            ) : (
              <span>Private digital space</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="p-2 rounded-full text-muted-foreground">
          <Heart className="w-4 h-4 text-primary/70 fill-primary/20" />
        </div>
      </div>
    </div>
  );
}
