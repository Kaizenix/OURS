'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, Heart, Loader2, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { sendSnapAction } from '../actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { formatTimePretty } from '@/lib/date-utils';
import type { Snap, Profile } from '@/types/database';

interface LocketWidgetProps {
  coupleId: string;
  initialSnap: Snap | null;
  userProfile: Profile;
  partnerProfile: Profile | null;
}

export function LocketWidget({
  coupleId,
  initialSnap,
  userProfile,
  partnerProfile,
}: LocketWidgetProps) {
  const [snap, setSnap] = useState<Snap | null>(initialSnap);
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [sending, setSending] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Listen for realtime snaps
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`snaps_${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'snaps',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          setSnap(payload.new as Snap);
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 2000);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [coupleId, supabase]);

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowSnapModal(true);
  };

  const handleSendSnap = async () => {
    if (!selectedFile || sending) return;

    setSending(true);
    try {
      const uploadedUrl = await uploadFileToStorage(selectedFile, 'photos', 'locket');
      const res = await sendSnapAction(uploadedUrl, caption);
      if (res.success && res.snap) {
        setSnap(res.snap);
        setShowSnapModal(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        setCaption('');
      }
    } catch (err) {
      console.error('Failed to send snap:', err);
      alert('Gagal mengirim snap. Pastikan file foto valid.');
    } finally {
      setSending(false);
    }
  };

  const senderName =
    snap?.user_id === userProfile.id
      ? 'Anda'
      : partnerProfile?.display_name || 'Pasangan Anda';

  return (
    <>
      <div className="relative p-4 rounded-3xl bg-card border border-border/40 shadow-xs overflow-hidden select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium leading-none font-serif">Locket Langsung</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Momen instan bersama pasangan</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kirim Snap</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePickPhoto}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Locket Photo Frame */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-border/30 flex items-center justify-center">
          {snap?.image_url ? (
            <motion.div
              key={snap.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative w-full h-full cursor-pointer"
              onDoubleClick={() => {
                setShowHeart(true);
                setTimeout(() => setShowHeart(false), 1200);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snap.image_url}
                alt="Locket snap"
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Bottom gradient caption overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 pt-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white flex items-end justify-between">
                <div className="min-w-0 pr-2">
                  {snap.caption && (
                    <p className="text-xs font-medium line-clamp-2 leading-tight drop-shadow-sm">
                      &ldquo;{snap.caption}&rdquo;
                    </p>
                  )}
                  <p className="text-[10px] text-white/75 mt-0.5">
                    Dikirim oleh {senderName} • {formatTimePretty(snap.created_at)}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
              </div>

              {/* Heart Burst on Double Tap */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart className="w-20 h-20 fill-rose-500 text-rose-500 drop-shadow-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Camera className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">Belum ada snap hari ini</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                Kirim foto langsung dari kameramu untuk tampil di layar pasanganmu.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Kirim Snap */}
      {showSnapModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-sm font-medium">Kirim Snap Langsung</h4>
              <button
                onClick={() => {
                  setShowSnapModal(false);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis pesan kecil (misal: 'Lagi makan siang 🥰')"
              className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/50 text-xs focus:border-primary focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSnapModal(false);
                  setPreviewUrl(null);
                  setSelectedFile(null);
                }}
                className="flex-1 h-10 rounded-xl text-xs font-medium border border-border hover:bg-muted/30"
              >
                Batal
              </button>
              <button
                onClick={handleSendSnap}
                disabled={sending}
                className="flex-1 h-10 rounded-xl text-xs font-medium bg-primary text-primary-foreground flex items-center justify-center gap-1.5 shadow-xs"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim ke Pasangan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
