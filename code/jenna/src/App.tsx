/* eslint-disable no-console */
import { useState, useEffect, useRef } from 'react';
import { MinisRouter, useProductSearch, ProductLink, Image } from '@shopify/shop-minis-react';
import { Mic, User, Square } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { AudioPlayer } from './components/AudioPlayer';
import jennaIllustration from './assets/jenna-illustration.png';
import jennaProfile from './assets/jenna-profile.png';

interface AudioPlayerControls {
  stop: () => void;
  getIsPlaying: () => boolean;
}

/**
 * Jenna Voice Shopping App
 * Chat UI copied EXACTLY from klariqo-widget.js
 * - User says something → user bubble appears
 * - AI responds → AI bubble appears
 * - Products appear as separate message bubble (max 3, vertical)
 * - Product search is completely isolated via separate edge function
 */
export function App() {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(5);

  // AudioPlayer controls for interrupt detection
  const audioPlayerControlsRef = useRef<AudioPlayerControls | null>(null);

  // WebSocket connection
  const {
    isConnected,
    conversationState,
    messages,
    productSearch,
    shouldFetchMore, // Pagination trigger
    error,
    connect,
    disconnect,
    sendAudioChunk,
    setAudioChunkHandler,
    resetFetchMore,
    setAudioPlayerControls, // NEW: Pass audio controls for interrupt detection
  } = useWebSocket();

  // Product search - fetch 50 products
  const { products, loading: productsLoading } = useProductSearch({
    query: searchQuery,
    filters: {},
    first: 50,
  });

  // Handle NEW SEARCH
  useEffect(() => {
    if (productSearch?.query) {
      console.log('[App] 🔍 NEW SEARCH requested:', productSearch.query);
      const uniqueQuery = `${productSearch.query} ${productSearch.timestamp || Date.now()}`;
      setSearchQuery(uniqueQuery);
      setStartIndex(0);
      setDisplayCount(productSearch.count || 5);
    }
  }, [productSearch]);

  // Handle PAGINATION
  useEffect(() => {
    if (shouldFetchMore) {
      const newCount = productSearch?.count || 5;
      const newStartIndex = startIndex + displayCount;
      setStartIndex(newStartIndex);
      setDisplayCount(newCount);
      resetFetchMore();
    }
  }, [shouldFetchMore, startIndex, displayCount, productSearch, resetFetchMore]);

  // Audio recorder
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(
    (chunk) => sendAudioChunk(chunk)
  );

  // Pass audio controls to WebSocket for interrupt detection
  useEffect(() => {
    if (audioPlayerControlsRef.current) {
      setAudioPlayerControls(audioPlayerControlsRef.current);
    }
  }, [setAudioPlayerControls]);

  // Sync recording with listening state
  useEffect(() => {
    if (conversationState === 'listening' && !isRecording && isConnected) {
      startRecording();
    } else if (conversationState !== 'listening' && isRecording) {
      stopRecording();
    }
  }, [conversationState, isRecording, isConnected, startRecording, stopRecording]);

  // Clear products when disconnecting
  useEffect(() => {
    if (!isConnected) {
      setSearchQuery('');
      setStartIndex(0);
      setDisplayCount(5);
    }
  }, [isConnected]);

  return (
    <MinisRouter>
      <div className="relative w-full min-h-screen bg-white flex flex-col overflow-hidden">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto pb-32 px-6 py-8">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              {/* Jenna Illustration with "Hi" text combined */}
              <Image
                src={jennaIllustration}
                alt="Jenna"
                className="object-contain mb-0"
                style={{ width: '230px', maxWidth: '60%' }}
              />

              {/* Intro Text - System font with custom spacing */}
              <p className="text-lg text-gray-700 max-w-sm" style={{ lineHeight: '1.3', letterSpacing: '0' }}>
                I'm Jenna, your personalized shopping assistant. Tap the mic below to talk to me for product recommendations and a lot more.
              </p>
            </div>
          )}

          {/* Message bubbles with avatars */}
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 items-end ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                {/* Jenna Avatar (left side for AI messages) */}
                {!msg.isUser && (
                  <Image
                    src={jennaProfile}
                    alt="Jenna"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}

                {/* Message Bubble */}
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>

                {/* User Avatar (right side for user messages) */}
                {msg.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Products display - Using ProductLink (compact) */}
            {products && products.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
                  {products.slice(startIndex, startIndex + displayCount).map((product) => (
                    <ProductLink key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Products loading indicator */}
            {productsLoading && productSearch?.query && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-600">Finding products...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={() => {
                  disconnect();
                  setTimeout(() => connect(), 500);
                }}
                className="text-sm text-red-700 font-medium underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Bottom Button - Circular */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-16 pb-safe-offset-8 px-6 flex justify-center" style={{ paddingBottom: '5rem' }}>
          {!isConnected ? (
            <button
              onClick={connect}
              className="rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
              style={{ width: '90px', height: '90px' }}
            >
              <Mic className="text-white" style={{ width: '40px', height: '40px' }} />
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="rounded-full bg-red-500 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
              style={{ width: '90px', height: '90px' }}
            >
              <Square className="text-white fill-white" style={{ width: '36px', height: '36px' }} />
            </button>
          )}
        </div>

        {/* Audio Player - hidden */}
        <AudioPlayer
          onAudioChunkHandler={setAudioChunkHandler}
          onPlayerReady={(controls) => {
            audioPlayerControlsRef.current = controls;
            setAudioPlayerControls(controls);
          }}
        />
      </div>
    </MinisRouter>
  );
}
