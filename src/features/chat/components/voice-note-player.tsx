'use client';

import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl: string;
  isOwn: boolean;
}

export function VoiceNotePlayer({ audioUrl, isOwn }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Waveform heights emulation for WhatsApp vibe
  const waveBars = [35, 60, 40, 85, 50, 95, 65, 40, 80, 55, 90, 70, 45, 85, 60, 40, 75, 50, 90, 65];

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[210px] sm:min-w-[240px] select-none">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 ${
          isOwn
            ? 'bg-primary-foreground text-primary'
            : 'bg-primary text-primary-foreground'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1 space-y-1">
        <div
          onClick={handleSeek}
          className="h-6 flex items-center gap-0.5 cursor-pointer py-1"
        >
          {waveBars.map((height, i) => {
            const barProgress = (i / waveBars.length) * 100;
            const isPlayed = progressPercent >= barProgress;

            return (
              <span
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isPlayed
                    ? isOwn
                      ? 'bg-primary-foreground'
                      : 'bg-primary'
                    : isOwn
                    ? 'bg-primary-foreground/35'
                    : 'bg-foreground/25'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold transition-colors ${
              isOwn
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
}
