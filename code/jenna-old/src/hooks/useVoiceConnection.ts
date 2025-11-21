import { useState, useCallback, useRef } from 'react';

interface ProductSearchFilters {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  brands?: string[] | null;
  gender?: string | null;
  occasion?: string | null;
}

interface ProductSearchIntent {
  query: string;
  filters: ProductSearchFilters;
}

interface VoiceConnectionHook {
  isConnected: boolean;
  transcript: string;
  aiResponse: string;
  audioResponse: string | null;
  productSearch: ProductSearchIntent | null;
  processVoice: (audioBase64: string) => Promise<void>;
  error: string | null;
  isProcessing: boolean;
}

/**
 * Hook to manage HTTP streaming connection to voice-process backend
 * Uses fetch with ReadableStream for real-time streaming responses
 */
export function useVoiceConnection(): VoiceConnectionHook {
  const [isConnected] = useState(true); // Always "connected" for HTTP
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [audioResponse, setAudioResponse] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<ProductSearchIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTranscriptRef = useRef('');
  const currentAiResponseRef = useRef('');

  const processVoice = useCallback(async (audioBase64: string) => {
    try {
      console.log('[VoiceConnection] Starting voice processing...');
      setError(null);
      setIsProcessing(true);

      // Clear displayed messages for new request
      setTranscript('');
      setAiResponse('');
      currentTranscriptRef.current = '';
      currentAiResponseRef.current = '';
      setAudioResponse(null);
      setProductSearch(null);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const backendUrl = 'https://btqccksigmohyjdxgrrj.supabase.co/functions/v1/voice-process';

      console.log('[VoiceConnection] Sending audio to backend...');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          conversationHistory // Send conversation history to backend
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr.trim()) continue;

            try {
              const data = JSON.parse(dataStr);

              switch (data.type) {
                case 'status':
                  console.log('[VoiceConnection] Status:', data.message);
                  break;

                case 'transcript':
                  console.log('[VoiceConnection] Transcript:', data.text);
                  currentTranscriptRef.current = data.text;
                  setTranscript(data.text);
                  break;

                case 'text':
                  currentAiResponseRef.current += data.chunk;
                  setAiResponse(currentAiResponseRef.current);
                  break;

                case 'audio':
                  console.log('[VoiceConnection] Audio chunk received');
                  setAudioResponse(data.data);
                  break;

                case 'search':
                  console.log('[VoiceConnection] Product search intent:', data.query);
                  setProductSearch({
                    query: data.query,
                    filters: data.filters || {}
                  });
                  break;

                case 'error':
                  console.error('[VoiceConnection] Server error:', data.message);
                  setError(data.message);
                  break;

                case 'done':
                  console.log('[VoiceConnection] Processing complete - setting isProcessing to false');
                  // Update conversation history after full response
                  if (currentTranscriptRef.current && currentAiResponseRef.current) {
                    setConversationHistory(prev => [
                      ...prev,
                      { role: 'user', content: currentTranscriptRef.current },
                      { role: 'assistant', content: currentAiResponseRef.current }
                    ]);
                    console.log(`[VoiceConnection] Conversation history updated: ${conversationHistory.length + 2} messages`);
                  }
                  setIsProcessing(false); // Clear processing state when done
                  break;

                default:
                  console.warn('[VoiceConnection] Unknown message type:', data.type);
              }
            } catch (e) {
              console.error('[VoiceConnection] Failed to parse message:', dataStr, e);
            }
          }
        }
      }

      setIsProcessing(false);

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.log('[VoiceConnection] Request aborted');
        } else {
          console.error('[VoiceConnection] Error:', err);
          setError(err.message);
        }
      }
      setIsProcessing(false);
    }
  }, [conversationHistory]);

  return {
    isConnected,
    transcript,
    aiResponse,
    audioResponse,
    productSearch,
    processVoice,
    error,
    isProcessing,
  };
}
