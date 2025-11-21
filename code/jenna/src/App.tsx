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
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [startIndex, setStartIndex] = useState(0); // Where to start showing products
  const [displayCount, setDisplayCount] = useState(5); // How many to show

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
  } = useWebSocket();

  // Product search - ALWAYS fetch 50 products (not 5!)
  const { products, loading: productsLoading } = useProductSearch({
    query: searchQuery,
    filters: {},
    first: 50, // ✨ Always fetch 50, display only what user wants
  });

  // Handle NEW SEARCH (new query or filter change)
  useEffect(() => {
    if (productSearch?.query) {
      console.log('[App] 🔍 NEW SEARCH requested:', productSearch.query, 'Initial display count:', productSearch.count);
      // Append timestamp to make query unique
      const uniqueQuery = `${productSearch.query} ${productSearch.timestamp || Date.now()}`;
      setSearchQuery(uniqueQuery);
      setStartIndex(0); // ✨ Reset to start from beginning
      setDisplayCount(productSearch.count || 5);
      console.log('[App] ✅ Will fetch 50 products, show products 1-' + (productSearch.count || 5));
    }
  }, [productSearch]);

  // Handle PAGINATION (show NEXT page, not append!)
  useEffect(() => {
    if (shouldFetchMore) {
      const newCount = productSearch?.count || 5;
      const newStartIndex = startIndex + displayCount; // Move forward by current displayCount

      console.log('[App] 🔄 PAGINATION requested - showing NEXT page (replacing current)');
      console.log('[App] Previous range: products', startIndex + 1, 'to', startIndex + displayCount);
      console.log('[App] New start index:', newStartIndex);
      console.log('[App] New display count:', newCount);
      console.log('[App] New range: products', newStartIndex + 1, 'to', newStartIndex + newCount);

      setStartIndex(newStartIndex); // ✨ Move to next page
      setDisplayCount(newCount); // Update count (user might say "show me 10 more")
      resetFetchMore();

      console.log('[App] ✅ Now showing products', newStartIndex + 1, 'to', newStartIndex + newCount);
    }
  }, [shouldFetchMore, startIndex, displayCount, productSearch, resetFetchMore]);

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
                  {/* ✨ Show current page only (startIndex to startIndex + displayCount) */}
                  {products.slice(startIndex, startIndex + displayCount).map((product) => (
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
