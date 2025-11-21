import { useState, useRef, useCallback } from 'react';
import { useRequestPermissions } from '@shopify/shop-minis-react';

interface VoiceRecorderHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>; // Returns complete audio
  error: string | null;
}

/**
 * Hook to record audio from microphone and accumulate complete recording
 * Returns full audio as base64 when recording stops
 *
 * Permissions: Requires MICROPHONE in manifest.json
 * (Shop app handles permission prompts automatically)
 */
export function useVoiceRecorder(): VoiceRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Uint8Array[]>([]); // Store raw bytes, not base64
  const isRecordingRef = useRef<boolean>(false);

  const { requestPermission } = useRequestPermissions();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = []; // Clear previous chunks

      // Request MICROPHONE permission from Shop app
      console.log('[VoiceRecorder] Requesting microphone permission...');
      await requestPermission({ permission: 'MICROPHONE' });
      console.log('[VoiceRecorder] Permission granted');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000, // Match AssemblyAI requirement
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;

      // Create AudioContext for PCM processing
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Use ScriptProcessorNode for PCM extraction (4096 buffer size)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (PCM)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp to [-1, 1] and convert to 16-bit PCM
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Store raw bytes (not base64)
        const bytes = new Uint8Array(pcmData.buffer);
        audioChunksRef.current.push(bytes);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('[VoiceRecorder] Recording started (24kHz PCM)');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Microphone access denied: ${errorMessage}`);
      console.error('[VoiceRecorder] Error:', err);
    }
  }, [requestPermission]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    isRecordingRef.current = false;
    setIsRecording(false);
    console.log('[VoiceRecorder] Recording stopped');

    // Combine all audio chunks
    if (audioChunksRef.current.length === 0) {
      console.warn('[VoiceRecorder] No audio recorded');
      return null;
    }

    // Calculate total size
    const totalLength = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);

    // Combine all chunks into single Uint8Array
    const combinedBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunksRef.current) {
      combinedBytes.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64 once
    let binary = '';
    for (let i = 0; i < combinedBytes.length; i++) {
      binary += String.fromCharCode(combinedBytes[i]);
    }
    const base64Audio = btoa(binary);

    console.log(`[VoiceRecorder] Combined ${audioChunksRef.current.length} chunks, total ${totalLength} bytes`);

    return base64Audio;
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error
  };
}
