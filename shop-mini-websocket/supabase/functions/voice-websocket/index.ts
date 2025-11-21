/**
 * Jenna Voice WebSocket - Clean version for Shop Minis
 * Based on chat-websocket-production, stripped of multi-tenant complexity
 *
 * Core Pipeline: Audio (PCM 24kHz) → AssemblyAI → Groq → ElevenLabs + Shopify Search
 */

// ============================================================================
// HELPER: Convert PCM to WAV (EXACT from production)
// ============================================================================
function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels = 1, bitsPerSample = 16): Uint8Array {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // File length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // Format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate
  view.setUint32(28, byteRate, true);
  // Block align
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, bitsPerSample, true);
  // Data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // Data chunk length
  view.setUint32(40, dataSize, true);

  // Combine header + PCM data
  const wavFile = new Uint8Array(header.byteLength + pcmData.length);
  wavFile.set(new Uint8Array(header), 0);
  wavFile.set(pcmData, header.byteLength);

  return wavFile;
}

// ============================================================================
// SESSION INTERFACE (Simplified - no client/user data)
// ============================================================================
interface Session {
  assemblyaiConnection: WebSocket | null;
  conversationHistory: Array<{ role: string; content: string }>;
  isProcessing: boolean;
  keepaliveInterval: number | null;
}

const sessions = new Map<string, Session>();

// ============================================================================
// MAIN WEBSOCKET SERVER
// ============================================================================
Deno.serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const sessionId = crypto.randomUUID();

  socket.onopen = async () => {
    console.log(`[WebSocket] Connected - Session: ${sessionId}`);

    // Create simple session
    const session: Session = {
      assemblyaiConnection: null,
      conversationHistory: [],
      isProcessing: false,
      keepaliveInterval: null,
    };
    sessions.set(sessionId, session);

    // Set up keepalive ping every 30 seconds to prevent idle timeout (EXACT from production)
    session.keepaliveInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
        console.log('[Keepalive] Ping sent');
      }
    }, 30000);

    // Initialize AssemblyAI connection FIRST (critical path)
    const assemblyaiReady = await initializeAssemblyAI(sessionId, socket);
    if (!assemblyaiReady) {
      console.error('[WebSocket] Failed to initialize AssemblyAI');
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize voice recognition'
      }));
      socket.close();
      return;
    }

    // Send connection established
    socket.send(JSON.stringify({
      type: 'connection.established',
      sessionId,
      message: 'Jenna Voice AI ready'
    }));

    console.log(`[WebSocket] Session initialized: ${sessionId}`);
  };

  socket.onmessage = async (event) => {
    try {
      const session = sessions.get(sessionId);
      if (!session) {
        console.error('[WebSocket] Session not found:', sessionId);
        return;
      }

      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'audio.chunk':
          await handleAudioChunk(sessionId, data.audio, socket);
          break;

        case 'pong':
          console.log('[WebSocket] Pong received');
          break;

        case 'interrupt':
          console.log('[WebSocket] User interrupted');
          // Just reset processing flag
          session.isProcessing = false;
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] Message handling error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  socket.onclose = () => {
    console.log(`[WebSocket] Connection closed - Session: ${sessionId}`);
    const session = sessions.get(sessionId);

    if (session) {
      // Clean up keepalive interval
      if (session.keepaliveInterval) {
        clearInterval(session.keepaliveInterval);
      }

      // Close AssemblyAI connection
      if (session.assemblyaiConnection) {
        session.assemblyaiConnection.close();
      }
    }

    sessions.delete(sessionId);
  };

  socket.onerror = (error) => {
    console.error('[WebSocket] Error:', error);
  };

  return response;
});

// ============================================================================
// ASSEMBLYAI INITIALIZATION (EXACT from production)
// ============================================================================
async function initializeAssemblyAI(sessionId: string, clientSocket: WebSocket): Promise<boolean> {
  const session = sessions.get(sessionId);
  if (!session) return false;

  const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY');
  if (!ASSEMBLYAI_API_KEY) {
    console.error('[AssemblyAI] API key not configured');
    return false;
  }

  try {
    const params = new URLSearchParams({
      sample_rate: '24000',
      format_turns: 'true',
      end_of_turn_confidence_threshold: '0.7',
      min_end_of_turn_silence_when_confident: '160',
      max_turn_silence: '1000',
      inactivity_timeout: '900',
      token: ASSEMBLYAI_API_KEY,
    });

    const assemblyaiWs = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${params}`);

    const connectionPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        console.error('[AssemblyAI] Connection timeout');
        resolve(false);
      }, 10000);

      assemblyaiWs.onopen = () => {
        clearTimeout(timeout);
        console.log('[AssemblyAI] Connected');
        session.assemblyaiConnection = assemblyaiWs;
        resolve(true);
      };

      assemblyaiWs.onerror = (error) => {
        clearTimeout(timeout);
        console.error('[AssemblyAI] Connection error:', error);
        resolve(false);
      };
    });

    assemblyaiWs.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const msgType = data.type;

        if (msgType === 'Begin') {
          console.log(`[AssemblyAI] Session began: ID=${data.id}`);
        } else if (msgType === 'Turn') {
          const transcript = data.transcript || '';
          const isFormatted = data.turn_is_formatted;

          if (transcript && transcript.trim()) {
            console.log(`[AssemblyAI] ${isFormatted ? 'Formatted' : 'Partial'}: ${transcript}`);

            // Send all transcripts to client (both partial and formatted for live display)
            clientSocket.send(JSON.stringify({
              type: 'transcript.user',
              text: transcript,
              isFinal: isFormatted
            }));

            if (isFormatted && !session.isProcessing) {
              session.isProcessing = true;
              await processWithGPT(sessionId, transcript, clientSocket);
            }
          }
        } else if (msgType === 'Termination') {
          console.log(`[AssemblyAI] Session terminated: Audio=${data.audio_duration_seconds}s`);
        }
      } catch (error) {
        console.error('[AssemblyAI] Message parsing error:', error);
      }
    };

    assemblyaiWs.onclose = (event) => {
      console.log(`[AssemblyAI] Connection closed: code=${event.code}`);
    };

    return await connectionPromise;
  } catch (error) {
    console.error('[AssemblyAI] Connection error:', error);
    return false;
  }
}

// ============================================================================
// AUDIO CHUNK HANDLER (EXACT from production)
// ============================================================================
async function handleAudioChunk(sessionId: string, audioBase64: string, socket: WebSocket) {
  const session = sessions.get(sessionId);
  if (!session || !session.assemblyaiConnection) return;

  try {
    const audioData = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));

    if (session.assemblyaiConnection.readyState === WebSocket.OPEN) {
      session.assemblyaiConnection.send(audioData);
    }
  } catch (error) {
    console.error('[Audio] Error processing chunk:', error);
  }
}

// ============================================================================
// GROQ LLM PROCESSING (Cleaned from production, hardcoded Jenna prompt)
// ============================================================================
async function processWithGPT(sessionId: string, userInput: string, socket: WebSocket) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  if (!GROQ_API_KEY) {
    console.error('[Groq] API key not configured');
    session.isProcessing = false;
    return;
  }

  // Hardcoded Jenna system prompt (voice-optimized for shopping)
  const systemPrompt = `You are Jenna, a friendly AI shopping assistant for fashion and lifestyle products.

CONVERSATION STYLE (CRITICAL - VOICE CONVERSATION):
- Keep EVERY response under 40 words maximum for voice clarity
- Be warm, conversational, and enthusiastic
- Use contractions naturally: I'll, we'll, you're, that's, let's
- Sound natural: "Yeah, I can help with that!", "Ooh, great choice!"
- This is VOICE - speak naturally, not like writing text

YOUR JOB:
- Help users find products they're looking for
- Answer questions about products
- Be friendly and helpful throughout the conversation

CRITICAL RULE - NEVER DESCRIBE SPECIFIC PRODUCTS:
- NEVER mention specific product names, brands, or prices
- NEVER say things like "Here's a Nike Air Max for $99" or "I found a red dress from Zara"
- Instead, say things like "Let me find that for you!" or "I'll pull up some options!"
- The app will show actual products automatically - you just acknowledge the request

PRODUCT COUNT FEATURE:
- By default, you show 5 product options
- Users can ask for more: "show me 10", "give me 20 options", "I want to see more"
- CRITICAL: ONLY mention a specific number if the user EXPLICITLY said that number
  - If user says "show me 10" → You say "Here are ten options!"
  - If user says "show me more" → You say "Here are more options!" (DON'T make up a number!)
- Also mention they can adjust: "You can tell me how many you'd like to see!"

CONVERSATION EXAMPLES:
User: "Show me red sneakers under $100"
You: "Absolutely! Let me find some awesome red sneakers for you under one hundred dollars."

User: "Show me 10 options"
You: "Sure! Here are ten options for you!"

User: "I want to see more"
You: "You got it! Here are more options. You can also tell me exactly how many you'd like!"

User: "A few more please"
You: "Sure! Here you go. Let me know if you want to see a specific number of options!"

User: "Do you have that in size 10?"
You: "Let me check size ten options for you!"

User: "Can I get matching socks?"
You: "Great idea! Let me find some matching socks."

User: "I need a dress for a wedding"
You: "Ooh, exciting! Let me find some beautiful dresses for you."

FORMATTING RULES:
- NEVER use markdown, bullets, or special formatting
- Keep it conversational and natural
- For prices, say "ninety nine dollars" not "$99"

Remember: You're helpful, enthusiastic, and concise. Keep responses SHORT! Let the app show the products - you just acknowledge!`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.conversationHistory.slice(-6), // Keep last 3 exchanges
      { role: 'user', content: userInput }
    ];

    console.log('[Groq] Sending streaming request...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        max_tokens: 150,
        temperature: 0.7,
        stream: true
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    // Stream the response with sentence-based chunking (EXACT production logic)
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let textBuffer = '';
    let audioChunkIndex = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;

              if (delta?.content) {
                const chunkText = delta.content;
                fullResponse += chunkText;
                textBuffer += chunkText;

                // Check for sentence endings (punctuation + space to avoid decimals)
                const sentenceEndPattern = /[.!?]\s/;
                const hasSentenceEnding = sentenceEndPattern.test(textBuffer);

                if (hasSentenceEnding) {
                  let lastEndingPos = -1;
                  for (let i = 0; i < textBuffer.length - 1; i++) {
                    const char = textBuffer[i];
                    const nextChar = textBuffer[i + 1];
                    if ((char === '.' || char === '!' || char === '?') && /\s/.test(nextChar)) {
                      lastEndingPos = i;
                    }
                  }

                  if (lastEndingPos !== -1) {
                    const sentenceChunk = textBuffer.substring(0, lastEndingPos + 1).trim();
                    const remainingText = textBuffer.substring(lastEndingPos + 1).trim();

                    if (sentenceChunk) {
                      console.log(`[Groq] Sentence: "${sentenceChunk}"`);

                      // Check socket state before sending
                      if (socket.readyState !== WebSocket.OPEN) {
                        console.log('[Groq] Socket closed, aborting stream');
                        return;
                      }

                      socket.send(JSON.stringify({
                        type: 'text.chunk',
                        text: sentenceChunk
                      }));

                      // Generate TTS sequentially to guarantee chunk order
                      await generateSpeechChunk(sessionId, sentenceChunk, socket, audioChunkIndex++);
                      textBuffer = remainingText;
                    }
                  }
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    // Send any remaining text
    if (textBuffer.trim()) {
      console.log(`[Groq] Final chunk: "${textBuffer}"`);

      if (socket.readyState !== WebSocket.OPEN) {
        console.log('[Groq] Socket closed, aborting final chunk');
        return;
      }

      socket.send(JSON.stringify({
        type: 'text.chunk',
        text: textBuffer.trim()
      }));

      await generateSpeechChunk(sessionId, textBuffer.trim(), socket, audioChunkIndex++);
    }

    const aiResponse = fullResponse || 'I apologize, I didn\'t catch that.';

    socket.send(JSON.stringify({
      type: 'audio.complete',
      total_chunks: audioChunkIndex
    }));

    // Update conversation history
    session.conversationHistory.push(
      { role: 'user', content: userInput },
      { role: 'assistant', content: aiResponse }
    );

    // Call product search (fire-and-forget, non-blocking)
    console.log('[ProcessWithGPT] Triggering product search...');
    searchProducts(sessionId, userInput, aiResponse, socket).catch((e) => {
      console.error('[ProductSearch] Background error:', e);
    });

  } catch (error) {
    console.error('[Groq] Error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process request'
    }));
  } finally {
    session.isProcessing = false;
  }
}

// ============================================================================
// ELEVENLABS TTS (EXACT from production - Sarah voice)
// ============================================================================
async function generateSpeechChunk(sessionId: string, text: string, socket: WebSocket, chunkIndex: number) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) {
    console.error('[ElevenLabs] API key not configured');
    return;
  }

  // Sarah voice (feminine, friendly)
  const voiceId = 'EXAVITQu4vr4xnSDxMaL';

  // Clean text for TTS (remove SEARCH_PRODUCTS markers)
  let speechText = text.replace(/SEARCH_PRODUCTS[\s\S]*$/g, '').trim();
  if (!speechText) return;

  try {
    console.log(`[ElevenLabs-Chunk #${chunkIndex}] Generating TTS for: "${speechText.substring(0, 50)}..."`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_16000`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/pcm',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: speechText,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[ElevenLabs] API error:', await response.text());
      return;
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const pcmData = new Uint8Array(audioArrayBuffer);

    // Convert PCM to WAV (add WAV header so browsers can play it)
    const wavData = pcmToWav(pcmData, 16000, 1, 16);

    // Convert to base64 in chunks (EXACT production logic)
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < wavData.length; i += chunkSize) {
      const chunk = wavData.subarray(i, Math.min(i + chunkSize, wavData.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const audioBase64 = btoa(binary);

    socket.send(JSON.stringify({
      type: 'audio.chunk',
      audio: audioBase64,
      format: 'wav',
      chunk_index: chunkIndex,
    }));

    console.log(`[ElevenLabs-Chunk #${chunkIndex}] Sent WAV audio (${wavData.length} bytes)`);
  } catch (error) {
    console.error(`[ElevenLabs-Chunk #${chunkIndex}] Error:`, error);
  }
}

// ============================================================================
// PRODUCT SEARCH (Separate edge function - complete isolation from voice AI)
// ============================================================================
async function searchProducts(sessionId: string, userInput: string, aiResponse: string, socket: WebSocket) {
  const session = sessions.get(sessionId);
  if (!session) {
    console.error('[ProductSearch] Session not found:', sessionId);
    return;
  }

  try {
    console.log('[ProductSearch] Calling mini-product-search edge function...');

    const response = await fetch(
      'https://btqccksigmohyjdxgrrj.supabase.co/functions/v1/mini-product-search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          aiResponse,
          conversationHistory: session.conversationHistory,
        }),
      }
    );

    if (!response.ok) {
      console.error('[ProductSearch] HTTP error:', response.status);
      return;
    }

    const data = await response.json();

    if (data.hasSearchIntent && data.query) {
      console.log('[ProductSearch] Search intent found:', data.query);
      console.log('[ProductSearch] 🔄 isPagination:', data.isPagination);

      // Build query string with filters appended to make it unique
      let finalQuery = data.query;
      const filters = data.filters || {};
      const count = data.count || 5; // Default to 5 products
      const isPagination = data.isPagination || false;

      // Append filters to query string so it's unique each time
      if (filters.minPrice) finalQuery += ` above $${filters.minPrice}`;
      if (filters.maxPrice) finalQuery += ` under $${filters.maxPrice}`;
      if (filters.colors && filters.colors.length > 0) finalQuery += ` ${filters.colors.join(' ')}`;
      if (filters.gender) finalQuery += ` ${filters.gender}`;
      if (filters.category) finalQuery += ` ${filters.category}`;

      console.log('[ProductSearch] Final query with filters:', finalQuery);
      console.log('[ProductSearch] Count requested:', count);

      // Send different message type based on pagination
      if (socket.readyState === WebSocket.OPEN) {
        const messageType = isPagination ? 'products.fetchMore' : 'products.search';
        console.log(`[ProductSearch] 📤 Message type: ${messageType} (${isPagination ? 'PAGINATION' : 'NEW SEARCH'})`);

        const message = {
          type: messageType,
          query: finalQuery, // Send enhanced query with filters
          filters: filters,
          count: count,
          timestamp: Date.now(), // Add timestamp to force refresh
        };
        console.log('[ProductSearch] Sending to frontend:', JSON.stringify(message));
        socket.send(JSON.stringify(message));
        console.log('[ProductSearch] ✅ Message sent to frontend');
      } else {
        console.error('[ProductSearch] ❌ Socket not open! readyState:', socket.readyState);
      }
    } else {
      console.log('[ProductSearch] No search intent detected');
    }
  } catch (error) {
    console.error('[ProductSearch] Error:', error);
    // Don't send error to frontend - product search is optional
  }
}

