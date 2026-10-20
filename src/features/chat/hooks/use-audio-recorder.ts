'use client';

import { useState, useRef, useCallback } from 'react';

export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  durationSeconds: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      throw new Error('Microphone permission required for voice notes.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      if (timerRef.current) clearInterval(timerRef.current);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stop all audio tracks to release microphone
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        resolve({
          blob: audioBlob,
          url: audioUrl,
          durationSeconds: recordingSeconds,
        });
      };

      mediaRecorder.stop();
    });
  }, [recordingSeconds]);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder) {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
      chunksRef.current = [];
    }
  }, []);

  return {
    isRecording,
    recordingSeconds,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
