// Jenna Voice Processing - HTTP Streaming Endpoint
// Accepts audio, processes via AssemblyAI/Groq/ElevenLabs, streams response

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert PCM to WAV by adding WAV header (matching production exactly)
function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number = 1, bitsPerSample: number = 16): Uint8Array {
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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { audioBase64, conversationHistory = [] } = await req.json();

    if (!audioBase64) {
      return new Response(JSON.stringify({ error: 'audioBase64 required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[VoiceProcess] Processing audio with ${conversationHistory.length} history messages...`);

    // Create a TransformStream for streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing in background
    (async () => {
      try {
        // Step 1: Transcribe with AssemblyAI
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Transcribing...' })}\n\n`));

        const transcript = await transcribeAudio(audioBase64);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'transcript', text: transcript })}\n\n`));

        // Step 2: Generate AI response with Groq
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Thinking...' })}\n\n`));

        let fullResponse = '';
        await processWithGroq(transcript, conversationHistory, async (chunk: string) => {
          fullResponse += chunk;
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'text', chunk })}\n\n`));
        });

        // Step 3: Generate TTS with ElevenLabs
        console.log('[VoiceProcess] Starting TTS generation for:', fullResponse);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Generating speech...' })}\n\n`));

        const audioChunks = await generateSpeech(fullResponse);
        console.log(`[VoiceProcess] TTS generated ${audioChunks.length} chunks`);

        for (const audioChunk of audioChunks) {
          console.log(`[VoiceProcess] Sending audio chunk (${audioChunk.substring(0, 50)}...)`);
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'audio', data: audioChunk })}\n\n`));
        }

        // Step 4: Extract product search intent (async, don't block on errors)
        try {
          const searchIntent = await extractProductSearch(transcript, fullResponse, conversationHistory);
          if (searchIntent) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'search', ...searchIntent })}\n\n`));
          }
        } catch (e) {
          console.error('[ProductSearch] Non-blocking error:', e);
          // Don't crash the whole response - product search is optional
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (error) {
        console.error('[VoiceProcess] Error:', error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[VoiceProcess] Request error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Transcribe audio with AssemblyAI
async function transcribeAudio(audioBase64: string): Promise<string> {
  const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY');

  // Decode base64 to PCM bytes (matching production: Uint8Array.from is native, no stack overflow)
  const pcmBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));

  // Convert PCM to WAV (24kHz, matching frontend sample rate)
  const wavBytes = pcmToWav(pcmBytes, 24000, 1, 16);

  console.log(`[Transcribe] PCM size: ${pcmBytes.length} bytes, WAV size: ${wavBytes.length} bytes`);

  // Upload audio directly (no need to convert to base64 and back)
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY!,
      'content-type': 'application/octet-stream',
    },
    body: wavBytes,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error('[Transcribe] Upload failed:', error);
    throw new Error('Audio upload failed');
  }

  const { upload_url } = await uploadResponse.json();
  console.log('[Transcribe] Audio uploaded:', upload_url);

  // Request transcription
  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: upload_url }),
  });

  const { id } = await transcriptResponse.json();

  // Poll for result
  let transcript;
  while (true) {
    const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { 'authorization': ASSEMBLYAI_API_KEY! },
    });
    transcript = await statusResponse.json();

    if (transcript.status === 'completed') {
      return transcript.text;
    } else if (transcript.status === 'error') {
      throw new Error('Transcription failed');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Process with Groq LLM (streaming)
async function processWithGroq(userInput: string, conversationHistory: any[], onChunk: (chunk: string) => Promise<void>): Promise<void> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

  const systemPrompt = `You are Jenna, an AI fashion stylist helping users shop for clothes on Shopify.

CONVERSATION STYLE:
- Keep responses under 40 words for voice clarity
- Be enthusiastic and helpful about fashion
- Ask qualifying questions: style, occasion, budget, size, colors, brands
- Speak naturally like a friendly fashion expert

YOUR ROLE:
- Help users find fashion items
- Make personalized recommendations
- When you understand what they want, say you'll find options

FORMATTING:
- NO markdown, bullets, or tables
- Speak naturally
- Say prices naturally: "twenty five dollars" not "$25"

Remember: Users are LISTENING, not reading.`;

  // Build messages with conversation history (last 10 messages)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: 'user', content: userInput }
  ];

  console.log(`[Groq] Processing with ${conversationHistory.length} history messages`);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages,
      temperature: 0.7,
      max_tokens: 150,
      stream: true,
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            await onChunk(content);
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    }
  }
}

// Generate speech with ElevenLabs
async function generateSpeech(text: string): Promise<string[]> {
  console.log(`[ElevenLabs] Generating TTS for: "${text.substring(0, 100)}..."`);

  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_API_KEY) {
    console.error('[ElevenLabs] API key not configured!');
    throw new Error('ElevenLabs API key not found');
  }

  const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice

  console.log('[ElevenLabs] Calling API...');
  // EXACT production format: PCM 16kHz
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_16000`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/pcm',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_flash_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    console.error('[ElevenLabs] API error:', await response.text());
    throw new Error('ElevenLabs TTS failed');
  }

  const audioArrayBuffer = await response.arrayBuffer();
  const pcmData = new Uint8Array(audioArrayBuffer);
  console.log(`[ElevenLabs] Received PCM audio: ${pcmData.length} bytes`);

  // Convert PCM to WAV (EXACT production logic)
  const wavData = pcmToWav(pcmData, 16000, 1, 16);
  console.log(`[ElevenLabs] Converted to WAV: ${wavData.length} bytes`);

  // Convert to base64 in chunks (EXACT production logic)
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < wavData.length; i += chunkSize) {
    const chunk = wavData.subarray(i, Math.min(i + chunkSize, wavData.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64 = btoa(binary);
  console.log(`[ElevenLabs] Converted to base64: ${base64.length} characters`);

  return [base64];
}

// Extract product search intent
async function extractProductSearch(userInput: string, aiResponse: string, conversationHistory: any[]): Promise<any> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

  // Build full conversation context
  const conversationText = conversationHistory.map((msg: any) =>
    `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
  ).join('\n');

  const currentExchange = `User: ${userInput}\nAI: ${aiResponse}`;
  const fullContext = conversationHistory.length > 0
    ? `Previous conversation:\n${conversationText}\n\nCurrent exchange:\n${currentExchange}`
    : currentExchange;

  console.log(`[ProductSearch] Extracting from ${conversationHistory.length} history messages + current exchange`);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: `Extract product search intent from the FULL conversation context.
Look at ALL messages to understand what the user is looking for.

IMPORTANT: Build on previous context! If user said "red sneakers" then "under $100", the search should be "red sneakers" with maxPrice filter.

Return JSON:
{
  "hasSearchIntent": true/false,
  "query": "full search keywords from entire conversation (e.g., 'red athletic sneakers')",
  "category": "shoes|clothing|accessories|bags|jewelry|beauty|null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "colors": ["red", "blue"] or null,
  "gender": "men|women|unisex|null"
}

If no search intent, return {"hasSearchIntent": false}`,
        },
        {
          role: 'user',
          content: `${fullContext}\n\nExtract complete search intent from the FULL conversation:`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  let content = data.choices[0]?.message?.content?.trim();

  // Strip markdown code blocks if present (LLM sometimes returns ```json...```)
  if (content && content.includes('```')) {
    content = content.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
  }

  // Also try to extract JSON if it's embedded in other text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
  }

  try {
    const intent = JSON.parse(content);
    if (intent.hasSearchIntent && intent.query) {
      return {
        query: intent.query,
        filters: {
          category: intent.category,
          minPrice: intent.minPrice,
          maxPrice: intent.maxPrice,
          colors: intent.colors,
          gender: intent.gender,
        },
      };
    }
  } catch (e) {
    console.error('[ProductSearch] Parse error:', e);
  }

  return null;
}
