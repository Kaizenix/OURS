'use client';

import { Phone, Video } from 'lucide-react';
import type { Profile } from '@/types/database';

interface ChatHeaderProps {
  partnerProfile: Profile | null;
  isPartnerTyping: boolean;
  onStartAudioCall?: () => void;
  onStartVideoCall?: () => void;
}

export function ChatHeader({
  partnerProfile,
  isPartnerTyping,
  onStartAudioCall,
  onStartVideoCall,
}: ChatHeaderProps) {
  const partnerName = partnerProfile?.display_name || 'Pasangan Anda';

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-4 py-2.5 bg-background/95 border-b border-border/40 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center font-serif text-sm font-medium overflow-hidden shadow-xs">
            {partnerProfile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partnerProfile.avatar_url}
                alt={partnerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{partnerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-medium text-foreground leading-tight truncate">
            {partnerName}
          </h2>
          <p className="text-[11px] text-muted-foreground truncate h-4">
            {isPartnerTyping ? (
              <span className="text-primary italic animate-pulse">
                sedang mengetik...
              </span>
            ) : (
              <span>Ruang privat kita</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onStartAudioCall && (
          <button
            onClick={onStartAudioCall}
            aria-label="Panggilan Suara"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}
        {onStartVideoCall && (
          <button
            onClick={onStartVideoCall}
            aria-label="Panggilan Video"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 active:scale-95 transition-all"
          >
            <Video className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
