'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoNotePlayerProps {
  videoUrl: string;
  isOwn: boolean;
}

export function VideoNotePlayer({ videoUrl }: VideoNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Video play error:', err));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      onClick={togglePlay}
      className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg cursor-pointer bg-black my-1"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/80 text-black flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Mute toggle button */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
