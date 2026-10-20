'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
} from 'lucide-react';
import type { CallStatus } from '../hooks/use-webrtc-call';
import type { Profile } from '@/types/database';

interface CallModalProps {
  callStatus: CallStatus;
  isVideoCall: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;
  partnerProfile: Profile | null;
  incomingCaller: {
    name: string;
    avatar?: string | null;
    isVideo: boolean;
  } | null;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function CallModal({
  callStatus,
  isVideoCall,
  isMuted,
  isCameraOff,
  callDuration,
  partnerProfile,
  incomingCaller,
  localVideoRef,
  remoteVideoRef,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleCamera,
}: CallModalProps) {
  if (callStatus === 'idle') return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const partnerName = incomingCaller?.name || partnerProfile?.display_name || 'Pasangan Anda';
  const partnerAvatar = incomingCaller?.avatar || partnerProfile?.avatar_url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white p-4 select-none touch-none"
      >
        {/* ============================================================ */}
        {/* INCOMING CALL SCREEN */}
        {/* ============================================================ */}
        {callStatus === 'incoming' && (
          <div className="flex flex-col items-center justify-between h-full max-w-sm w-full py-12">
            <div className="flex flex-col items-center text-center mt-8">
              <div className="relative mb-6">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-md"
                />
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-800 flex items-center justify-center font-serif text-3xl shadow-xl">
                  {partnerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{partnerName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-serif font-medium">{partnerName}</h2>
              <p className="text-sm text-neutral-400 mt-1">
                {isVideoCall ? 'Panggilan Video Masuk...' : 'Panggilan Suara Masuk...'}
              </p>
            </div>

            {/* Accept / Decline buttons */}
            <div className="flex items-center justify-center gap-16 w-full mb-8">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onReject}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 flex items-center justify-center shadow-lg transition-transform"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-xs text-neutral-400">Tolak</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onAccept}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 flex items-center justify-center shadow-lg animate-bounce transition-transform"
                >
                  {isVideoCall ? (
                    <Video className="w-7 h-7 text-white" />
                  ) : (
                    <Phone className="w-7 h-7 text-white" />
                  )}
                </button>
                <span className="text-xs text-neutral-400">Angkat</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CALLING / CONNECTED / ENDED SCREEN */}
        {/* ============================================================ */}
        {(callStatus === 'calling' || callStatus === 'connected' || callStatus === 'ended') && (
          <div className="relative flex flex-col items-center justify-between w-full h-full max-w-md py-6">
            {/* Top Bar Info */}
            <div className="z-20 flex flex-col items-center text-center mt-2">
              <h3 className="text-lg font-serif font-medium">{partnerName}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {callStatus === 'calling' && 'Memanggil...'}
                {callStatus === 'connected' && formatDuration(callDuration)}
                {callStatus === 'ended' && 'Panggilan Berakhir'}
              </p>
            </div>

            {/* Middle: Video Streams or Audio Avatar */}
            <div className="relative flex-1 w-full flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-neutral-900 border border-white/10">
              {/* Remote Video Stream (Main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${isVideoCall ? 'block' : 'hidden'}`}
              />

              {/* Audio Call Placeholder when no video */}
              {!isVideoCall && (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={callStatus === 'connected' ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 bg-neutral-800 flex items-center justify-center font-serif text-3xl shadow-2xl mb-4"
                  >
                    {partnerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{partnerName.charAt(0).toUpperCase()}</span>
                    )}
                  </motion.div>
                  <p className="text-xs text-neutral-400 tracking-wide">Panggilan Suara Privat</p>
                </div>
              )}

              {/* Local Video Thumbnail (PIP) */}
              {isVideoCall && (
                <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
                  />
                  {isCameraOff && (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[10px] text-neutral-400">
                      Kamera Mati
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="z-20 flex items-center justify-center gap-6 w-full py-4">
              {/* Mute Button */}
              <button
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Toggle Camera (If Video Call) */}
              {isVideoCall && (
                <button
                  onClick={onToggleCamera}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCameraOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 flex items-center justify-center shadow-lg transition-transform"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
