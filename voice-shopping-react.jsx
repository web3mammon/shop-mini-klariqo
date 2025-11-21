import React, { useState, useEffect, useRef } from 'react';

const VoiceShoppingContinuous = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [conversationState, setConversationState] = useState('idle'); // idle, listening, thinking, speaking
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentAiResponse, setCurrentAiResponse] = useState('');
  const [products, setProducts] = useState([]);
  const [isConversationExpanded, setIsConversationExpanded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Demo conversation flow
  const demoConversations = [
    {
      userQuery: "Show me red sneakers under $100",
      aiResponse: "Great choice! I found 4 red sneakers under $100 for you. They're all highly rated and from top brands.",
      products: [
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
      ]
    },
    {
      userQuery: "Do you have the Nike one in size 10?",
      aiResponse: "Yes! The Nike Air Max 270 Red is available in size 10. Here it is.",
      products: [
        {
          id: 5,
          title: "Nike Air Max 270 Red - Size 10",
          price: "$89.99",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          vendor: "Nike Store"
        }
      ]
    },
    {
      userQuery: "Can I get matching socks with this?",
      aiResponse: "Absolutely! I found a bundle that includes the shoes with white Nike socks. It's only $10 more!",
      products: [
        {
          id: 6,
          title: "Nike Air Max 270 Red + White Socks Bundle",
          price: "$99.99",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
          vendor: "Nike Store"
        }
      ]
    }
  ];

  const conversationIndexRef = useRef(0);

  // Simulate audio levels when speaking
  useEffect(() => {
    if (conversationState === 'speaking') {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [conversationState]);

  // Simulate continuous conversation flow
  useEffect(() => {
    if (!isConnected) return;

    // Start with AI greeting
    if (conversationHistory.length === 0) {
      setConversationState('speaking');
      setTimeout(() => {
        setCurrentAiResponse("Hi! I'm your shopping assistant. What can I help you find today?");
        setConversationState('listening');
      }, 1000);
    }
  }, [isConnected]);

  // Simulate conversation cycle when in listening state
  useEffect(() => {
    if (conversationState !== 'listening' || !isConnected) return;

    // Simulate user speaking after 2 seconds of listening
    const timer = setTimeout(() => {
      handleUserSpeech();
    }, 2000);

    return () => clearTimeout(timer);
  }, [conversationState, isConnected]);

  const handleUserSpeech = () => {
    const currentDemo = demoConversations[conversationIndexRef.current % demoConversations.length];
    
    // User is speaking - show transcript building
    setConversationState('listening');
    setCurrentTranscript(currentDemo.userQuery);
    
    // After user finishes (VAD detects silence)
    setTimeout(() => {
      setConversationState('thinking');
      
      // AI processing
      setTimeout(() => {
        // Add to history
        setConversationHistory(prev => [...prev, {
          userQuery: currentDemo.userQuery,
          aiResponse: currentDemo.aiResponse,
          timestamp: Date.now()
        }]);
        
        // AI starts speaking
        setConversationState('speaking');
        setCurrentAiResponse(currentDemo.aiResponse);
        setProducts(currentDemo.products);
        setCurrentTranscript('');
        
        // AI finishes speaking
        setTimeout(() => {
          setConversationState('listening');
          conversationIndexRef.current += 1;
        }, 3000);
      }, 1000);
    }, 2000);
  };

  const handleStartCall = () => {
    setIsConnected(true);
    setConversationState('connecting');
    setTimeout(() => {
      setConversationState('speaking');
    }, 500);
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setConversationState('idle');
    setConversationHistory([]);
    setCurrentTranscript('');
    setCurrentAiResponse('');
    setProducts([]);
    conversationIndexRef.current = 0;
  };

  const getStateDisplay = () => {
    switch (conversationState) {
      case 'connecting':
        return { text: 'Connecting...', color: 'text-gray-600' };
      case 'listening':
        return { text: 'Listening...', color: 'text-green-600' };
      case 'thinking':
        return { text: 'Thinking...', color: 'text-blue-600' };
      case 'speaking':
        return { text: 'Speaking...', color: 'text-blue-600' };
      default:
        return { text: 'Not connected', color: 'text-gray-400' };
    }
  };

  const stateDisplay = getStateDisplay();

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
      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* Conversation Status Bar - Only shows when connected */}
        {isConnected && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <button 
              onClick={() => setIsConversationExpanded(!isConversationExpanded)}
              className="w-full px-6 py-3 text-left"
            >
              {/* Collapsed View */}
              {!isConversationExpanded && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        conversationState === 'listening' ? 'bg-green-500 animate-pulse' :
                        conversationState === 'thinking' ? 'bg-blue-500 animate-pulse' :
                        conversationState === 'speaking' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <span className={`text-xs font-medium ${stateDisplay.color}`}>
                        {stateDisplay.text}
                      </span>
                    </div>
                    
                    {/* Current activity */}
                    {currentTranscript && (
                      <p className="text-sm text-gray-900 truncate flex-1">You: {currentTranscript}</p>
                    )}
                    {conversationState === 'speaking' && currentAiResponse && (
                      <div className="flex items-center gap-2 flex-1">
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
                        <p className="text-sm text-gray-700 truncate">Assistant responding...</p>
                      </div>
                    )}
                    
                    {conversationHistory.length > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {conversationHistory.length} {conversationHistory.length === 1 ? 'exchange' : 'exchanges'}
                      </span>
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
              
              {/* Expanded View - Full Conversation History */}
              {isConversationExpanded && (
                <div className="max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Conversation</h3>
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
                  
                  {/* Initial AI greeting */}
                  {currentAiResponse && conversationHistory.length === 0 && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mb-3">
                      <p className="text-xs font-medium text-blue-600 mb-1">Assistant:</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{currentAiResponse}</p>
                    </div>
                  )}
                  
                  {/* Conversation history */}
                  <div className="space-y-3">
                    {conversationHistory.map((conv, index) => (
                      <div key={index} className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">You:</p>
                          <p className="text-sm text-gray-900">{conv.userQuery}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-1">Assistant:</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{conv.aiResponse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current exchange in progress */}
                  {currentTranscript && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">You (current):</p>
                        <p className="text-sm text-gray-900">{currentTranscript}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Product Results */}
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

        {/* Empty State - Not Connected */}
        {!isConnected && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <svg width="48" height="48" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Voice Shopping</h2>
            <p className="text-base text-gray-500 max-w-sm mb-8">
              Start a conversation with your AI shopping assistant. Just speak naturally and I'll help you find what you need.
            </p>
            <div className="flex flex-col gap-2 text-left max-w-sm w-full bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <p className="text-sm text-gray-700">Tap "Start Shopping" to connect</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <p className="text-sm text-gray-700">Speak naturally about what you're looking for</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <p className="text-sm text-gray-700">Browse products and ask follow-up questions</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control - Fixed */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-8 px-6">
        {!isConnected ? (
          /* Start Call Button */
          <button
            onClick={handleStartCall}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-semibold rounded-full shadow-lg shadow-blue-200 active:scale-98 transition-transform flex items-center justify-center gap-2"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
            Start Shopping
          </button>
        ) : (
          /* End Call Button */
          <button
            onClick={handleEndCall}
            className="w-full py-4 bg-red-500 text-white text-base font-semibold rounded-full shadow-lg shadow-red-200 active:scale-98 transition-transform flex items-center justify-center gap-2"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
            End Shopping
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceShoppingContinuous;
