import { useState, useEffect, useCallback } from 'react';
import { ProductCard, useProductSearch } from '@shopify/shop-minis-react';
import { AudioPlayer, initAudioContext } from './components/AudioPlayer';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useVoiceConnection } from './hooks/useVoiceConnection';

export function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConversationExpanded, setIsConversationExpanded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Voice connection
  const {
    transcript,
    aiResponse,
    audioResponse,
    productSearch,
    processVoice,
    error: voiceError,
    isProcessing,
  } = useVoiceConnection();

  // Voice recorder
  const {
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder();

  // Product search
  const { products, loading: productsLoading } = useProductSearch({
    query: searchQuery,
    filters: {},
  });

  // Handle audio responses
  useEffect(() => {
    if (audioResponse) {
      console.log('[App] Audio response received, setting speaking state');
      setCurrentAudio(audioResponse);
      setIsSpeaking(true);

      // Auto-stop speaking after reasonable time (fallback)
      const timeout = setTimeout(() => {
        console.log('[App] Speaking timeout - auto-stopping');
        setIsSpeaking(false);
      }, 10000); // 10 seconds max

      return () => clearTimeout(timeout);
    }
  }, [audioResponse]);

  // Handle product search intent from backend
  useEffect(() => {
    if (productSearch?.query) {
      console.log('[App] Searching for products:', productSearch.query);
      setSearchQuery(productSearch.query);
    }
  }, [productSearch]);

  // Simulate audio level animation while speaking
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    }
    setAudioLevel(0);
  }, [isSpeaking]);

  // Handle mic button PRESS (start recording)
  const handleMicDown = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing || isRecording) return;

    // Initialize AudioContext during user interaction (iOS requirement)
    initAudioContext();

    console.log('[App] Mic pressed - starting recording');
    try {
      await startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('[App] Failed to start recording:', err);
    }
  }, [isProcessing, isRecording, startRecording]);

  // Handle mic button RELEASE (stop and process)
  const handleMicUp = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isRecording) return;

    console.log('[App] Mic released - stopping recording');

    try {
      const audioBase64 = await stopRecording();
      setIsRecording(false); // Stop recording state immediately

      if (audioBase64) {
        console.log('[App] Processing audio...');
        await processVoice(audioBase64);
      } else {
        console.warn('[App] No audio recorded');
      }
    } catch (err) {
      console.error('[App] Failed to process audio:', err);
      setIsRecording(false); // Ensure recording stops on error
    }
  }, [isRecording, stopRecording, processVoice]);

  // Handle cancellation
  const handleMicCancel = useCallback(async () => {
    if (!isRecording) return;
    console.log('[App] Recording cancelled');
    await stopRecording();
    setIsRecording(false);
  }, [isRecording, stopRecording]);

  return (
    <div className="relative w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">Jenna - Voice Shopping</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-48">

        {/* Compact Conversation Header - Only shows when there's a transcript */}
        {transcript && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <button
              onClick={() => setIsConversationExpanded(!isConversationExpanded)}
              className="w-full px-6 py-3 text-left"
            >
              {/* Collapsed View */}
              {!isConversationExpanded && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-medium text-gray-500">You asked:</p>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{transcript}</p>
                    {isSpeaking && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-purple-500 rounded-full transition-all duration-150"
                              style={{
                                height: `${8 + (audioLevel + i * 8) % 12}px`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-purple-600 font-medium">Jenna is speaking...</span>
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isConversationExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              )}

              {/* Expanded View */}
              {isConversationExpanded && (
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">You asked:</p>
                      <p className="text-sm text-gray-900">{transcript}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {aiResponse && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-xs font-medium text-purple-600 mb-1">Jenna:</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{aiResponse}</p>
                    </div>
                  )}

                  {isSpeaking && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-purple-500 rounded-full transition-all duration-150"
                            style={{
                              height: `${8 + (audioLevel + i * 8) % 16}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-purple-600 font-medium">Speaking...</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Product Results - Takes center stage */}
        {products && products.length > 0 && (
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {products.length} {products.length === 1 ? 'result' : 'results'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {productsLoading && (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-600">Finding products...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!transcript && !isProcessing && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-purple-600">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Hi! I'm Jenna 👋</h2>
            <p className="text-base text-gray-500 max-w-sm">
              Your personal fashion stylist. Tap and hold the mic to tell me what you're looking for!
            </p>
          </div>
        )}

        {/* Error Display */}
        {(voiceError || recorderError) && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {voiceError || recorderError}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Voice Control - Fixed */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-6">
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-600">Processing...</span>
            </div>
          </div>
        )}

        {/* Voice Button */}
        <div className="flex flex-col items-center">
          <button
            onTouchStart={handleMicDown}
            onTouchEnd={handleMicUp}
            onTouchCancel={handleMicCancel}
            onMouseDown={handleMicDown}
            onMouseUp={handleMicUp}
            onMouseLeave={handleMicCancel}
            className={`relative w-20 h-20 rounded-full transition-all duration-200 flex items-center justify-center ${
              isRecording
                ? 'bg-red-500 scale-110 shadow-lg shadow-red-200'
                : 'bg-purple-600 shadow-lg shadow-purple-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            disabled={isProcessing}
          >
            {/* Pulse animation when recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse" />
              </>
            )}

            {/* Microphone Icon */}
            <svg
              className="relative z-10 w-9 h-9 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>

          {/* Instruction Text */}
          <p className="mt-4 text-sm font-medium text-gray-600">
            {isRecording
              ? 'Listening...'
              : isProcessing
                ? 'Processing...'
                : 'Hold to speak'
            }
          </p>
        </div>
      </div>

      {/* Audio Player (invisible) */}
      <AudioPlayer
        audioBase64={currentAudio}
        onPlaybackComplete={() => setIsSpeaking(false)}
      />
    </div>
  );
}
