'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Image as ImageIcon,
  Send,
  Camera,
  Clock,
  Sparkles,
  Users,
  AlertCircle,
  Loader2,
  Calendar,
  X,
  User,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import {
  sendEphemeralMessageAction,
  type EphemeralRoom,
  type EphemeralMessage,
} from '../actions';
import type { MemoryWithMedia } from '@/types/database';
import { formatTimePretty, formatDatePretty } from '@/lib/date-utils';

interface GuestRoomContainerProps {
  room: EphemeralRoom;
  initialMessages: EphemeralMessage[];
  sharedMemories: MemoryWithMedia[];
  currentUser?: { id: string; display_name: string } | null;
}

export function GuestRoomContainer({
  room,
  initialMessages,
  sharedMemories,
  currentUser,
}: GuestRoomContainerProps) {
  const isHost = Boolean(currentUser && currentUser.id === room.created_by);

  const [guestName, setGuestName] = useState<string>('');
  const [guestId, setGuestId] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [tempNameInput, setTempNameInput] = useState('');

  const [activeTab, setActiveTab] = useState<'chat' | 'memories'>('chat');
  const [messages, setMessages] = useState<EphemeralMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRevoked, setIsRevoked] = useState(room.is_revoked);
  const [selectedMemory, setSelectedMemory] = useState<MemoryWithMedia | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Initialize guest identity from sessionStorage or authenticated user
  useEffect(() => {
    if (isHost && currentUser) {
      setGuestName(currentUser.display_name || 'Host');
      setGuestId(currentUser.id);
      setIsNameSet(true);
      return;
    }

    const storageKeyName = `ours_guest_name_${room.room_code}`;
    const storageKeyId = `ours_guest_id_${room.room_code}`;

    const savedName = sessionStorage.getItem(storageKeyName);
    let savedId = sessionStorage.getItem(storageKeyId);

    if (!savedId) {
      savedId = 'guest_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(storageKeyId, savedId);
    }
    setGuestId(savedId);

    if (savedName) {
      setGuestName(savedName);
      setIsNameSet(true);
    }
  }, [room.room_code, isHost, currentUser]);

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNameInput.trim()) return;
    const name = tempNameInput.trim();
    setGuestName(name);
    sessionStorage.setItem(`ours_guest_name_${room.room_code}`, name);
    setIsNameSet(true);
  };

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (isNameSet && activeTab === 'chat') {
      scrollToBottom(false);
    }
  }, [isNameSet, activeTab]);

  // Realtime subscription for room messages & room revocation
  useEffect(() => {
    const channel = supabase
      .channel(`room_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ephemeral_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const newMsg = payload.new as EphemeralMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => scrollToBottom(true), 50);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ephemeral_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updated = payload.new as EphemeralRoom;
          if (updated.is_revoked) {
            setIsRevoked(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, supabase]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await sendEphemeralMessageAction({
        roomId: room.id,
        senderName: guestName,
        senderId: guestId,
        isHost,
        content,
      });

      if (!res.success) {
        alert(res.error || 'Gagal mengirim pesan');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadFileToStorage(file, 'photos', 'room_snaps');
      if (publicUrl) {
        await sendEphemeralMessageAction({
          roomId: room.id,
          senderName: guestName,
          senderId: guestId,
          isHost,
          content: '📷 Mengirim foto',
          imageUrl: publicUrl,
        });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // If host revoked the room
  if (isRevoked) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-background text-foreground select-none">
        <div className="max-w-md w-full text-center p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold">Link Room Ditarik</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Host telah menarik link room ini atau durasi 24 jam telah berakhir. Semua riwayat obrolan telah dibersihkan secara otomatis.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  // STEP 1: Nickname Input Modal for Guests
  if (!isNameSet) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-background text-foreground select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full p-6 rounded-3xl bg-card border border-border/60 shadow-xl space-y-4"
        >
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              Room 1x Pakai
            </span>
            <h2 className="font-serif text-lg font-semibold mt-1">{room.title}</h2>
            <p className="text-xs text-muted-foreground">
              Masukkan nama panggilanmu untuk bergabung ke roomchat ini.
            </p>
          </div>

          <form onSubmit={handleSaveNickname} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Nama Panggilan
              </label>
              <Input
                placeholder="cth: Sarah, Alex, Budi..."
                value={tempNameInput}
                onChange={(e) => setTempNameInput(e.target.value)}
                maxLength={24}
                autoFocus
                className="rounded-xl text-sm h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={!tempNameInput.trim()}
              className="w-full h-11 rounded-xl text-xs font-medium bg-primary text-primary-foreground"
            >
              Masuk Obrolan
            </Button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground">
            Akses berlaku selama 24 jam. Kamu dapat melihat chat dan kenangan yang dibagikan.
          </p>
        </motion.div>
      </div>
    );
  }

  // STEP 2: Active Room UI (Chat & Memories Tabs)
  return (
    <div className="h-dvh max-w-xl mx-auto flex flex-col bg-background text-foreground border-x border-border/30 select-none overflow-hidden">
      {/* Top Bar */}
      <header className="shrink-0 p-3.5 border-b border-border/40 bg-surface/90 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-sm font-semibold truncate">{room.title}</h1>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
              {room.room_code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{guestName} {isHost && '(Host)'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-500">
              <Clock className="w-3 h-3" />
              <span>1x Pakai</span>
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 rounded-xl bg-card border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'memories'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Kenangan</span>
          </button>
        </div>
      </header>

      {/* Main Tab View */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Messages Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-3 overscroll-contain"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-foreground">Ruang Obrolan Dimulai</p>
                <p className="text-[11px] mt-1 max-w-xs">
                  Sapa semuanya! Chat ini satu kali pakai dan akan dihapus otomatis setelah 24 jam.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === guestId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender Label */}
                    {!isMine && (
                      <div className="flex items-center gap-1 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-foreground">
                          {msg.sender_name}
                        </span>
                        {msg.is_host && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                            Host
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 shadow-xs ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-card text-card-foreground border border-border/50 rounded-bl-xs'
                      }`}
                    >
                      {msg.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.image_url}
                          alt="Lampiran"
                          className="rounded-xl max-h-56 w-full object-cover mb-2"
                        />
                      )}

                      {msg.content && (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}

                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isMine ? 'text-primary-foreground/75' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimePretty(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Bar */}
          <footer className="shrink-0 p-3 border-t border-border/40 bg-surface/90">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>

              <Input
                placeholder="Tulis pesan..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={500}
                className="flex-1 h-10 rounded-2xl text-xs bg-card border-border/60"
              />

              <Button
                type="submit"
                size="icon"
                disabled={sending || !inputText.trim()}
                className="h-10 w-10 rounded-full shrink-0 bg-primary text-primary-foreground shadow-xs"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </footer>
        </div>
      ) : (
        /* KENANGAN (MEMORIES) ARCHIVE VIEW FOR GUESTS */
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-surface/80 border border-border/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold">Arsip Kenangan</h3>
              <p className="text-[11px] text-muted-foreground">
                Koleksi momen & photobooth dari pasangan OURS
              </p>
            </div>
          </div>

          {sharedMemories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              Belum ada kenangan yang dibagikan.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sharedMemories.map((m) => {
                const cover = m.media?.[0]?.url;
                return (
                  <motion.div
                    key={m.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMemory(m)}
                    className="cursor-pointer group rounded-2xl overflow-hidden border border-border/40 bg-card p-2 space-y-2 shadow-xs hover:border-primary/40 transition-all"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-surface relative">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif text-xs font-semibold text-foreground truncate">
                        {m.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDatePretty(m.memory_date)}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MEMORY LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-card border border-border p-4 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-semibold">{selectedMemory.title}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDatePretty(selectedMemory.memory_date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMemory(null)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedMemory.media?.[0]?.url && (
                <div className="rounded-2xl overflow-hidden border border-border/40 max-h-72 w-full bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMemory.media[0].url}
                    alt={selectedMemory.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {selectedMemory.story && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedMemory.story}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
