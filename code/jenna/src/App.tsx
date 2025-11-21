import { useState, useEffect } from 'react';
import { Button, MinisRouter, useProductSearch, ProductCard } from '@shopify/shop-minis-react';
import { Mic } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { AudioPlayer } from './components/AudioPlayer';

/**
 * Jenna Voice Shopping App
 * Chat UI copied EXACTLY from klariqo-widget.js
 * - User says something → user bubble appears
 * - AI responds → AI bubble appears
 * - Products appear as separate message bubble (max 3, vertical)
 * - Product search is completely isolated via separate edge function
 */
export function App() {
  // Separate state for search query and count
  const [searchQuery, setSearchQuery] = useState('');
  const [productCount, setProductCount] = useState(5);

  // WebSocket connection
  const {
    isConnected,
    conversationState,
    messages,
    productSearch,
    error,
    connect,
    disconnect,
    sendAudioChunk,
    setAudioChunkHandler,
  } = useWebSocket();

  // Product search using Shop Mini SDK with dynamic count
  const { products, loading: productsLoading } = useProductSearch({
    query: searchQuery,
    filters: {},
    first: productCount, // Use count from backend (default 5)
  });

  // Sync productSearch from backend to searchQuery state
  // Append timestamp to make query unique for "show more" requests
  useEffect(() => {
    if (productSearch?.query) {
      console.log('[App] New search requested:', productSearch.query, 'Count:', productSearch.count, 'Timestamp:', productSearch.timestamp);
      // Append timestamp to query to force SDK to refetch
      const uniqueQuery = `${productSearch.query} ${productSearch.timestamp || Date.now()}`;
      setSearchQuery(uniqueQuery);
      setProductCount(productSearch.count || 5);
    }
  }, [productSearch]);

  // Audio recorder
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(
    (chunk) => sendAudioChunk(chunk)
  );

  // Sync recording with listening state
  useEffect(() => {
    if (conversationState === 'listening' && !isRecording && isConnected) {
      startRecording();
    } else if (conversationState !== 'listening' && isRecording) {
      stopRecording();
    }
  }, [conversationState, isRecording, isConnected, startRecording, stopRecording]);

  return (
    <MinisRouter>
      <div className="relative w-full min-h-screen bg-white flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600">
          <h1 className="text-lg font-semibold text-white">
            Jenna
          </h1>
          <p className="text-sm text-white opacity-90">Voice AI</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto pb-32 px-6 py-4">
          {messages.length === 0 && !isConnected && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mic className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Voice Shopping with Jenna</h2>
              <p className="text-base text-gray-500 max-w-sm">
                Tap "Start Shopping" and speak naturally to find products
              </p>
            </div>
          )}

          {/* Message bubbles (EXACT from klariqo-widget.js) */}
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Products display - shown as separate message after AI response */}
            {products && products.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom Button - Fixed */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-6">
          {!isConnected ? (
            <Button
              onClick={connect}
              variant="primary"
              className="w-full h-14 rounded-full shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" />
                <span className="font-semibold">Start Shopping</span>
              </div>
            </Button>
          ) : (
            <Button
              onClick={disconnect}
              variant="destructive"
              className="w-full h-14 rounded-full shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" />
                <span className="font-semibold">End Shopping</span>
              </div>
            </Button>
          )}
        </div>

        {/* Audio Player - hidden */}
        <AudioPlayer onAudioChunkHandler={setAudioChunkHandler} />
      </div>
    </MinisRouter>
  );
}
