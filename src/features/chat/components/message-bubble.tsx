'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Reply,
  Edit2,
  Trash2,
  Bookmark,
  Check,
  CheckCheck,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* The Bubble */}
        <div
          className={`relative rounded-3xl px-4 py-2.5 text-sm transition-all shadow-xs ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-xs'
              : 'bg-card text-foreground rounded-bl-xs border border-border/40'
          }`}
        >
          {/* Pinned as Memory Badge */}
          {message.is_memory && (
            <div className="flex items-center gap-1 text-[11px] font-medium opacity-80 mb-1 border-b border-current/20 pb-1">
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
            <div className="mb-2 overflow-hidden rounded-2xl max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.image_url}
                alt="Shared attachment"
                className="w-full h-auto object-cover max-h-72 rounded-2xl"
              />
            </div>
          )}

          {/* Text Content or Voice Note Player */}
          {message.content && (
            message.content.startsWith('🎤 Voice note') ? (
              <VoiceNotePlayer
                audioUrl={message.content.split(': ').slice(1).join(': ')}
                isOwn={isOwn}
              />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                {message.content}
              </p>
            )
          )}

          {/* Footer info: time, edited, status */}
          <div
            className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
              isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
            }`}
          >
            {message.is_edited && <span>(edited)</span>}
            <span>{formatTimePretty(message.created_at)}</span>
            {isOwn && (
              <CheckCheck className="w-3 h-3 opacity-80" />
            )}
          </div>
        </div>

        {/* Hover Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pb-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="rounded-2xl min-w-[140px]">
              <DropdownMenuItem onClick={() => onReply(message)} className="gap-2 text-xs">
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onPinToMemory(message.id)} className="gap-2 text-xs">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Pin to Memories</span>
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

          {/* Quick emoji reaction toggle */}
          <button
            onClick={() => setShowReactionsBar(!showReactionsBar)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs"
            title="React"
          >
            😊
          </button>
        </div>
      </div>

      {/* Floating Reaction Picker */}
      {showReactionsBar && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-1 p-1 bg-surface border border-border/50 rounded-full shadow-lg z-20 mt-1 ${
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
              className="p-1.5 hover:scale-125 transition-transform text-sm"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      {/* Reaction Clusters displayed below bubble */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'mr-1 justify-end' : 'ml-1 justify-start'}`}>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface border border-border/50 text-foreground hover:scale-105 transition-transform shadow-2xs"
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-[10px] text-muted-foreground font-mono">{count}</span>}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
