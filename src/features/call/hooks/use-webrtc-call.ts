'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface CallOfferPayload {
  callerId: string;
  callerName: string;
  callerAvatar?: string | null;
  isVideo: boolean;
  sdp: RTCSessionDescriptionInit;
}

interface CallAnswerPayload {
  sdp: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useWebRTCCall(coupleId: string, userProfile: Profile, partnerProfile: Profile | null) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<{
    name: string;
    avatar?: string | null;
    isVideo: boolean;
  } | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRingRef = useRef<AudioContext | null>(null);
  const ringOscRef = useRef<OscillatorNode | null>(null);

  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Sound generator using Web Audio API
  const startRingtone = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioRingRef.current = ctx;
      ringOscRef.current = osc;
    } catch {
      // Audio autoplay might be restricted
    }
  }, []);

  const stopRingtone = useCallback(() => {
    try {
      ringOscRef.current?.stop();
      ringOscRef.current?.disconnect();
      audioRingRef.current?.close();
    } catch {
      // ignore
    } finally {
      audioRingRef.current = null;
      ringOscRef.current = null;
    }
  }, []);

  // Cleanup stream
  const cleanUpStream = useCallback(() => {
    stopRingtone();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [stopRingtone]);

  // Handle end call
  const endCall = useCallback((broadcast = true) => {
    if (broadcast && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call_ended',
        payload: { from: userProfile.id },
      });
    }
    cleanUpStream();
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setIncomingCaller(null);
    }, 1200);
  }, [cleanUpStream, userProfile.id]);

  // Setup PeerConnection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Send ice candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice_candidate',
          payload: { candidate: event.candidate },
        });
      }
    };

    // Remote stream received
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        stopRingtone();
        setCallStatus('connected');
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        }
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall(false);
      }
    };

    return pc;
  }, [endCall, stopRingtone]);

  // Start outgoing call
  const startCall = async (video: boolean) => {
    setIsVideoCall(video);
    setCallStatus('calling');
    startRingtone();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Broadcast offer via Supabase Realtime
      channelRef.current?.send({
        type: 'broadcast',
        event: 'call_offer',
        payload: {
          callerId: userProfile.id,
          callerName: userProfile.display_name || 'Pasangan',
          callerAvatar: userProfile.avatar_url,
          isVideo: video,
          sdp: offer,
        },
      });
    } catch (err) {
      console.error('Call media error:', err);
      alert('Tidak dapat mengakses mikrofon atau kamera. Pastikan izin browser diaktifkan.');
      endCall(true);
    }
  };

  // Accept incoming call
  const acceptCall = async (offerSdp: RTCSessionDescriptionInit, video: boolean) => {
    stopRingtone();
    setIsVideoCall(video);
    setCallStatus('connected');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channelRef.current?.send({
        type: 'broadcast',
        event: 'call_answer',
        payload: { sdp: answer },
      });

      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error('Accept call error:', err);
      endCall(true);
    }
  };

  // Reject call
  const rejectCall = () => {
    stopRingtone();
    channelRef.current?.send({
      type: 'broadcast',
      event: 'call_rejected',
      payload: { from: userProfile.id },
    });
    setCallStatus('idle');
    setIncomingCaller(null);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Listen for Realtime Call Signaling
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase.channel(`call_signal_${coupleId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'call_offer' }, ({ payload }: { payload: CallOfferPayload }) => {
        if (payload.callerId !== userProfile.id) {
          setIncomingCaller({
            name: payload.callerName,
            avatar: payload.callerAvatar,
            isVideo: payload.isVideo,
          });
          setIsVideoCall(payload.isVideo);
          setCallStatus('incoming');
          startRingtone();

          // Store offer SDP on window temp for accept
          (window as unknown as { _pendingCallOffer?: RTCSessionDescriptionInit })._pendingCallOffer = payload.sdp;
        }
      })
      .on('broadcast', { event: 'call_answer' }, async ({ payload }: { payload: CallAnswerPayload }) => {
        if (pcRef.current && pcRef.current.signalingState !== 'closed') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      })
      .on('broadcast', { event: 'ice_candidate' }, async ({ payload }: { payload: IceCandidatePayload }) => {
        if (pcRef.current && payload.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch {
            // ignore candidate error
          }
        }
      })
      .on('broadcast', { event: 'call_ended' }, () => {
        endCall(false);
      })
      .on('broadcast', { event: 'call_rejected' }, () => {
        stopRingtone();
        alert('Panggilan ditolak atau pasangan sedang sibuk.');
        endCall(false);
      })
      .subscribe();

    return () => {
      cleanUpStream();
      channel.unsubscribe();
    };
  }, [coupleId, userProfile.id, endCall, cleanUpStream, startRingtone, stopRingtone, supabase]);

  return {
    callStatus,
    isVideoCall,
    isMuted,
    isCameraOff,
    callDuration,
    incomingCaller,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall: () => {
      const pendingSdp = (window as unknown as { _pendingCallOffer?: RTCSessionDescriptionInit })._pendingCallOffer;
      if (pendingSdp) {
        acceptCall(pendingSdp, isVideoCall);
      }
    },
    rejectCall,
    endCall: () => endCall(true),
    toggleMute,
    toggleCamera,
  };
}
