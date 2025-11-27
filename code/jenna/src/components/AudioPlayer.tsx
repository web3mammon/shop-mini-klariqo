/* eslint-disable no-console */
import { useEffect, useRef } from 'react';

interface AudioPlayerControls {
  stop: () => void;
  getIsPlaying: () => boolean;
}

interface AudioPlayerProps {
  onAudioChunkHandler: (handler: (audioBase64: string, chunkIndex: number) => void) => void;
  onPlayerReady?: (controls: AudioPlayerControls) => void;
}

/**
 * AudioPlayer component - EXACT pattern from klariqo-widget.js AudioPlayer class (lines 617-721)
 * Uses Web Audio API for iOS-compatible sequential playback
 * + Interrupt detection (stop() and getIsPlaying() methods)
 */
export function AudioPlayer({ onAudioChunkHandler, onPlayerReady }: AudioPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const chunkBufferRef = useRef<{ [key: number]: AudioBuffer }>({});
  const nextChunkToPlayRef = useRef(0);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]); // Track active sources for stopping
  const isPlayingRef = useRef(false); // Track if audio is currently playing

  useEffect(() => {
    // Define the audio chunk handler (called by useWebSocket when audio.chunk arrives)
    const handleAudioChunk = async (audioBase64: string, chunkIndex: number) => {
      try {
        // Initialize AudioContext on first chunk (EXACT from klariqo-widget.js lines 630-637)
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
          nextStartTimeRef.current = audioContextRef.current.currentTime;
          console.log('[AudioPlayer] AudioContext initialized');
        }

        // Resume if suspended (iOS autoplay policy) (EXACT from klariqo-widget.js lines 639-643)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('[AudioPlayer] AudioContext resumed');
        }

        // Reset on new response (chunk 0) (EXACT from klariqo-widget.js lines 645-649)
        if (chunkIndex === 0 && nextChunkToPlayRef.current > 0) {
          chunkBufferRef.current = {};
          nextChunkToPlayRef.current = 0;
          nextStartTimeRef.current = audioContextRef.current.currentTime;
        }

        // Decode base64 to ArrayBuffer (EXACT from klariqo-widget.js lines 651-659)
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log(`[AudioPlayer] Decoding chunk ${chunkIndex}: ${bytes.length} bytes`);

        // Decode audio (works for WAV, MP3, etc.) (EXACT from klariqo-widget.js lines 661-672)
        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0));
        console.log(`[AudioPlayer] Decoded chunk ${chunkIndex}: ${audioBuffer.duration}s`);

        // Store in buffer
        chunkBufferRef.current[chunkIndex] = audioBuffer;

        // Play chunks sequentially (EXACT from klariqo-widget.js lines 674-721)
        while (chunkBufferRef.current[nextChunkToPlayRef.current]) {
          const buffer = chunkBufferRef.current[nextChunkToPlayRef.current];
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(gainNodeRef.current!);

          const now = audioContextRef.current.currentTime;
          const startTime = Math.max(now, nextStartTimeRef.current);

          // Track active source for interrupt detection
          activeSourcesRef.current.push(source);
          isPlayingRef.current = true;

          // Remove from active list when finished
          source.onended = () => {
            const index = activeSourcesRef.current.indexOf(source);
            if (index > -1) {
              activeSourcesRef.current.splice(index, 1);
            }
            // If no more sources playing, set isPlaying to false
            if (activeSourcesRef.current.length === 0) {
              isPlayingRef.current = false;
            }
          };

          source.start(startTime);
          console.log(`[AudioPlayer] Playing chunk ${nextChunkToPlayRef.current} at ${startTime}s (now: ${now}s)`);

          nextStartTimeRef.current = startTime + buffer.duration;
          delete chunkBufferRef.current[nextChunkToPlayRef.current];
          nextChunkToPlayRef.current++;
        }

      } catch (error) {
        console.error('[AudioPlayer] Failed to decode/play audio:', error);
      }
    };

    // Control methods for interrupt detection (EXACT from production klariqo-widget.js)
    const stop = () => {
      console.log('[AudioPlayer] Stopping all audio (interrupt)');
      // Stop all active sources
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      activeSourcesRef.current = [];
      isPlayingRef.current = false;

      // Clear buffered chunks
      chunkBufferRef.current = {};
      nextChunkToPlayRef.current = 0;
      if (audioContextRef.current) {
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }
    };

    const getIsPlaying = () => {
      return isPlayingRef.current;
    };

    // Expose controls to parent
    if (onPlayerReady) {
      onPlayerReady({ stop, getIsPlaying });
    }

    // Register handler with useWebSocket
    onAudioChunkHandler(handleAudioChunk);

    // Cleanup on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      chunkBufferRef.current = {};
      nextChunkToPlayRef.current = 0;
      nextStartTimeRef.current = 0;
    };
  }, [onAudioChunkHandler]);

  return null; // This component doesn't render anything
}
