'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Reply,
  Edit2,
  Trash2,
  Bookmark,
  CheckCheck,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MessageWithSender } from '@/types/database';
import { formatTimePretty } from '@/lib/date-utils';
import { VoiceNotePlayer } from './voice-note-player';
import { VideoNotePlayer } from './video-note-player';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  onReply: (msg: MessageWithSender) => void;
  onEdit: (msg: MessageWithSender) => void;
  onDelete: (msgId: string) => void;
  onReact: (msgId: string, emoji: string) => void;
  onPinToMemory: (msgId: string) => void;
}

const COMMON_REACTIONS = ['❤️', '✨', '🥺', '😊', '🫂'];

export function MessageBubble({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPinToMemory,
}: MessageBubbleProps) {
  const [showReactionsBar, setShowReactionsBar] = useState(false);

  // Group reactions by emoji
  const reactionCounts: Record<string, number> = {};
  message.reactions?.forEach((r) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });

  const isSticker = message.content?.startsWith('[sticker:') && message.content.endsWith(']');
  const stickerChar = isSticker ? message.content?.slice(9, -1) : null;

  const isVideoNote = message.content?.startsWith('📹 Video note:');
  const videoUrl = isVideoNote ? message.content?.split('📹 Video note: ')[1]?.trim() : null;

  const isVoiceNote = message.content?.startsWith('🎤 Voice note');
  const audioUrl = isVoiceNote ? message.content?.split(': ').slice(1).join(': ') : null;

  const isDocument = message.content?.startsWith('📄 Dokumen:');
  const docInfo = isDocument ? message.content?.replace('📄 Dokumen: ', '') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex flex-col mb-2.5 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-end gap-1.5 max-w-[88%] sm:max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Partner avatar if incoming message */}
        {!isOwn && (
          <div className="w-7 h-7 rounded-full overflow-hidden border border-border/60 bg-surface shrink-0 self-end mb-1 flex items-center justify-center text-[10px] font-serif shadow-xs relative">
            <span className="font-semibold text-foreground/80">
              {(message.sender?.display_name || 'P').charAt(0).toUpperCase()}
            </span>
            {message.sender?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.sender.avatar_url}
                alt={message.sender?.display_name || 'Partner'}
                className="w-full h-full object-cover absolute inset-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
        )}

        {/* If it's a Sticker */}
        {isSticker && stickerChar ? (
          <div className="text-6xl p-2 select-none hover:scale-110 transition-transform">
            {stickerChar}
          </div>
        ) : isVideoNote && videoUrl ? (
          /* Video Note Circular Bubble */
          <div className="relative">
            <VideoNotePlayer videoUrl={videoUrl} isOwn={isOwn} />
            <div
              className={`flex items-center justify-end gap-1 mt-0.5 text-[10px] ${
                isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
              }`}
            >
              <span>{formatTimePretty(message.created_at)}</span>
              {isOwn && <CheckCheck className="w-3 h-3 opacity-80" />}
            </div>
          </div>
        ) : (
          /* Standard Bubble */
          <div
            className={`relative rounded-2xl px-3.5 py-2 text-sm transition-all shadow-xs ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-xs'
                : 'bg-card text-foreground rounded-bl-xs border border-border/40'
            }`}
          >
            {/* Pinned as Memory Badge */}
            {message.is_memory && (
              <div className="flex items-center gap-1 text-[11px] font-medium opacity-85 mb-1 border-b border-current/20 pb-1">
                <Bookmark className="w-3 h-3 fill-current" />
                <span>Saved to Memories</span>
              </div>
            )}

            {/* Reply Context if exists */}
            {message.reply_to && (
              <div
                className={`mb-1.5 px-2.5 py-1 rounded-xl text-xs border-l-2 bg-black/10 text-current/80 truncate ${
                  isOwn ? 'border-primary-foreground/50' : 'border-primary'
                }`}
              >
                <span className="font-semibold block text-[10px] uppercase opacity-75">Replying to</span>
                <span className="truncate block">Quoted message</span>
              </div>
            )}

            {/* Image Attachment */}
            {message.image_url && (
              <div className="mb-2 overflow-hidden rounded-xl max-w-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.image_url}
                  alt="Attachment"
                  loading="lazy"
                  className="w-full h-auto object-cover max-h-72 rounded-xl"
                />
              </div>
            )}

            {/* Voice Note Player */}
            {isVoiceNote && audioUrl ? (
              <VoiceNotePlayer audioUrl={audioUrl} isOwn={isOwn} />
            ) : isDocument && docInfo ? (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/10">
                <FileText className="w-5 h-5 shrink-0 opacity-80" />
                <a
                  href={docInfo.split(' — ')[1] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium underline truncate hover:opacity-80"
                >
                  {docInfo.split(' — ')[0] || 'Download Document'}
                </a>
              </div>
            ) : (
              message.content && (
                <p className="whitespace-pre-wrap leading-relaxed select-text font-sans text-[13.5px]">
                  {message.content}
                </p>
              )
            )}

            {/* Footer info: time, edited, status */}
            <div
              className={`flex items-center justify-end gap-1.5 mt-0.5 text-[10px] ${
                isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
              }`}
            >
              {message.is_edited && <span>(edited)</span>}
              <span>{formatTimePretty(message.created_at)}</span>
              {isOwn && <CheckCheck className="w-3 h-3 opacity-80" />}
            </div>
          </div>
        )}

        {/* Hover Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="rounded-xl min-w-[140px]">
              <DropdownMenuItem onClick={() => onReply(message)} className="gap-2 text-xs">
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onPinToMemory(message.id)} className="gap-2 text-xs">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Memories</span>
              </DropdownMenuItem>

              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(message)} className="gap-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reaction trigger */}
          <button
            onClick={() => setShowReactionsBar(!showReactionsBar)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs"
            title="React"
          >
            ❤️
          </button>
        </div>
      </div>

      {/* Floating Reaction Bar */}
      {showReactionsBar && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-1 p-1 mt-1 rounded-full bg-card border border-border/50 shadow-md ${
            isOwn ? 'mr-2' : 'ml-2'
          }`}
        >
          {COMMON_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji);
                setShowReactionsBar(false);
              }}
              className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      {/* Displayed Reactions badges */}
      {Object.keys(reactionCounts).length > 0 && (
        <div
          className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'mr-1 justify-end' : 'ml-8 justify-start'}`}
        >
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-card border border-border/40 text-foreground shadow-xs hover:border-primary/40 transition-colors"
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-[10px] opacity-75">{count}</span>}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
