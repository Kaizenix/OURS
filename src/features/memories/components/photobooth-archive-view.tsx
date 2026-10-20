'use client';

import { useState, useRef } from 'react';
import {
  Camera,
  Calendar as CalendarIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Loader2,
  X,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createMemoryAction } from '../actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { formatDatePretty } from '@/lib/date-utils';
import type { MemoryWithMedia } from '@/types/database';

interface PhotoboothArchiveViewProps {
  initialMemories: MemoryWithMedia[];
}

export function PhotoboothArchiveView({ initialMemories }: PhotoboothArchiveViewProps) {
  const [memories, setMemories] = useState<MemoryWithMedia[]>(initialMemories);
  const [activeTab, setActiveTab] = useState<'photobooth' | 'archive'>('photobooth');

  // Photobooth state
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMemory = memories.find((m) => m.memory_date === todayStr);

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Archive Calendar state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedMemory, setSelectedMemory] = useState<MemoryWithMedia | null>(null);

  // ==========================================
  // Photobooth Handlers
  // ==========================================
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedPhoto(file);
    setPreviewPhotoUrl(URL.createObjectURL(file));
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setPreviewPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveMemory = async () => {
    if (!capturedPhoto || !title.trim() || saving) return;

    setSaving(true);
    try {
      const uploadedUrl = await uploadFileToStorage(capturedPhoto, 'photos', 'memories');
      const created = await createMemoryAction({
        title: title.trim(),
        story: story.trim() || undefined,
        memory_date: todayStr,
        imageUrl: uploadedUrl,
      });

      setMemories((prev) => [created, ...prev]);
      handleRetake();
      setTitle('');
      setStory('');
    } catch (err) {
      console.error('Save photobooth error:', err);
      alert('Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Calendar Helpers (Instagram Archive Style)
  // ==========================================
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust for Monday start (0: Mon, ..., 6: Sun)
  const startOffset = (firstDayOfMonth + 6) % 7;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Map memories by date string (YYYY-MM-DD)
  const memoriesByDate: Record<string, MemoryWithMedia> = {};
  memories.forEach((m) => {
    if (m.memory_date) {
      memoriesByDate[m.memory_date] = m;
    }
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4 select-none">
      {/* Top Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-surface/80 border border-border/40 text-xs">
          <button
            onClick={() => setActiveTab('photobooth')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'photobooth'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photobooth Hari Ini</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'archive'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Arsip Kalender</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. PHOTOBOOTH VIEW (1 HARI 1 FOTO) */}
      {/* ============================================================ */}
      {activeTab === 'photobooth' && (
        <div className="space-y-4">
          {todayMemory ? (
            /* TODAY'S MEMORY ALREADY TAKEN */
            <div className="rounded-3xl bg-card border border-border p-5 text-center space-y-4 shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Foto Hari Ini Selesai</span>
              </div>

              {/* Photobooth Frame */}
              <div className="p-3 bg-neutral-900 border-4 border-white/90 rounded-2xl shadow-xl max-w-sm mx-auto">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black mb-3">
                  {todayMemory.media?.[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={todayMemory.media[0].url}
                      alt={todayMemory.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/90">
                    {todayStr}
                  </div>
                </div>

                <div className="text-left pt-1 px-1">
                  <h3 className="font-serif text-base font-semibold text-white tracking-wide">
                    {todayMemory.title}
                  </h3>
                  {todayMemory.story && (
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      {todayMemory.story}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Satu hari satu kenangan. Kembali lagi besok untuk sesi photobooth berikutnya ✨
              </p>
            </div>
          ) : (
            /* PHOTOBOOTH FORM & CAMERA CAPTURE */
            <div className="rounded-3xl bg-card border border-border p-5 space-y-4 shadow-sm">
              <div className="text-center">
                <h2 className="font-serif text-lg font-medium text-foreground">
                  Photobooth Berdua
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Abadikan 1 foto berharga untuk hari ini ({formatDatePretty(todayStr)})
                </p>
              </div>

              {/* Hidden Camera Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* Photobooth Preview or Shutter Button */}
              {previewPhotoUrl ? (
                <div className="space-y-3">
                  {/* Polaroid Print Preview */}
                  <div className="p-3 bg-neutral-900 border-4 border-white/90 rounded-2xl shadow-xl max-w-xs mx-auto">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/90">
                        {todayStr}
                      </div>
                    </div>
                  </div>

                  {/* Retake button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground bg-surface border border-border/40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Shutter Box */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-surface/50 flex flex-col items-center justify-center gap-2 group transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-foreground block">
                      Jepret Kamera Sekarang
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Ketuk untuk membuka kamera HP
                    </span>
                  </div>
                </button>
              )}

              {/* Title & Story Inputs */}
              <div className="space-y-2.5 pt-1">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul kenangan (misal: Ngopi Sore Berdua)"
                  className="h-11 rounded-xl text-xs bg-background"
                />

                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Cerita singkat momen ini (opsional)..."
                  rows={2}
                  className="rounded-xl text-xs resize-none bg-background"
                />

                <Button
                  onClick={handleSaveMemory}
                  disabled={!previewPhotoUrl || !title.trim() || saving}
                  className="w-full h-11 rounded-xl text-xs font-medium bg-primary text-primary-foreground shadow-xs"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  Simpan Kenangan Hari Ini
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ARSIP KALENDER INSTAGRAM VIEW */}
      {/* ============================================================ */}
      {activeTab === 'archive' && (
        <div className="rounded-3xl bg-card border border-border p-5 space-y-4 shadow-sm select-none">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-medium">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset cells */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const mem = memoriesByDate[dateStr];
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => mem && setSelectedMemory(mem)}
                  disabled={!mem}
                  className={`relative aspect-square rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                    mem
                      ? 'border-2 border-primary/50 shadow-xs cursor-pointer hover:scale-105 active:scale-95'
                      : 'border border-border/20 bg-surface/30'
                  } ${isToday && !mem ? 'border-primary/40 ring-1 ring-primary/30' : ''}`}
                >
                  {mem?.media?.[0]?.url ? (
                    <>
                      {/* Photo Thumbnail (Instagram Story Archive style) */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mem.media[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25" />
                      <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold text-white drop-shadow-md">
                        {dayNum}
                      </span>
                    </>
                  ) : (
                    <span className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                      {dayNum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-muted-foreground pt-1">
            Ketuk tanggal yang memiliki foto untuk membuka detail kenangan.
          </p>
        </div>
      )}

      {/* POPUP MODAL: FULLSCREEN MEMORY VIEW */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border-4 border-white/95 p-4 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-white/70">
                {formatDatePretty(selectedMemory.memory_date)}
              </span>
              <button
                onClick={() => setSelectedMemory(null)}
                className="p-1 rounded-full text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
              {selectedMemory.media?.[0]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedMemory.media[0].url}
                  alt={selectedMemory.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h4 className="font-serif text-base font-semibold tracking-wide">
                {selectedMemory.title}
              </h4>
              {selectedMemory.story && (
                <p className="text-xs text-white/75 mt-1 leading-relaxed">
                  {selectedMemory.story}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
