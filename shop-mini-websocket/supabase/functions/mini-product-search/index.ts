import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductSearchRequest {
  userInput: string;
  aiResponse: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

interface ProductSearchFilters {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  colors?: string[] | null;
  gender?: string | null;
}

interface ProductSearchResponse {
  hasSearchIntent: boolean;
  query?: string;
  filters?: ProductSearchFilters;
  count?: number;
}

/**
 * Mini Product Search - Standalone Edge Function
 *
 * Extracts product search intent from conversation using Groq.
 * Returns search query + filters for frontend to use with useProductSearch SDK hook.
 *
 * COPIED EXACTLY from voice-process lines 345-433
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body: ProductSearchRequest = await req.json();
    const { userInput, aiResponse, conversationHistory = [] } = body;

    console.log('[ProductSearch] Extracting search intent...');
    console.log(`[ProductSearch] Conversation history: ${conversationHistory.length} messages`);

    const searchIntent = await extractProductSearch(userInput, aiResponse, conversationHistory);

    if (!searchIntent) {
      console.log('[ProductSearch] No search intent detected');
      return new Response(
        JSON.stringify({ hasSearchIntent: false }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[ProductSearch] Search intent extracted:', searchIntent);

    return new Response(
      JSON.stringify({
        hasSearchIntent: true,
        query: searchIntent.query,
        filters: searchIntent.filters,
        count: searchIntent.count || null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[ProductSearch] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Product search failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Extract product search intent (EXACT from voice-process lines 346-433)
 */
async function extractProductSearch(
  userInput: string,
  aiResponse: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ query: string; filters: ProductSearchFilters; count?: number } | null> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

  // Build full conversation context
  const conversationText = conversationHistory
    .map((msg: any) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n');

  const currentExchange = `User: ${userInput}\nAI: ${aiResponse}`;
  const fullContext =
    conversationHistory.length > 0
      ? `Previous conversation:\n${conversationText}\n\nCurrent exchange:\n${currentExchange}`
      : currentExchange;

  console.log(
    `[ProductSearch] Extracting from ${conversationHistory.length} history messages + current exchange`
  );

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
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

Also extract HOW MANY products the user wants to see:
- "show me 10 options" → count: 10
- "give me 5 more" → count: 5
- "I want to see 20" → count: 20
- If not specified, leave count as null (defaults to 5)

Return JSON:
{
  "hasSearchIntent": true/false,
  "query": "full search keywords from entire conversation (e.g., 'red athletic sneakers')",
  "category": "shoes|clothing|accessories|bags|jewelry|beauty|null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "colors": ["red", "blue"] or null,
  "gender": "men|women|unisex|null",
  "count": number or null
}

If no search intent, return {"hasSearchIntent": false}`,
        },
        {
          role: 'user',
          content: `${fullContext}\n\nExtract complete search intent from the FULL conversation:`,
        },
      ],
      temperature: 0.1,
      // No max_tokens - let Groq complete the JSON naturally without cutoff
    }),
  });

  const data = await response.json();
  let content = data.choices[0]?.message?.content?.trim();

  console.log('[ProductSearch] Raw Groq response:', content);

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
        count: intent.count || null,
      };
    }
  } catch (e) {
    console.error('[ProductSearch] Parse error:', e);
    console.error('[ProductSearch] Failed to parse content:', content);
  }

  return null;
}
