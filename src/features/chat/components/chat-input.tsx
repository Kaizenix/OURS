'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Square,
  X,
  MessageSquareQuote,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import type { MessageWithSender } from '@/types/database';

interface ChatInputProps {
  onSendMessage: (content: string, imageUrl?: string | null) => Promise<void>;
  onTyping: () => void;
  replyingTo: MessageWithSender | null;
  onCancelReply: () => void;
  discussQuestion?: string | null;
  onClearDiscussQuestion?: () => void;
}

export function ChatInput({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
  discussQuestion,
  onClearDiscussQuestion,
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    recordingSeconds,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (discussQuestion) {
      setContent(`Tentang pertanyaan hari ini: "${discussQuestion}" — `);
      inputRef.current?.focus();
    }
  }, [discussQuestion]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadFileToStorage(file, 'photos', 'chat');
      setImageUrl(uploadedUrl);
      setShowImageInput(true);
    } catch {
      // Local fallback
      setImageUrl(URL.createObjectURL(file));
      setShowImageInput(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !imageUrl.trim()) || sending) return;

    setSending(true);
    try {
      await onSendMessage(content.trim(), imageUrl.trim() || null);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      if (discussQuestion && onClearDiscussQuestion) {
        onClearDiscussQuestion();
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendVoiceNote = async () => {
    const result = await stopRecording();
    if (!result) return;

    setSending(true);
    try {
      await onSendMessage(`🎤 Voice note (${result.durationSeconds}s): ${result.url}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onTyping();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky bottom-0 z-20 bg-background/95 border-t border-border/40 p-2.5 md:p-3">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-card border border-border/40 text-xs">
          <div className="truncate">
            <span className="text-primary font-medium">Membalas: </span>
            <span className="text-muted-foreground truncate">
              {replyingTo.content || 'Lampiran foto'}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Discuss Question banner */}
      {discussQuestion && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-primary/10 border border-primary/20 text-xs">
          <div className="flex items-center gap-1.5 truncate text-primary font-medium">
            <MessageSquareQuote className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Membahas: &ldquo;{discussQuestion}&rdquo;</span>
          </div>
          <button
            onClick={onClearDiscussQuestion}
            className="p-1 text-primary/70 hover:text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Preview attachment */}
      {showImageInput && imageUrl && (
        <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-border max-w-[120px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Lampiran" className="w-24 h-24 object-cover" />
          <button
            onClick={() => {
              setImageUrl('');
              setShowImageInput(false);
            }}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Audio Recording State */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-primary">
              Merekam {formatTimer(recordingSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Batal
            </button>
            <Button
              onClick={handleSendVoiceNote}
              size="sm"
              disabled={sending}
              className="h-8 rounded-xl bg-primary text-primary-foreground text-xs gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Kirim</span>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            aria-label="Pilih foto"
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            {uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={startRecording}
            aria-label="Rekam pesan suara"
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>

          <Input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan untuknya..."
            disabled={sending}
            className="flex-1 h-10 rounded-2xl bg-card border-border/40 focus:border-primary text-sm px-3.5"
          />

          <Button
            type="submit"
            size="sm"
            disabled={(!content.trim() && !imageUrl.trim()) || sending}
            className="h-10 w-10 p-0 rounded-full shrink-0 shadow-xs"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
