import { useState, useRef, useCallback } from 'react';
import { useRequestPermissions } from '@shopify/shop-minis-react';

/**
 * Audio recorder hook - EXACT pattern from klariqo-widget.js AudioRecorder class
 * Records 24kHz PCM and streams chunks continuously to WebSocket
 */
export function useAudioRecorder(onAudioData: (audioBase64: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const { requestPermission } = useRequestPermissions();

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request MICROPHONE permission from Shop app
      await requestPermission({ permission: 'MICROPHONE' });

      // Request microphone access (EXACT from klariqo-widget.js lines 532-540)
      // eslint-disable-next-line shop-minis/validate-manifest
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false  // Explicitly no video - only audio/microphone (no CAMERA permission needed)
      });

      streamRef.current = stream;

      // Create AudioContext (EXACT from klariqo-widget.js lines 542-544)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      audioContextRef.current = audioContext;

      // Resume AudioContext for iOS (EXACT from klariqo-widget.js lines 546-549)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Audio processing callback (EXACT from klariqo-widget.js lines 554-559)
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        // Convert to ArrayBuffer for TypeScript compatibility
        const buffer = pcm16.buffer as ArrayBuffer;
        const base64Audio = arrayBufferToBase64(buffer);
        onAudioData(base64Audio);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);

    } catch (err) {

      // User-friendly error messages based on error type
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone permission denied. Please allow microphone access to use voice shopping.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found. Please connect a microphone to use voice shopping.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Microphone is already in use. Please close other apps using your microphone and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Your microphone doesn\'t support the required audio settings. Please try a different device.');
        } else {
          setError('Unable to access microphone. Please check your device settings and try again.');
        }
      } else {
        setError('Unable to start voice recording. Please try again.');
      }

      setIsRecording(false);
    }
  }, [requestPermission, onAudioData]);

  const stopRecording = useCallback(async () => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}

// Helper: Convert Float32Array to Int16Array PCM (EXACT from klariqo-widget.js lines 571-578)
function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

// Helper: Convert ArrayBuffer to base64 (EXACT from klariqo-widget.js lines 580-591)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
}
