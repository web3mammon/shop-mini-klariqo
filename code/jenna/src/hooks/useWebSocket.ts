import { useState, useRef, useCallback } from 'react';

interface ProductSearchIntent {
  query: string;
  filters: {
    category?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    colors?: string[] | null;
    gender?: string | null;
  };
  count?: number;
  timestamp?: number;
}

interface AudioPlayerControls {
  stop: () => void;
  getIsPlaying: () => boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  conversationState: 'idle' | 'connecting' | 'listening';
  messages: Array<{ text: string; isUser: boolean }>;
  productSearch: ProductSearchIntent | null;
  shouldFetchMore: boolean; // triggers fetchMore() in App.tsx
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendAudioChunk: (audioBase64: string) => void;
  setAudioChunkHandler: (handler: (audioBase64: string, chunkIndex: number) => void) => void;
  resetFetchMore: () => void; // reset flag after fetchMore() called
  setAudioPlayerControls: (controls: AudioPlayerControls) => void; // for interrupt detection
  setOnConnectionReady: (callback: () => void) => void; // callback when connection.established received
  setOnNavigateToCart: (callback: () => void) => void; // callback when navigation.cart received
}

const WEBSOCKET_URL = 'wss://btqccksigmohyjdxgrrj.supabase.co/functions/v1/mini-voice-websocket';

/**
 * WebSocket connection hook - EXACT pattern from klariqo-widget.js
 * - User speaks → transcript.user (isFinal) → add user message
 * - AI responds → text.chunk → add AI message
 * - Audio plays via AudioPlayer component
 */
export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [conversationState, setConversationState] = useState<'idle' | 'connecting' | 'listening'>('idle');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [productSearch, setProductSearch] = useState<ProductSearchIntent | null>(null);
  const [shouldFetchMore, setShouldFetchMore] = useState(false); // NEW: pagination trigger
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioChunkHandlerRef = useRef<((audioBase64: string, chunkIndex: number) => void) | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalDisconnectRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Interrupt detection refs (EXACT from production klariqo-widget.js)
  const audioPlayerControlsRef = useRef<AudioPlayerControls | null>(null);
  const hasInterruptedRef = useRef(false); // Track if we've interrupted for current turn

  // Connection ready callback ref
  const onConnectionReadyRef = useRef<(() => void) | null>(null);

  // Navigate to cart callback ref
  const onNavigateToCartRef = useRef<(() => void) | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConversationState('connecting');

    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      setIsConnected(true);
      setConversationState('listening');
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnect counter on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connection.established':
            // Fire the callback when connection is truly ready
            if (onConnectionReadyRef.current) {
              onConnectionReadyRef.current();
            }
            break;

          case 'ping':
            // Respond to keepalive (EXACT from production)
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'pong' }));
            }
            break;

          case 'transcript.user':
            // Interrupt detection (EXACT from production klariqo-widget.js lines 1007-1015)
            if (!data.isFinal && !hasInterruptedRef.current) {
              // Check if audio is actually playing before interrupting
              if (audioPlayerControlsRef.current?.getIsPlaying()) {
                audioPlayerControlsRef.current.stop();

                // Send interrupt signal to backend
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
                }

                hasInterruptedRef.current = true; // Mark that we've interrupted for this turn
              }
            }

            // Only add user message when final (EXACT from klariqo-widget.js line 988-991)
            if (data.isFinal) {
              setMessages(prev => [...prev, { text: data.text, isUser: true }]);
            }
            break;

          case 'text.chunk':
            // Add AI message (EXACT from klariqo-widget.js line 994-996)
            setMessages(prev => [...prev, { text: data.text, isUser: false }]);
            // Reset interrupt flag when AI starts speaking (ready for next interrupt)
            hasInterruptedRef.current = false;
            break;

          case 'audio.chunk':
            // Pass to AudioPlayer (audio playback handled there)
            if (audioChunkHandlerRef.current) {
              audioChunkHandlerRef.current(data.audio, data.chunk_index);
            }
            break;

          case 'audio.complete':
            break;

          case 'audio.stop':
            // Stop any currently playing audio (e.g., when no products found)
            if (audioPlayerControlsRef.current) {
              audioPlayerControlsRef.current.stop();
            }
            break;

          case 'products.search':
            // New product search intent received from backend
            setProductSearch({
              query: data.query,
              filters: data.filters || {},
              count: data.count || 5,
              timestamp: data.timestamp
            });
            setShouldFetchMore(false); // Reset pagination flag for new search
            break;

          case 'products.fetchMore':
            // Pagination request received from backend
            // Update productSearch with pagination data (includes new count!)
            setProductSearch({
              query: data.query,
              filters: data.filters || {},
              count: data.count || 5,
              timestamp: data.timestamp
            });
            setShouldFetchMore(true); // Trigger pagination in App.tsx
            break;

          case 'error':
            setError(data.message);
            break;

          case 'navigation.cart':
            // Navigate to cart requested by backend
            if (onNavigateToCartRef.current) {
              onNavigateToCartRef.current();
            }
            break;

          default:
            break;
        }
      } catch (error) {
        // Silent error handling
      }
    };

    ws.onerror = () => {
      setError('Connection error');
      setConversationState('idle');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConversationState('idle');
      wsRef.current = null;

      // Auto-reconnect if NOT intentional disconnect and attempts < max
      if (!isIntentionalDisconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;

        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt reconnection after 1 second
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isIntentionalDisconnectRef.current) {
            connect();
          }
        }, 1000);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Connection lost. Please restart the app.');
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      isIntentionalDisconnectRef.current = true; // Mark as intentional disconnect

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setConversationState('idle');
      setMessages([]);
      setProductSearch(null);

      // Reset intentional disconnect flag after a delay
      setTimeout(() => {
        isIntentionalDisconnectRef.current = false;
      }, 1000);
    }
  }, []);

  const sendAudioChunk = useCallback((audioBase64: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'audio.chunk',
        audio: audioBase64
      }));
    }
  }, []);

  const setAudioChunkHandler = useCallback((handler: (audioBase64: string, chunkIndex: number) => void) => {
    audioChunkHandlerRef.current = handler;
  }, []);

  const resetFetchMore = useCallback(() => {
    setShouldFetchMore(false);
  }, []);

  const setAudioPlayerControls = useCallback((controls: AudioPlayerControls) => {
    audioPlayerControlsRef.current = controls;
  }, []);

  const setOnConnectionReady = useCallback((callback: () => void) => {
    onConnectionReadyRef.current = callback;
  }, []);

  const setOnNavigateToCart = useCallback((callback: () => void) => {
    onNavigateToCartRef.current = callback;
  }, []);

  return {
    isConnected,
    conversationState,
    messages,
    productSearch,
    shouldFetchMore,
    error,
    connect,
    disconnect,
    sendAudioChunk,
    setAudioChunkHandler,
    resetFetchMore,
    setAudioPlayerControls,
    setOnConnectionReady,
    setOnNavigateToCart,
  };
}
