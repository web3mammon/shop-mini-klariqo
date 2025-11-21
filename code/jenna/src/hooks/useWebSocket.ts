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

interface UseWebSocketReturn {
  isConnected: boolean;
  conversationState: 'idle' | 'connecting' | 'listening';
  messages: Array<{ text: string; isUser: boolean }>;
  productSearch: ProductSearchIntent | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendAudioChunk: (audioBase64: string) => void;
  setAudioChunkHandler: (handler: (audioBase64: string, chunkIndex: number) => void) => void;
}

const WEBSOCKET_URL = 'wss://btqccksigmohyjdxgrrj.supabase.co/functions/v1/voice-websocket';

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
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioChunkHandlerRef = useRef<((audioBase64: string, chunkIndex: number) => void) | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionalDisconnectRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to:', WEBSOCKET_URL);
    setConversationState('connecting');

    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      setConversationState('listening');
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnect counter on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Message:', data.type);

        switch (data.type) {
          case 'connection.established':
            console.log('[WebSocket] Session established:', data.sessionId);
            break;

          case 'ping':
            // Respond to keepalive (EXACT from production)
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'pong' }));
            }
            break;

          case 'transcript.user':
            // Only add user message when final (EXACT from klariqo-widget.js line 988-991)
            if (data.isFinal) {
              console.log('[WebSocket] User said:', data.text);
              setMessages(prev => [...prev, { text: data.text, isUser: true }]);
            }
            break;

          case 'text.chunk':
            // Add AI message (EXACT from klariqo-widget.js line 994-996)
            console.log('[WebSocket] AI said:', data.text);
            setMessages(prev => [...prev, { text: data.text, isUser: false }]);
            break;

          case 'audio.chunk':
            // Pass to AudioPlayer (audio playback handled there)
            if (audioChunkHandlerRef.current) {
              audioChunkHandlerRef.current(data.audio, data.chunk_index);
            }
            break;

          case 'audio.complete':
            console.log('[WebSocket] Audio playback complete');
            break;

          case 'products.search':
            // Product search intent received from backend
            console.log('[WebSocket] ✅ RECEIVED products.search from backend:', data);
            console.log('[WebSocket] Query:', data.query, 'Count:', data.count, 'Timestamp:', data.timestamp);
            setProductSearch({
              query: data.query,
              filters: data.filters || {},
              count: data.count || 5,
              timestamp: data.timestamp
            });
            console.log('[WebSocket] ✅ productSearch state updated');
            break;

          case 'error':
            console.error('[WebSocket] Server error:', data.message);
            setError(data.message);
            break;

          default:
            console.warn('[WebSocket] Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      setError('Connection error');
      setConversationState('idle');
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Connection closed - code: ${event.code}, reason: ${event.reason || 'none'}`);
      setIsConnected(false);
      setConversationState('idle');
      wsRef.current = null;

      // Auto-reconnect if NOT intentional disconnect and attempts < max
      if (!isIntentionalDisconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        console.log(`[WebSocket] 🔄 Auto-reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Attempt reconnection after 1 second
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isIntentionalDisconnectRef.current) {
            console.log('[WebSocket] Reconnecting...');
            connect();
          }
        }, 1000);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error('[WebSocket] ❌ Max reconnect attempts reached');
        setError('Connection lost. Please restart the app.');
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('[WebSocket] Disconnecting (user-initiated)...');
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

  return {
    isConnected,
    conversationState,
    messages,
    productSearch,
    error,
    connect,
    disconnect,
    sendAudioChunk,
    setAudioChunkHandler,
  };
}
