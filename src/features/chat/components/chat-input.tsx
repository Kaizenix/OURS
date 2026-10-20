'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Image, X, Loader2, MessageSquareQuote, Mic, Trash2, StopCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MessageWithSender } from '@/types/database';
import { useAudioRecorder } from '@/features/chat/hooks/use-audio-recorder';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface ChatInputProps {
  onSendMessage: (content: string, imageUrl?: string | null) => Promise<void>;
  replyingTo: MessageWithSender | null;
  onCancelReply: () => void;
  discussQuestion?: string | null;
  onClearDiscussQuestion?: () => void;
  onTyping: () => void;
}

export function ChatInput({
  onSendMessage,
  replyingTo,
  onCancelReply,
  discussQuestion,
  onClearDiscussQuestion,
  onTyping,
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
      setContent(`Regarding today's question: "${discussQuestion}" — `);
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
      // Store voice note in content or storage
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
    <div className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-border/40 p-3 md:p-4">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-card border border-border/40 text-xs">
          <div className="truncate">
            <span className="text-primary font-medium">Replying to: </span>
            <span className="text-muted-foreground truncate">
              {replyingTo.content || 'Photo attachment'}
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
            <span className="truncate">Discussing: &ldquo;{discussQuestion}&rdquo;</span>
          </div>
          {onClearDiscussQuestion && (
            <button
              onClick={onClearDiscussQuestion}
              className="p-1 text-primary hover:text-primary/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Image Attachment Preview Drawer */}
      {showImageInput && (
        <div className="flex items-center gap-2 mb-2 p-2 rounded-2xl bg-card border border-border/40">
          {imageUrl ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-background border border-border/50 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Attachment" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste photo URL or pick from device..."
            className="h-9 text-xs rounded-xl bg-background border-border/50 flex-1"
          />

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="h-9 px-2.5 text-xs rounded-xl gap-1"
          >
            {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>File</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowImageInput(false)}
            className="h-9 px-2 text-xs text-muted-foreground"
          >
            Done
          </Button>
        </div>
      )}

      {/* Hidden file input for native device images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Recording Mode Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-2xl p-2 px-4 animate-pulse">
          <div className="flex items-center gap-2 text-primary text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <span>Recording voice note... {formatTimer(recordingSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendVoiceNote}
              disabled={sending}
              className="rounded-xl h-8 px-3 text-xs gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Main Input Bar */
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Image button */}
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className={`p-2.5 rounded-2xl border transition-colors ${
              showImageInput || imageUrl
                ? 'bg-primary/15 border-primary text-primary'
                : 'bg-card border-border/40 text-muted-foreground hover:text-foreground'
            }`}
            title="Attach image from camera/gallery"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Voice note recorder button */}
          <button
            type="button"
            onClick={startRecording}
            className="p-2.5 rounded-2xl border bg-card border-border/40 text-muted-foreground hover:text-primary transition-colors"
            title="Record voice note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                onTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Say something to your love..."
              className="h-11 rounded-2xl bg-card border-border/40 focus:border-primary text-sm pr-10"
            />
          </div>

          <Button
            type="submit"
            disabled={(!content.trim() && !imageUrl.trim()) || sending}
            className="h-11 w-11 rounded-2xl p-0 flex items-center justify-center shrink-0"
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
