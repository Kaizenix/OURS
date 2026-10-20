'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Share2,
  Trash2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  createDisposableRoomAction,
  getActiveDisposableRoomsAction,
  revokeDisposableRoomAction,
  type EphemeralRoom,
} from '../actions';
import type { Profile } from '@/types/database';

interface DisposableRoomManagerProps {
  coupleId: string;
  userProfile: Profile;
  partnerProfile: Profile | null;
}

export function DisposableRoomManager({
  coupleId,
  userProfile,
  partnerProfile,
}: DisposableRoomManagerProps) {
  const [rooms, setRooms] = useState<EphemeralRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confirmRevokeRoom, setConfirmRevokeRoom] = useState<EphemeralRoom | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const active = await getActiveDisposableRoomsAction();
      setRooms(active);
    } catch (err) {
      console.error('Failed to load active rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [coupleId]);

  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) return;
    setCreating(true);
    try {
      const res = await createDisposableRoomAction(roomTitle.trim());
      if (res.success && res.room) {
        setRooms((prev) => [res.room!, ...prev]);
        setShowCreateModal(false);
        setRoomTitle('');
      } else {
        alert(res.error || 'Gagal membuat room');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevokeRoom) return;
    setRevokingId(confirmRevokeRoom.id);
    try {
      const res = await revokeDisposableRoomAction(confirmRevokeRoom.id);
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r.id !== confirmRevokeRoom.id));
        setConfirmRevokeRoom(null);
      } else {
        alert(res.error || 'Gagal menarik link');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setRevokingId(null);
    }
  };

  const copyRoomLink = (roomCode: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(roomCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getRemainingHours = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours} jam ${mins} mnt`;
    return `${mins} menit`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-4 select-none">
      {/* Header Banner */}
      <div className="mb-4 rounded-3xl bg-surface/90 border border-border/50 p-4.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold text-foreground">
                Disposable Group Chat
              </h2>
              <p className="text-xs text-muted-foreground">
                Room 1x pakai (24 jam) • Tamu hanya bisa akses chat & kenangan
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl gap-1.5 bg-primary text-primary-foreground font-medium text-xs h-9 px-3.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Room</span>
          </Button>
        </div>
      </div>

      {/* Room List Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Memuat daftar room...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 rounded-3xl border border-dashed border-border/60 bg-card/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-medium mb-1">Belum Ada Room Aktif</h3>
            <p className="text-xs text-muted-foreground max-w-xs mb-4">
              Buat room 1x pakai untuk mengundang teman ngobrol bareng atau melihat arsip kenangan kalian berdua.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl text-xs bg-primary text-primary-foreground"
            >
              + Buat Room Sekarang
            </Button>
          </div>
        ) : (
          rooms.map((room) => {
            const isCopied = copiedCode === room.room_code;
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3 hover:border-primary/30 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{room.title}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                        {room.room_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Sisa waktu: {getRemainingHours(room.expires_at)}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                    Aktif
                  </span>
                </div>

                <div className="pt-2 border-t border-border/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyRoomLink(room.room_code)}
                      className="h-8 px-2.5 rounded-xl text-xs gap-1.5"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </Button>

                    <a
                      href={`/room/${room.room_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center border border-border/60 bg-background hover:bg-muted/40 h-8 px-2.5 rounded-xl text-xs gap-1.5 transition-colors font-medium text-foreground shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka</span>
                    </a>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmRevokeRoom(room)}
                    className="h-8 px-2.5 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Tarik Link</span>
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-sm rounded-3xl p-5 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Buat Room 1x Pakai</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                Judul Room
              </label>
              <Input
                placeholder="cth: Double Date Malam Ini, Hangout Cafe..."
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                maxLength={40}
                className="rounded-xl text-sm"
              />
            </div>

            <div className="p-3 rounded-2xl bg-surface/80 border border-border/40 text-[11px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Ketentuan Room 1x Pakai:</p>
              <p>• Berlaku selama 24 jam sejak dibuat.</p>
              <p>• Tamu bisa atur nama panggilan sendiri saat bergabung.</p>
              <p>• Tamu hanya bisa mengakses chat room ini & melihat arsip kenangan berdua.</p>
              <p>• Jika ditarik (&quot;Tarik Link&quot;), riwayat obrolan room langsung terhapus permanen.</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={creating || !roomTitle.trim()}
              className="rounded-xl text-xs bg-primary text-primary-foreground"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat & Dapatkan Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM REVOKE MODAL */}
      <Dialog open={!!confirmRevokeRoom} onOpenChange={() => setConfirmRevokeRoom(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-5 border-border bg-card">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="font-serif text-lg">Tarik Link Room?</DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            Yakin ingin menarik link untuk <span className="font-semibold text-foreground">{confirmRevokeRoom?.title}</span>?
            Akses semua tamu akan langsung terputus dan semua pesan obrolan di room ini akan dihapus permanen.
          </p>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              onClick={() => setConfirmRevokeRoom(null)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={!!revokingId}
              className="rounded-xl text-xs gap-1.5"
            >
              {revokingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>Ya, Tarik & Hapus</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
