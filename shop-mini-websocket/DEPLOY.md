# Deploy shop-mini-websocket

## Prerequisites
Make sure these secrets are set in your Supabase project:
```bash
supabase secrets list
```

Should have:
- ASSEMBLYAI_API_KEY
- GROQ_API_KEY
- ELEVENLABS_API_KEY

## Deploy
```bash
cd shop-mini-websocket

SUPABASE_ACCESS_TOKEN="sbp_42a9dcb66f1e84c8bff90933c7516e5b705fc847" \
npx supabase functions deploy shop-mini-websocket --project-ref btqccksigmohyjdxgrrj --no-verify-jwt
```

## Test
```bash
# WebSocket URL will be:
wss://btqccksigmohyjdxgrrj.supabase.co/functions/v1/shop-mini-websocket
```

## What's Different from chat-websocket

**REMOVED:**
- ❌ Client DB lookup (voice_ai_clients table)
- ❌ Access control / trial checking
- ❌ Lead extraction
- ❌ Calendar booking
- ❌ Minute tracking
- ❌ FlexPrice integration
- ❌ Voice profile selection

**KEPT:**
- ✅ AssemblyAI STT (24kHz PCM)
- ✅ Groq LLM streaming (GPT-OSS-20B)
- ✅ ElevenLabs TTS (Sarah voice)
- ✅ Sentence-by-sentence chunking
- ✅ WebSocket keepalive
- ✅ Interrupt handling

**NEW:**
- ✨ Jenna-specific prompt (fashion shopping assistant)
- ✨ Simplified session management (no DB)
- ✨ Optimized for Shop Minis use case
