'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Camera,
  FileText,
  Smile,
  Mic,
  Video,
  Square,
  X,
  Plus,
  MessageSquareQuote,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { StickerDrawer } from './sticker-drawer';
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Video note state
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording: isAudioRecording,
    recordingSeconds,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    cancelRecording: cancelAudioRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (discussQuestion) {
      setContent(`Tentang daily question: "${discussQuestion}" — `);
      inputRef.current?.focus();
    }
  }, [discussQuestion]);

  // ==========================================
  // Image & Document Handlers
  // ==========================================
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setShowAttachMenu(false);
    try {
      const uploadedUrl = await uploadFileToStorage(file, 'photos', 'chat');
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error('Chat photo upload error:', err);
      alert('Gagal mengunggah foto ke storage. Pastikan koneksi internet stabil.');
    } finally {
      setUploading(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setShowAttachMenu(false);
    try {
      const uploadedUrl = await uploadFileToStorage(file, 'photos', 'docs');
      await onSendMessage(`📄 Dokumen: ${file.name} — ${uploadedUrl}`);
    } catch (err) {
      console.error('Doc upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // Voice Note Handler (Real Storage Upload)
  // ==========================================
  const handleSendVoiceNote = async () => {
    const result = await stopAudioRecording();
    if (!result) return;

    setSending(true);
    try {
      // Convert recorded blob into a File and upload to Supabase
      const ext = result.blob.type.includes('mp4') ? 'mp4' : 'webm';
      const audioFile = new File([result.blob], `vn-${Date.now()}.${ext}`, {
        type: result.blob.type || 'audio/webm',
      });

      let publicAudioUrl = result.url;
      try {
        publicAudioUrl = await uploadFileToStorage(audioFile, 'photos', 'voicenotes');
      } catch (uploadErr) {
        console.error('Voice note storage upload fallback:', uploadErr);
      }

      await onSendMessage(`🎤 Voice note (${result.durationSeconds}s): ${publicAudioUrl}`);
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // Video Note Handler (Circular Video Message)
  // ==========================================
  const startVideoNote = async () => {
    setShowAttachMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } },
        audio: true,
      });

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      videoChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      videoMediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      mr.start();
      setIsVideoRecording(true);
      setVideoTimer(0);

      videoTimerRef.current = setInterval(() => {
        setVideoTimer((sec) => {
          if (sec >= 59) {
            stopVideoNote();
            return 60;
          }
          return sec + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Video note access error:', err);
      alert('Kamera atau mikrofon tidak dapat diakses.');
    }
  };

  const stopVideoNote = async () => {
    const mr = videoMediaRecorderRef.current;
    if (!mr) return;

    if (videoTimerRef.current) clearInterval(videoTimerRef.current);

    mr.onstop = async () => {
      mr.stream.getTracks().forEach((track) => track.stop());
      setIsVideoRecording(false);
      setSending(true);

      try {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `vn-video-${Date.now()}.webm`, { type: 'video/webm' });
        const publicUrl = await uploadFileToStorage(videoFile, 'photos', 'videonotes');
        await onSendMessage(`📹 Video note: ${publicUrl}`);
      } catch (err) {
        console.error('Video note upload error:', err);
      } finally {
        setSending(false);
      }
    };

    mr.stop();
  };

  const cancelVideoNote = () => {
    const mr = videoMediaRecorderRef.current;
    if (mr) {
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      mr.stream.getTracks().forEach((track) => track.stop());
      setIsVideoRecording(false);
      setVideoTimer(0);
      videoChunksRef.current = [];
    }
  };

  // ==========================================
  // Text Submit
  // ==========================================
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!content.trim() && !imageUrl.trim()) || sending) return;

    setSending(true);
    try {
      await onSendMessage(content.trim(), imageUrl.trim() || null);
      setContent('');
      setImageUrl('');
      if (discussQuestion && onClearDiscussQuestion) {
        onClearDiscussQuestion();
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onTyping();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-background/95 border-t border-border/40 select-none">
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocUpload}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-card/80 border-b border-border/30 text-xs">
          <div className="truncate">
            <span className="text-primary font-medium">Replying: </span>
            <span className="text-muted-foreground truncate">{replyingTo.content || 'Foto'}</span>
          </div>
          <button onClick={onCancelReply} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Discuss Question banner */}
      {discussQuestion && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-xs">
          <div className="flex items-center gap-1.5 truncate text-primary font-medium">
            <MessageSquareQuote className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Discuss: &ldquo;{discussQuestion}&rdquo;</span>
          </div>
          <button onClick={onClearDiscussQuestion} className="p-1 text-primary/70 hover:text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Preview attachment */}
      {imageUrl && (
        <div className="p-2 border-b border-border/20">
          <div className="relative inline-block rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover" />
            <button
              onClick={() => setImageUrl('')}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp-style Video Note Recording View */}
      {isVideoRecording && (
        <div className="flex flex-col items-center justify-center p-3 bg-neutral-950 text-white space-y-2">
          <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-rose-500 shadow-xl bg-black">
            <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono text-rose-400">
              {videoTimer}s / 60s
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={cancelVideoNote}
              className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <Button
              onClick={stopVideoNote}
              size="sm"
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs px-4"
            >
              Send Video Note
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp-style Attachment Popup Menu */}
      {showAttachMenu && (
        <div className="p-3 bg-card border-b border-border/40 grid grid-cols-4 gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-surface hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/15 text-pink-500 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Kamera</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-surface hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Galeri</span>
          </button>

          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-surface hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Dokumen</span>
          </button>

          <button
            type="button"
            onClick={startVideoNote}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-surface hover:bg-muted/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Video Note</span>
          </button>
        </div>
      )}

      {/* Stickers Drawer */}
      {showStickers && (
        <StickerDrawer
          onSelectSticker={(sticker) => onSendMessage(sticker)}
          onClose={() => setShowStickers(false)}
        />
      )}

      {/* Audio Recording Bar */}
      {isAudioRecording ? (
        <div className="flex items-center justify-between p-2.5 bg-primary/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-primary">
              Recording VN ({recordingSeconds}s)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cancelAudioRecording}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <Button
              onClick={handleSendVoiceNote}
              size="sm"
              disabled={sending}
              className="h-8 rounded-full bg-primary text-primary-foreground text-xs gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Send VN</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Normal Chat Bar (WhatsApp style) */
        <div className="p-2 md:p-2.5 flex items-center gap-1.5">
          {/* Plus / Attach Button */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowStickers(false);
            }}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Attach"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Sticker / Emoji Button */}
          <button
            type="button"
            onClick={() => {
              setShowStickers(!showStickers);
              setShowAttachMenu(false);
            }}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            title="Stickers"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <Input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending || uploading}
            className="flex-1 h-10 rounded-2xl bg-card border-border/40 focus:border-primary text-sm px-3.5"
          />

          {/* Camera Quick Button if empty text */}
          {!content.trim() && !imageUrl && (
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title="Camera"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}

          {/* Voice Note Button (if empty text) OR Send Button (if has text/image) */}
          {content.trim() || imageUrl ? (
            <Button
              type="button"
              onClick={() => handleSubmit()}
              size="sm"
              disabled={sending || uploading}
              className="h-10 w-10 p-0 rounded-full shrink-0 shadow-xs"
            >
              {sending || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <button
              type="button"
              onClick={startAudioRecording}
              className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center shrink-0 transition-all active:scale-95"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
