import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const VoiceShoppingMini = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [products, setProducts] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConversationExpanded, setIsConversationExpanded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Simulated products for demo - Red sneakers
  const demoProducts = [
    {
      id: 1,
      title: "Nike Air Max 270 Red",
      price: "$89.99",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      vendor: "Nike Store"
    },
    {
      id: 2,
      title: "Adidas Ultraboost Red",
      price: "$95.00",
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
      vendor: "Adidas Official"
    },
    {
      id: 3,
      title: "Puma RS-X Red Edition",
      price: "$79.99",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
      vendor: "Puma"
    },
    {
      id: 4,
      title: "Reebok Classic Red",
      price: "$69.99",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      vendor: "Reebok Shop"
    }
  ];

  const demoProducts2 = [
    {
      id: 5,
      title: "Nike Air Max 270 Red - Size 10",
      price: "$89.99",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      vendor: "Nike Store"
    }
  ];

  const demoProducts3 = [
    {
      id: 6,
      title: "Nike Air Max 270 Red + White Socks Bundle",
      price: "$99.99",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      vendor: "Nike Store"
    }
  ];

  // Different conversation scenarios
  const conversations = [
    {
      userQuery: "Show me red sneakers under $100",
      aiResponse: "Great choice! I found 4 red sneakers under $100 for you. They're all highly rated and from top brands. Let me show you what we have available.",
      products: demoProducts
    },
    {
      userQuery: "Do you have the Nike one in size 10?",
      aiResponse: "Yes! The Nike Air Max 270 Red is available in size 10. I've filtered the results to show only that size for you.",
      products: demoProducts2
    },
    {
      userQuery: "Can I get matching socks with this?",
      aiResponse: "Absolutely! I found a bundle that includes the Nike Air Max 270 Red with a pair of white Nike socks. It's only $10 more than buying them separately!",
      products: demoProducts3
    },
    {
      userQuery: "Perfect! Add it to my cart",
      aiResponse: "Done! I've added the Nike bundle to your cart. Your total is $99.99. Would you like to continue shopping or proceed to checkout?",
      products: []
    }
  ];

  // Simulate audio level animation while playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isPlaying]);

  const handleMouseDown = () => {
    setIsRecording(true);
  };

  const handleMouseUp = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Get the current conversation based on interaction count
    const currentConversation = conversations[interactionCount % conversations.length];
    
    // Simulate processing and response
    setTimeout(() => {
      // Add previous interaction to history before updating
      if (transcript && aiResponse) {
        setConversationHistory(prev => [...prev, {
          userQuery: transcript,
          aiResponse: aiResponse,
          timestamp: Date.now()
        }]);
      }
      
      setTranscript(currentConversation.userQuery);
      setIsProcessing(false);
      setIsPlaying(true);
      
      // AI response comes first
      setTimeout(() => {
        setAiResponse(currentConversation.aiResponse);
      }, 300);
      
      // Then products appear (or clear if none)
      setTimeout(() => {
        setProducts(currentConversation.products);
      }, 800);
      
      // Audio stops playing
      setTimeout(() => {
        setIsPlaying(false);
      }, 3500);
      
      // Increment interaction count for next time
      setInteractionCount(prev => prev + 1);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button className="text-gray-600 text-2xl flex items-center justify-center w-10 h-10">←</button>
        <h1 className="text-lg font-semibold text-gray-900">Voice Shopping</h1>
        <button className="text-gray-600 flex items-center justify-center w-10 h-10">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
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
                      {conversationHistory.length > 0 && (
                        <span className="text-xs text-gray-400">
                          ({conversationHistory.length + 1} {conversationHistory.length + 1 === 1 ? 'message' : 'messages'})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 truncate">{transcript}</p>
                    {isPlaying && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-blue-500 rounded-full transition-all duration-150"
                              style={{
                                height: `${8 + (audioLevel + i * 8) % 12}px`,
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Speaking...</span>
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
                  {/* Previous conversations */}
                  {conversationHistory.length > 0 && (
                    <div className="mb-4 space-y-3 pb-3 border-b border-gray-200">
                      {conversationHistory.map((conv, index) => (
                        <div key={index} className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-1">You:</p>
                            <p className="text-sm text-gray-700">{conv.userQuery}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-1">Assistant:</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{conv.aiResponse}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Current conversation */}
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
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 mb-1">Assistant:</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{aiResponse}</p>
                    </div>
                  )}
                  
                  {isPlaying && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-blue-500 rounded-full transition-all duration-150"
                            style={{
                              height: `${8 + (audioLevel + i * 8) % 16}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-blue-600 font-medium">Speaking...</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Product Results - Takes center stage */}
        {products.length > 0 && (
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {products.length} {products.length === 1 ? 'result' : 'results'}
              </h2>
              <button className="text-sm text-blue-600 font-medium">
                Filters
              </button>
            </div>
            
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm active:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 p-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.vendor}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xl font-semibold text-gray-900">{product.price}</span>
                          <button className="px-5 py-2 bg-black text-white text-sm font-medium rounded-full active:bg-gray-800 transition-colors whitespace-nowrap">
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!transcript && !isProcessing && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Shop by Voice</h2>
            <p className="text-base text-gray-500 max-w-sm">
              Tap and hold the microphone button below to describe what you're looking for
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
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className={`relative w-20 h-20 rounded-full transition-all duration-200 flex items-center justify-center ${
              isRecording 
                ? 'bg-red-500 scale-110 shadow-lg shadow-red-200' 
                : 'bg-blue-500 shadow-lg shadow-blue-200'
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
    </div>
  );
};

export default VoiceShoppingMini;
