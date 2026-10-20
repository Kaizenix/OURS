'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Camera, Mic, ArrowRight, CheckCheck } from 'lucide-react';
import type { Profile } from '@/types/database';
import { formatTimePretty } from '@/lib/date-utils';

interface WhatsAppChatCardProps {
  partnerProfile: Profile | null;
  latestMessage: {
    id: string;
    sender_id: string;
    content: string | null;
    media_url: string | null;
    message_type: string;
    created_at: string;
  } | null;
  unreadCount: number;
}

export function WhatsAppChatCard({
  partnerProfile,
  latestMessage,
  unreadCount,
}: WhatsAppChatCardProps) {
  const partnerName = partnerProfile?.display_name || 'Pasangan';

  const getMessagePreview = () => {
    if (!latestMessage) {
      return 'Belum ada obrolan hari ini. Sapa pasanganmu!';
    }
    const type = latestMessage.message_type;
    if (type === 'audio') return '🎙️ Voice note';
    if (type === 'video') return '📹 Video note';
    if (type === 'image') return '📷 Foto';
    if (type === 'document') return '📎 Dokumen';
    if (type === 'sticker') return '✨ Stiker';
    return latestMessage.content || 'Pesan baru';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="relative overflow-hidden rounded-3xl bg-surface/90 border border-border/50 p-4 md:p-5 shadow-xs hover:border-primary/40 transition-all"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-foreground">Chat Pasangan</h3>
            <p className="text-[11px] text-muted-foreground">WhatsApp style • Privat</p>
          </div>
        </div>

        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <span>Buka</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Partner Chat Preview Item */}
      <Link
        href="/chat"
        className="block bg-card/60 hover:bg-card/90 rounded-2xl p-3 border border-border/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Avatar with active green dot */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-surface border border-border/60 overflow-hidden flex items-center justify-center text-sm font-semibold font-serif">
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
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card ring-1 ring-emerald-500/30" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h4 className="text-sm font-medium text-foreground truncate">{partnerName}</h4>
              {latestMessage && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatTimePretty(latestMessage.created_at)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                {latestMessage && latestMessage.sender_id !== partnerProfile?.id && (
                  <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
                <span className="truncate">{getMessagePreview()}</span>
              </p>

              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold min-w-4 text-center shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Action Shortcuts */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-card/40 hover:bg-card border border-border/30 text-[11px] font-medium text-foreground transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-primary" />
          <span>Obrolan</span>
        </Link>

        <Link
          href="/chat"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-card/40 hover:bg-card border border-border/30 text-[11px] font-medium text-foreground transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>Kamera</span>
        </Link>

        <Link
          href="/chat"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-card/40 hover:bg-card border border-border/30 text-[11px] font-medium text-foreground transition-colors"
        >
          <Mic className="w-3.5 h-3.5 text-primary" />
          <span>Voice Note</span>
        </Link>
      </div>
    </motion.div>
  );
}
