import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioBase64: string | null;
  onPlaybackComplete?: () => void;
}

// Global AudioContext - must be created during user interaction on iOS
let globalAudioContext: AudioContext | null = null;
let globalGainNode: GainNode | null = null;

export function initAudioContext() {
  if (!globalAudioContext) {
    try {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      globalGainNode = globalAudioContext.createGain();
      globalGainNode.connect(globalAudioContext.destination);
      console.log('[AudioPlayer] AudioContext initialized during user interaction');

      // Resume if suspended (iOS autoplay policy)
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().then(() => {
          console.log('[AudioPlayer] AudioContext resumed');
        });
      }
    } catch (e) {
      console.error('[AudioPlayer] Failed to initialize AudioContext:', e);
    }
  }
  return globalAudioContext;
}

/**
 * Plays base64 WAV audio using Web Audio API (iOS compatible)
 * EXACT copy from production klariqo-widget.js AudioPlayer class
 */
export function AudioPlayer({ audioBase64, onPlaybackComplete }: AudioPlayerProps) {
  const chunkBufferRef = useRef<{ [key: number]: AudioBuffer }>({});
  const nextChunkToPlayRef = useRef(0);
  const isPlayingRef = useRef(false);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef(0);
  const chunkIndexRef = useRef(0);

  useEffect(() => {
    const addChunk = async (audioBase64: string) => {
      try {
        console.log(`[AudioPlayer] Processing chunk #${chunkIndexRef.current}`);

        // Use global AudioContext (created during user interaction)
        if (!globalAudioContext) {
          console.error('[AudioPlayer] AudioContext not initialized! Call initAudioContext() first during user interaction');
          return;
        }

        // Resume if suspended (iOS autoplay policy)
        if (globalAudioContext.state === 'suspended') {
          await globalAudioContext.resume();
          console.log('[AudioPlayer] AudioContext resumed');
        }

        // Initialize timing on first chunk
        if (chunkIndexRef.current === 0) {
          nextStartTimeRef.current = globalAudioContext.currentTime;
        }

        // Reset on new response (chunk 0)
        if (chunkIndexRef.current === 0 && nextChunkToPlayRef.current > 0) {
          chunkBufferRef.current = {};
          nextChunkToPlayRef.current = 0;
          nextStartTimeRef.current = globalAudioContext.currentTime;
          console.log('[AudioPlayer] New response - reset state');
        }

        // Decode WAV audio (base64 → ArrayBuffer → AudioBuffer)
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode audio (works for MP3, WAV, etc.)
        const audioBuffer = await globalAudioContext.decodeAudioData(bytes.buffer.slice(0));
        console.log(`[AudioPlayer] Chunk #${chunkIndexRef.current} decoded - Duration: ${audioBuffer.duration.toFixed(2)}s, Sample rate: ${audioBuffer.sampleRate}Hz`);

        // Store AudioBuffer
        chunkBufferRef.current[chunkIndexRef.current] = audioBuffer;

        // Play buffered chunks
        playBufferedChunks();

        chunkIndexRef.current++;
      } catch (error) {
        console.error('[AudioPlayer] Audio chunk error:', error);
      }
    };

    const playBufferedChunks = () => {
      // Play all sequential chunks that are buffered
      while (chunkBufferRef.current[nextChunkToPlayRef.current] !== undefined) {
        const audioBuffer = chunkBufferRef.current[nextChunkToPlayRef.current];
        delete chunkBufferRef.current[nextChunkToPlayRef.current];

        console.log(`[AudioPlayer] Playing chunk #${nextChunkToPlayRef.current}`);
        schedulePlayback(audioBuffer);

        nextChunkToPlayRef.current++;
      }
    };

    const schedulePlayback = (audioBuffer: AudioBuffer) => {
      if (!globalAudioContext || !globalGainNode) return;

      const source = globalAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(globalGainNode);

      const currentTime = globalAudioContext.currentTime;

      // Schedule playback
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      isPlayingRef.current = true;

      // Update next start time
      nextStartTimeRef.current += audioBuffer.duration;

      // Track source
      scheduledSourcesRef.current.push(source);

      // Cleanup when done
      source.onended = () => {
        const index = scheduledSourcesRef.current.indexOf(source);
        if (index > -1) {
          scheduledSourcesRef.current.splice(index, 1);
        }

        if (scheduledSourcesRef.current.length === 0) {
          isPlayingRef.current = false;
          onPlaybackComplete?.();
        }
      };
    };

    if (audioBase64) {
      addChunk(audioBase64);
    }
  }, [audioBase64, onPlaybackComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all scheduled sources
      scheduledSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      scheduledSourcesRef.current = [];

      chunkBufferRef.current = {};
      nextChunkToPlayRef.current = 0;
      isPlayingRef.current = false;
      nextStartTimeRef.current = 0;
      chunkIndexRef.current = 0;

      // Don't close global AudioContext - keep it alive for next time
    };
  }, []);

  return null; // This component doesn't render anything
}
