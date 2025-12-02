import { useState, useEffect, useRef } from 'react';
import { MinisRouter, useProductSearch, ProductLink, Image, Button } from '@shopify/shop-minis-react';
import { Mic, User, Pause } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { AudioPlayer } from './components/AudioPlayer';
import jennaIllustration from './assets/jenna-illustration.webp';
import jennaProfile from './assets/jenna-profile.webp';
// Greeting audio hosted on Supabase storage (public asset, not a secret)
// eslint-disable-next-line shop-minis/no-secrets
const JENNA_GREETING_AUDIO_URL = 'https://btqccksigmohyjdxgrrj.supabase.co/storage/v1/object/public/audio-snippets/mini-jenna-greeting.mp3';

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

  // Greeting state
  const [greetingShown, setGreetingShown] = useState(false);
  const greetingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Jenna's greeting text (matches the MP3)
  const JENNA_GREETING = "Hey there! It's Jenna, your personal shopping assistant. How can I help you today?";

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
    setAudioPlayerControls, // Pass audio controls for interrupt detection
    setOnConnectionReady, // Callback when WebSocket is fully connected
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
      setGreetingShown(false);
    }
  }, [isConnected]);

  // Play greeting and show chat bubble when connection is established
  const playGreeting = () => {
    if (!greetingAudioRef.current) {
      greetingAudioRef.current = new Audio(JENNA_GREETING_AUDIO_URL);
    }
    greetingAudioRef.current.play();
    setGreetingShown(true);
  };

  const handleStartChat = () => {
    // Set up callback to fire when WebSocket sends connection.established
    setOnConnectionReady(playGreeting);

    // Connect to WebSocket
    connect();
  };

  // Stop greeting audio when disconnecting
  const handleStopChat = () => {
    if (greetingAudioRef.current) {
      greetingAudioRef.current.pause();
      greetingAudioRef.current.currentTime = 0;
    }
    disconnect();
  };

  return (
    <MinisRouter>
      <div className="relative w-full min-h-screen bg-white flex flex-col overflow-hidden">

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto pb-40 px-6 py-8">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              {/* Jenna Illustration with "Hi" text combined */}
              <Image
                src={jennaIllustration}
                alt="Jenna"
                className="object-contain mb-0 w-[230px] max-w-[60%]"
              />

              {/* Intro Text - System font with custom spacing */}
              <p className="text-lg text-gray-700 max-w-sm leading-[1.3] tracking-normal">
                I'm Jenna, your personalized shopping assistant. Tap the mic below to talk to me for product recommendations and a lot more.
              </p>
            </div>
          )}

          {/* Message bubbles with avatars */}
          <div className="space-y-3">
            {/* Jenna's greeting bubble (shown first when connected) */}
            {greetingShown && (
              <div className="flex gap-2 items-end justify-start">
                <Image
                  src={jennaProfile}
                  alt="Jenna"
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-sm">
                  <p className="text-sm leading-relaxed">{JENNA_GREETING}</p>
                </div>
              </div>
            )}

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
              <div className="flex justify-start w-full">
                <div className="w-full space-y-2 px-1">
                  {products.slice(startIndex, startIndex + displayCount).map((product) => (
                    <ProductLink key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* No products found state */}
            {!productsLoading && productSearch?.query && products && products.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <p className="text-sm text-gray-600">No products found. Try a different search!</p>
                </div>
              </div>
            )}

            {/* Products loading indicator */}
            {productsLoading && productSearch?.query && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
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
              <Button
                onClick={() => {
                  disconnect();
                  setTimeout(() => connect(), 500);
                }}
                variant="link"
                className="text-red-700 hover:text-red-800"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Buttons - Fixed to viewport */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-16 pb-safe-offset-8 px-6 flex justify-center pb-20 z-50">
          {!isConnected ? (
            <Button
              onClick={handleStartChat}
              variant="default"
              size="lg"
              className="shadow-2xl"
            >
              <Mic className="mr-2" />
              Start Voice Chat
            </Button>
          ) : (
            <Button
              onClick={handleStopChat}
              variant="secondary"
              size="lg"
              className="shadow-2xl"
            >
              <Pause className="mr-2" />
              Talk later
            </Button>
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
