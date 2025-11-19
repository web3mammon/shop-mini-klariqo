# Klariqo Shop Mini - Project Plan
**Project:** Personality-Driven Voice Shopping Assistants
**First Launch:** Jenna - Fashion AI
**Timeline:** Nov 15 - Dec 5, 2025 (21 days to featured deadline)
**Incentives:** $10k max per partner (split across minis) + $3k AI reimbursement
**Status:** 🟡 Planning Phase

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [The Personality Strategy](#the-personality-strategy)
3. [Jenna - Fashion AI (Priority)](#jenna---fashion-ai-priority)
4. [Future Personalities](#future-personalities)
5. [Feature Ideas](#feature-ideas)
6. [Technical Stack](#technical-stack)
7. [What We Already Have](#what-we-already-have)
8. [What We Need to Build](#what-we-need-to-build)
9. [Timeline & Milestones](#timeline--milestones)
10. [Open Questions](#open-questions)
11. [Progress Tracking](#progress-tracking)
12. [Resources](#resources)

---

## 🎯 Project Overview

### The Opportunity
Shopify invited Klariqo to build one of the first Shop Minis - mini-apps that run inside the Shop mobile app (top 3 shopping app, millions of users).

**Current State of Shop Minis (Nov 15, 2025):**
- Only 8 Minis live in the app currently
- Focus on specialized, personalized experiences
- Examples: Virtual try-ons, Recipe trackers (find dishes → shop ingredients)
- "Next level personalization" is the theme

### The Strategy Pivot
**From:** Generic "Voice Shopping Assistant"
**To:** Personality-driven, specialized shopping assistants

**Why:**
- ✅ Aligns with Shopify's "single purpose" design guideline
- ✅ Better discoverability (users find what they need)
- ✅ Multiple featuring opportunities (one per personality)
- ✅ Stronger brand identity per mini
- ✅ More engagement opportunities for long-term revenue share
- ✅ Follows pattern of existing successful Minis (specialized, not generic)

### Bounty Reality Check
**Important:** Incentive is $10k MAX per partner (NOT per Mini)
- Can submit multiple Minis, total won't exceed $10k
- Might split: Jenna $4k + Chef Roshi $3k + Glow $2k + Fit $1k = $10k
- **Strategy:** Go all-in on Jenna first (maximize quality), then evaluate others

### Success Metrics (Shopify's Framework)
All personalities hit the three attributes:
1. **Cross-Catalog** ✅ - Search products from ANY merchant
2. **Personalized** ✅ - Learn user preferences, style, needs
3. **Habit-Forming** ✅ - Daily usage (outfit advice, meal planning, etc.)

---

## 🎨 The Personality Strategy

### The Concept
Instead of one generic "shopping assistant," build **separate Minis with distinct personalities** for different shopping verticals.

**Think:**
- Jenna = Your fashionable best friend
- Chef Roshi = Your wise culinary guide
- Glow = Your skincare expert
- Fit = Your gym buddy

### Why Separate Minis (Not One Multi-Purpose)

**Considered:** One Mini where user picks personality (Jenna/Chef/Glow/Fit)
**Rejected Because:**
- ❌ Violates "single purpose" guideline
- ❌ Harder to discover (buried in options)
- ❌ Won't get featured (too generic)
- ❌ Diluted brand identity
- ❌ Only one $10k opportunity

**Going With:** Separate Mini per personality
**Benefits:**
- ✅ Single clear purpose (aligns with guidelines)
- ✅ Better search/discovery ("fashion AI" vs "shopping assistant")
- ✅ Multiple featuring chances
- ✅ Each builds its own community
- ✅ 4 separate engagement metrics for revenue share
- ✅ Can launch iteratively (not overwhelmed)

### Technical Reality
**90% code reuse across all personalities:**
- Same voice backend (chat-websocket)
- Same UI components (VoiceOrb, ProductGrid, etc.)
- Same hooks (useVoiceConnection, useProductSearch)

**What changes per personality:**
- AI system prompts (personality voice)
- Product categories (`useProductSearch` filters)
- Branding colors/design
- Entry point descriptions

**Development time:**
- First mini (Jenna): 3-4 weeks (build shared foundation)
- Each additional mini: 3-5 days (mostly config!)

---

## 👗 Jenna - Fashion AI (Priority)

**Launch Target:** Dec 5, 2025 (21 days) for featured placement

### Concept
**Tagline:** "Your personal stylist, always in your pocket"

**Personality:**
- Friendly, trendy, supportive
- Like your fashionable best friend
- Positive vibes only ("This would look amazing on you!")
- Conversational, not robotic

**Voice Tone:**
- Warm, enthusiastic
- Uses casual language ("Ooh, I love that!")
- Celebrates user's style choices
- Encouraging, never judgmental

### Core Use Cases

1. **Outfit Advice**
   - "What should I wear to a wedding?"
   - "Casual date night outfit ideas?"
   - "Business casual for an interview"

2. **Product Search**
   - "Find red sneakers under $100"
   - "Show me summer dresses"
   - "I need a leather jacket"

3. **Photo Analysis** 🔥
   - Upload selfie: "Does this dress suit me?"
   - AI analyzes skin tone, style
   - Suggests complementary colors/styles
   - **POSITIVE FEEDBACK ONLY** (never insult users!)

4. **Voice Add to Cart**
   - "Add those Nike Air Max to my cart"
   - "I want the red one in size 8"
   - Hands-free shopping

5. **Style Assistance**
   - "What colors suit my skin tone?"
   - "How do I style this leather jacket?"
   - "Mix and match these items"

### Product Categories
- Clothing (all categories)
- Shoes & Accessories
- Jewelry
- Bags & Purses
- Fashion categories on Shop

### Habit-Forming Features

**Daily Engagement:**
- "Jenna, what should I wear today?"
- Daily outfit inspiration
- "What's trending in fashion?"

**Recurring Needs:**
- Seasonal wardrobe updates
- Event-based shopping (weddings, dates, travel)
- Shopping list for your style
- Price drop alerts on saved items

**Social/Sharing:**
- Share outfit ideas with friends
- Collaborative shopping lists
- "What do you think of this?" discussions

### MVP Features (Dec 5 Launch)

**Must Have:**
- ✅ Voice chat interface
- ✅ Product search (fashion categories)
- ✅ Voice + visual results (cards)
- ✅ Add to cart via voice
- ✅ Photo upload for outfit analysis
- ✅ Positive-only feedback system

**Nice to Have:**
- Shopping list/favorites
- Style preference learning
- Outfit combination suggestions
- Price tracking

**Phase 2 (Post-Launch):**
- Virtual try-on integration
- Share with friends
- Seasonal trend alerts
- Personal lookbook

### Success Criteria

**Approval:**
- <3s load time
- <5MB bundle
- No critical bugs
- Follows design guidelines

**Featured Placement:**
- High quality UI/UX
- Unique value (photo analysis)
- Smooth voice experience
- Habit-forming mechanics

**User Engagement:**
- Daily active users (outfit questions)
- High session duration (browsing products)
- Actual purchases (cart additions)

---

## 🍳 Future Personalities

### Chef Roshi - Culinary AI (Jan 2026)

**Tagline:** "From cravings to cart, your personal chef"

**Personality:** Wise, passionate about food, multicultural

**Use Cases:**
- "I want to make Thai curry tonight"
- "What ingredients do I need for carbonara?"
- Recipe → ingredient list → cart
- Meal planning assistance

**Product Focus:** Kitchen tools, ingredients, cookbooks

**Habit-Forming:** Weekly meal planning, "What should I cook tonight?"

**Development Time:** 3-5 days (after Jenna ships)

---

### Glow - Skincare AI (Feb 2026)

**Tagline:** "Science-backed skincare, voice-powered"

**Personality:** Knowledgeable, caring, evidence-based

**Use Cases:**
- "I have dry skin, what routine do I need?"
- Upload selfie: "What products suit my skin type?"
- Build personalized skincare routine

**Product Focus:** Skincare, beauty, wellness

**Habit-Forming:** AM/PM routine reminders, product restock alerts

**Development Time:** 3-5 days

---

### Fit - Fitness AI (Mar 2026)

**Tagline:** "Your gym buddy, minus the judgment"

**Personality:** Motivating, knowledgeable, supportive

**Use Cases:**
- "Training for a marathon, what gear do I need?"
- "Find protein powder for weight gain"
- Build your fitness arsenal

**Product Focus:** Gym equipment, supplements, athletic wear

**Habit-Forming:** Workout gear suggestions, supplement reminders

**Development Time:** 3-5 days

---

### Launch Strategy

**Bounty Consideration:**
- $10k max total per partner
- All-in on Jenna quality (aim for $6-8k of the $10k)
- Build others primarily for long-term revenue share
- Each additional mini = minimal effort (3-5 days)

**Revenue Share Play:**
- 4 minis = 4 different user bases
- More engagement opportunities
- Diversified portfolio
- Better long-term than optimizing for one-time bounty

---

## 💡 Feature Ideas (All Personalities)

### Phase 1: MVP (Week 1-2) - PRIORITY
**Core Voice Shopping Experience**

1. **Simple Voice Interface**
   - Status: 🔴 Not Started
   - Central mic button with clean UI
   - Tap to speak (no wake word for MVP)
   - Visual recording indicator
   - Conversation bubbles showing transcript

2. **Voice + Visual Product Results**
   - Status: 🔴 Not Started
   - User: "Find me red sneakers under $100"
   - AI voice response: "I found 47 red sneakers for you!"
   - Visual: Product cards with images, prices
   - Tap product → opens detail page
   - **This is what David Hoffman suggested!**

3. **Product Search Integration**
   - Status: 🔴 Not Started
   - Connect to `useProductSearch` hook
   - Natural language → structured filters
   - Example: "running shoes under $100" → `{ query: "running shoes", filters: { price: { max: 100 } } }`

4. **Basic Navigation**
   - Status: 🔴 Not Started
   - Product detail view
   - Back to search
   - Safe area handling (iOS/Android)

### Phase 2: Smart Actions (Week 2-3)

5. **Voice-Powered Cart Management** 🔥
   - Status: 🔴 Not Started
   - User: "Add those red Nike Air Max to my cart"
   - LLM extracts product via function calling
   - Frontend calls `useShopActions.addToCart()`
   - Voice confirmation: "Added to your cart!"
   - **KILLER FEATURE - hands-free shopping**

6. **Order Tracking**
   - Status: 🔴 Not Started
   - User: "Where's my order?"
   - Use `useOrders` hook (requires `orders` scope)
   - AI responds: "Your sneakers arrive tomorrow!"
   - Natural language order status

7. **Shopping List**
   - Status: 🔴 Not Started
   - "Add this to my wishlist"
   - "Show me my saved items"
   - Persistent across sessions

### Phase 3: Killer Features (Week 3-4)

8. **Photo Analysis for Outfit Suggestions** 🔥🔥
   - Status: 🔴 Not Started
   - User uploads selfie
   - Asks: "Will this dress look good on me?"
   - GPT-4o Vision analyzes:
     - Skin tone
     - Body type
     - Personal style
   - **POSITIVE FEEDBACK ONLY** (never insult users!)
   - Example: "Red would look amazing on you! The beige option would also complement your style."
   - Requires: `useCreateImageContent` hook, camera permission
   - **DIFFERENTIATOR - no other Mini will have this**

9. **Personalized Recommendations**
   - Status: 🔴 Not Started
   - Based on purchase history (`useOrders`)
   - Followed shops (`shops:follows:read` scope)
   - Past conversations (context memory)
   - "Based on your recent sneaker purchase..."

10. **Deal Alerts & Price Tracking**
    - Status: 🔴 Not Started
    - "Tell me when AirPods drop below $150"
    - Daily deals in user's favorite categories
    - Price drop notifications (if push notifs available)

### Phase 4: Advanced (If Time Allows)

11. **Wake Word Detection** ⚠️
    - Status: 🔴 Not Started - RESEARCH NEEDED
    - "Hey Klara" activation (like "Hey Siri")
    - Ignores background conversation
    - Only responds when wake word detected
    - **CONCERNS:**
      - Battery drain (always-on audio)
      - Privacy (always listening)
      - Shop Minis might not allow this
      - Requires Picovoice SDK or similar
    - **ACTION:** Ask Nicolas/David if this is feasible

12. **Multi-Language Support**
    - Status: 🔴 Not Started
    - Already have Hindi/Bengali from previous work
    - Could support multiple languages
    - Expands to international markets

---

## 🛠 Technical Stack

### Backend (100% Ready ✅)
- **Platform:** Supabase Edge Functions (Deno)
- **STT:** AssemblyAI (24kHz PCM) - $500/month reimbursed by Shopify
- **LLM:** GPT-4o-mini (was using Groq, upgrading for better quality)
- **TTS:** ElevenLabs Flash v2.5 - $500/month reimbursed by Shopify
- **WebSocket:** `chat-websocket/index.ts` (1507 lines, production-ready)
- **Features:** Lead extraction, sentiment analysis, usage tracking

**Backend Cost Estimate:**
- GPT-4o-mini: ~$50-100/month (for 10k queries)
- AssemblyAI: ~$100-150/month
- ElevenLabs: ~$50-100/month
- **Total:** ~$200-350/month
- **Shopify covers:** $500/month ✅

### Frontend (Need to Build 🔴)
- **Framework:** React (web tech, runs in Shop mobile app)
- **SDK:** `@shopify/shop-minis-platform-sdk`
- **UI Components:**
  - Can reuse from `/nlc-demo/` (voice orb)
  - Can reuse from `/core/` (React patterns)
  - Shop Minis SDK components (ProductCard, etc.)
- **State Management:** React hooks (keep it simple)
- **Styling:** Tailwind CSS (if allowed) or inline styles

### Shop Minis Hooks We'll Use
- ✅ `useProductSearch` - Search products
- ✅ `useShopActions` - Add to cart, favorites
- ✅ `useOrders` - Order tracking
- ⚠️ `useCreateImageContent` - Photo upload (for outfit analysis)
- ⚠️ `useGenerateUserToken` - Backend auth
- ✅ `useShare` - Share products

### Permissions Needed (manifest.json)
```json
{
  "permissions": ["MICROPHONE"],
  "scopes": [
    "openid",
    "orders",
    "products:recommendations:read",
    "shops:follows:read"
  ],
  "trusted_domains": [
    "btqccksigmohyjdxgrrj.supabase.co"
  ]
}
```

---

## 📚 SDK Analysis & Technical Findings

**Status:** ✅ **Complete** (Nov 15, 2025)
**Source:** Analyzed `shop-minis-examples` repository (5 example projects)

### Complete Hook Catalog (28 Hooks Available)

**User Data Hooks (11):**
- `useCurrentUser` - Get current Shop user profile
- `useBuyerAttributes` - User preferences, saved info
- `useOrders` - Order history
- `useBuyerIdentity` - Identity verification
- `useUserSettings` - App preferences
- `useCustomerProfile` - Detailed customer data
- `usePaymentMethods` - Saved payment info
- `useAddresses` - Saved shipping addresses
- `useEmailSubscription` - Marketing preferences
- `usePhoneNumber` - Contact info
- `useLocation` - User location (if permitted)

**Product & Shopping Hooks (6):**
- `useProductSearch` - **CRITICAL** - Search products across 500K+ merchants
- `usePopularProducts` - Trending items
- `useRecommendations` - Personalized product suggestions
- `useProductDetails` - Individual product data
- `useShopActions` - **CRITICAL** - Add to cart, favorites, etc.
- `useCollections` - Browse product collections

**Storage & State (2):**
- `useAsyncStorage` - Persistent key-value storage (preferences, cache)
- `useSecureStorage` - Encrypted storage (auth tokens, sensitive data)

**Navigation & UI (3):**
- `useShopNavigation` - Navigate within Shop app
- `useCloseMini` - Exit mini programmatically
- `useDeeplink` - Deep link to products/shops

**Utility Hooks (4):**
- `useImagePicker` - **CRITICAL** - Camera/gallery for photo upload
- `useGenerateUserToken` - **CRITICAL** - Get token for backend auth
- `useShare` - Native share sheet
- `useClipboard` - Copy to clipboard

**Permissions & Capabilities (2):**
- `usePermissions` - Request/check permissions
- `useFeatureFlags` - Feature availability checks

### Critical Discoveries

**1. MICROPHONE Permission Exists ✅**
```json
{
  "permissions": ["MICROPHONE", "CAMERA"]
}
```
- ✅ Voice input IS supported
- ❌ NO audio recording examples in repo (must implement custom)
- Must build custom `useVoiceRecording` hook using Web Audio API

**2. No Voice Recording Examples**
- All 5 examples are text/visual-based
- No examples of audio capture or WebSocket audio streaming
- **We'll be first voice-powered Mini** (huge differentiator!)
- Must implement:
  ```typescript
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream)
  // Process audio chunks → send to backend via WebSocket
  ```

**3. Authentication Pattern (from supabase example)**
```typescript
// Frontend (React)
const { token } = useGenerateUserToken()

// Send to backend
const response = await fetch('https://your-supabase.co/functions/auth', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Backend (Supabase Edge Function)
const shopifyToken = req.headers.get('Authorization')
// Verify with Shopify Admin API
const user = await verifyShopifyToken(shopifyToken)
// Generate JWT for your backend
const jwt = await createJWT(user)
// Store in useSecureStorage()
```

**4. Product Search Pattern (from with-search example)**
```typescript
// Debounced search (200ms delay)
const [debouncedQuery, setDebouncedQuery] = useState('')
useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200)
  return () => clearTimeout(timer)
}, [searchQuery])

// Infinite scroll
const { products, loading, hasNextPage, fetchMore } = useProductSearch({
  query: debouncedQuery,
  filters: { category: 'fashion', price: { max: 100 } },
  first: 20
})

// Accumulate products (prevent duplicates)
const existingIds = new Set(prev.map(p => p.id))
const newProducts = products.filter(p => !existingIds.has(p.id))
```

**5. Performance Requirements**
- Load time: <3 seconds (from SDK docs)
- Bundle size: <5MB
- No blocking operations on main thread
- Smooth 60fps animations

**6. Manifest Structure**
```json
{
  "name": "Jenna",
  "short_name": "Jenna",
  "description": "Your personal fashion AI stylist",
  "version": "1.0.0",
  "icon": "https://your-cdn.com/jenna-icon.png",
  "permissions": ["MICROPHONE", "CAMERA"],
  "scopes": [
    "openid",
    "profile",
    "user_settings:read",
    "orders",
    "products:recommendations:read",
    "product_list:read",
    "product_list:write"
  ],
  "trusted_domains": ["btqccksigmohyjdxgrrj.supabase.co"],
  "entry_point": "index.html"
}
```

### Implementation Blueprint

**Base Template:** Use `with-search` example as starting point
- Already has product search UI
- Debounced search implemented
- Infinite scroll working
- Filter system ready

**Required Additions:**
1. **Custom Voice Recording Hook** (no examples exist)
   - Web Audio API integration
   - PCM encoding
   - WebSocket streaming to backend

2. **Voice UI Components**
   - Waveform animation (copy from `/nlc-demo/`)
   - Recording indicator
   - Voice message bubbles

3. **Backend Integration**
   - Connect to existing `chat-websocket` function
   - Use `useGenerateUserToken` for auth
   - Store JWT in `useSecureStorage`

4. **Photo Analysis**
   - Use `useImagePicker` for camera/upload
   - Send to GPT-4o Vision API
   - Positive-only feedback system

### Gaps & Unknowns (Need to Ask Shopify Team)

**Questions for Nicolas/David in closed beta community:**

1. **Voice/Audio:**
   - Are there any existing voice-powered Minis? (None in examples)
   - Any best practices for audio recording in Minis?
   - WebSocket connections allowed from Mini → external backend?
   - Max WebSocket connection duration? (Our calls can be 5-10 min)

2. **Wake Word Detection:**
   - Is always-on audio listening permitted? (Battery/privacy concerns)
   - Any restrictions on using SDKs like Picovoice?

3. **Performance:**
   - How is bundle size measured? (Does it include audio chunks?)
   - Any throttling on external API calls? (We call AssemblyAI, GPT-4, ElevenLabs)

4. **Multiple Minis:**
   - Confirmed: $10k max per partner (not per mini)
   - How is quality assessed if submitting 2-4 minis?
   - Is bounty split evenly or based on quality/engagement?

5. **Revenue Share:**
   - How is engagement calculated? (Session duration? DAU? Purchases?)
   - Separate metrics per mini or combined?

6. **Permissions:**
   - MICROPHONE permission - any usage restrictions?
   - CAMERA permission - can we use for outfit analysis?

---

## ✅ What We Already Have

### 1. Complete Voice AI Backend ✅
**File:** `/core/supabase/functions/chat-websocket/index.ts` (1507 lines)

**What it does:**
- Accepts WebSocket connections
- Receives PCM audio chunks
- Sends to AssemblyAI for STT
- Processes with LLM (currently Groq, upgrading to GPT-4o-mini)
- Generates TTS with ElevenLabs
- Streams audio back to client
- Handles conversation context
- Tracks usage/minutes
- Lead extraction
- Sentiment analysis

**Integration:**
- Zero changes needed to core logic
- Just add product search function calling
- Add cart management actions
- Already supports token-based auth (can adapt for Shop tokens)

### 2. Voice UI Components ✅
**Location:** `/nlc-demo/src/components/VoiceInterface.tsx`

**What we can reuse:**
- Voice orb animation (pulse while recording)
- Mic button states (idle/recording/processing)
- Audio waveform visualization
- Clean mobile-first design

### 3. React Infrastructure ✅
**Location:** `/core/src/`

**What we can reuse:**
- React 18 patterns
- TanStack Query for state
- Custom hooks patterns
- WebSocket connection management (`hooks/useVoiceAI.ts`)
- Audio utilities
- Component architecture

### 4. Multi-Language Support ✅
**Languages ready:**
- English ✅
- Hindi ✅
- Bengali ✅
- Could add more if needed

### 5. Shopify Integration Knowledge ✅
**Location:** `/klariqo-voice-ai/` and `/shopify/`

**What we learned:**
- Shopify app structure
- Product data handling
- Multi-tenant architecture
- Function calling for commerce

---

## 🏗 What We Need to Build

### Frontend Components (React)

```
/shop-mini-voice-assistant/
  /src/
    /components/
      - VoiceChat.tsx          [Main interface - mic button, messages]
      - VoiceOrb.tsx           [Animated recording indicator - copy from NLC demo]
      - MessageBubble.tsx      [User/AI conversation bubbles]
      - ProductGrid.tsx        [Product cards from search results]
      - ProductCard.tsx        [Individual product with image/price/CTA]
      - PhotoUpload.tsx        [Camera/upload for outfit analysis]
      - CartButton.tsx         [Floating cart with item count]
      - LoadingState.tsx       [While processing]

    /hooks/
      - useVoiceConnection.ts  [WebSocket to chat-websocket backend]
      - useAudioRecorder.ts    [Browser audio → PCM → base64]
      - useAudioPlayer.ts      [Play TTS responses]
      - useProductSearch.ts    [Wrap Shop's useProductSearch]
      - useShopifyActions.ts   [Cart, favorites, etc.]

    /utils/
      - audioUtils.ts          [PCM encoding, format conversion]
      - shopApi.ts             [Shop SDK helpers]
      - productParser.ts       [Parse LLM product recommendations]

    /screens/
      - HomeScreen.tsx         [Main voice interface]
      - ProductDetailScreen.tsx [When user taps product]
      - SettingsScreen.tsx     [Voice settings, language, etc.]

  manifest.json              [Permissions, scopes, entry points]
  package.json
  README.md
```

### Backend Modifications (Minor)

**File:** `/core/supabase/functions/chat-websocket/index.ts`

**Changes needed:**
1. Add GPT-4o-mini support (upgrade from Groq)
2. Add function calling for:
   - Product search intent extraction
   - Add to cart actions
   - Order tracking queries
3. Add response formatting for product results
4. Add GPT-4o Vision support for photo analysis

**Estimated work:** 2-3 hours of modifications

---

## 📅 Timeline & Milestones

### Overview: 36 Days (Nov 14 - Dec 20)

**Key Deadlines:**
- ⏰ **Dec 5:** Submit for featured placement + $10k
- ⏰ **Dec 20:** Final deadline for $10k (no featuring)

**Our Target:** Dec 5 (21 days) for maximum impact! 🎯

---

### Week 1: Nov 14-20 (Research & MVP Build)

**Nov 14-15 (Days 1-2): Research & Setup** 🟡 IN PROGRESS
- [x] Research Shop Minis SDK docs
- [x] Read incentive/AI reimbursement PDFs
- [x] Create project plan
- [ ] Install Shop app to explore Minis (BLOCKED - not available in India?)
- [ ] Clone `shop-minis-examples` repo
- [ ] Run `all-hooks` example
- [ ] Run `supabase` example
- [ ] Study manifest.json structure
- [ ] Schedule kick-off call with Nicolas

**Nov 16-17 (Days 3-4): Scaffold Project**
- [ ] `npm init @shopify/shop-mini@latest`
- [ ] Set up project structure
- [ ] Configure manifest.json (permissions, scopes)
- [ ] Test basic "Hello World" on iOS simulator
- [ ] Confirm MICROPHONE permission works

**Nov 18-20 (Days 5-7): Build MVP Core**
- [ ] Voice orb component (copy from NLC demo)
- [ ] Mic button + recording state
- [ ] WebSocket connection to chat-websocket backend
- [ ] Audio recording → base64 → send to backend
- [ ] Receive audio response → play
- [ ] Display conversation bubbles

**Milestone 1:** 🎯 Voice chat working end-to-end

---

### Week 2: Nov 21-27 (Product Integration)

**Nov 21-22 (Days 8-9): Product Search**
- [ ] Integrate `useProductSearch` hook
- [ ] LLM function calling: extract search intent
- [ ] Parse: "red sneakers under $100" → `{ query, filters }`
- [ ] Display ProductCard grid
- [ ] Tap product → navigate to detail

**Nov 23-24 (Days 10-11): Voice + Visual Flow**
- [ ] Voice response + product cards together
- [ ] "I found 47 red sneakers!" [shows grid]
- [ ] Smooth animations
- [ ] Loading states
- [ ] Error handling

**Nov 25-27 (Days 12-14): Smart Cart Actions**
- [ ] "Add to cart" voice command
- [ ] LLM extracts product from context
- [ ] Call `useShopActions.addToCart()`
- [ ] Voice confirmation
- [ ] Visual cart update
- [ ] Test checkout flow

**Milestone 2:** 🎯 Full voice shopping flow working (search → browse → add to cart)

---

### Week 3: Nov 28 - Dec 4 (Killer Features)

**Nov 28-29 (Days 15-16): Order Tracking**
- [ ] Integrate `useOrders` hook
- [ ] "Where's my order?" detection
- [ ] Parse order data → natural response
- [ ] Voice + visual order status

**Nov 30 - Dec 1 (Days 17-18): Photo Analysis** 🔥
- [ ] Camera permission in manifest
- [ ] `useCreateImageContent` integration
- [ ] Photo upload UI
- [ ] GPT-4o Vision analysis
- [ ] Positive-only feedback system
- [ ] Voice + text outfit advice

**Dec 2-4 (Days 19-21): Personalization**
- [ ] Purchase history integration
- [ ] Followed shops data
- [ ] Context-aware recommendations
- [ ] "Based on your style..." responses

**Milestone 3:** 🎯 All major features complete, ready for polish

---

### Week 4: Dec 5-11 (Polish & Submit)

**Dec 5-6 (Days 22-23): Performance**
- [ ] Bundle size optimization (<5MB requirement)
- [ ] Load time optimization (<3s requirement)
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Audio compression

**Dec 7-8 (Days 24-25): Testing**
- [ ] iOS testing (simulator + real device)
- [ ] Android testing (simulator + real device)
- [ ] Edge cases (no internet, permissions denied)
- [ ] Safe area handling
- [ ] Different screen sizes

**Dec 9 (Day 26): Accessibility & Polish**
- [ ] Screen reader support
- [ ] Color contrast check
- [ ] Large tap targets
- [ ] Keyboard navigation
- [ ] Alt text for images

**Dec 10 (Day 27): Documentation**
- [ ] Privacy policy (required in manifest)
- [ ] README for Shopify review
- [ ] Demo video (screen recording)
- [ ] Feature list

**Dec 11 (Day 28): SUBMIT** 🚀
- [ ] Final testing
- [ ] Submit via Minis CLI
- [ ] Post update in community forum
- [ ] Wait for review (5-day turnaround)

**Milestone 4:** 🎯 SUBMITTED FOR FEATURED PLACEMENT

---

### Buffer Week: Dec 12-20 (Review & Iteration)

**Dec 12-16 (Days 29-33): Address Review Feedback**
- [ ] Respond to Shopify feedback
- [ ] Fix any bugs/issues
- [ ] Resubmit if needed

**Dec 17-20 (Days 34-36): Final Buffer**
- [ ] Emergency fixes
- [ ] Last-minute polish
- [ ] Prepare for launch

**Milestone 5:** 🎯 APPROVED & LIVE

---

## ❓ Open Questions

### For Nicolas/David (Ask in Kick-Off Call)

**Technical:**
1. ⚠️ **Wake word detection** - Is always-on audio/WebSocket allowed? Battery/privacy concerns?
2. ⚠️ **Audio format** - Confirmed PCM works? Sample rate? (Assuming 16-24kHz like web)
3. ⚠️ **Background audio** - Can audio continue when Mini is backgrounded?
4. ⚠️ **Bundle size** - Any tips for staying under 5MB with voice AI?
5. ⚠️ **Load time** - How is <3s measured? First paint? Interactive?

**Features:**
6. ⚠️ **Photo analysis** - Any concerns with GPT-4 Vision for outfit suggestions?
7. ⚠️ **Personalization** - Best practices for `products:recommendations:read` scope?
8. ⚠️ **Push notifications** - ETA for push notifs? (For price alerts, order updates)

**Process:**
9. ⚠️ **Review timeline** - 5 days typical? What causes delays?
10. ⚠️ **Iteration** - Can we deploy updates after approval?
11. ⚠️ **Featured placement** - What makes a Mini get featured?

**Personality Strategy:**
12. ⚠️ **Multiple Minis vs One** - Better to submit separate personality Minis or one with multiple modes?
13. ⚠️ **Revenue share calculation** - Per Mini or per partner? How does engagement-based work?
14. ⚠️ **Bounty split** - If submitting multiple Minis, how is $10k allocated? Quality-based?
15. ⚠️ **Multiple entry points** - Can one Mini have different entry points/branding per category?

### Research Needed

**Shop App Access:** ✅ RESOLVED
- [x] Shop app working (was internet issue)
- [x] Explored existing Minis
- **Finding:** Only 8 Minis live currently!
  - Virtual try-ons
  - Recipe tracker (find dishes → shop ingredients)
  - Very early stage, lots of opportunity
- **Insight:** Specialized Minis (not generic) are the pattern

**Examples to Study:**
- [x] Clone `shop-minis-examples` repo ✅
- [ ] Study `all-hooks` - see every hook in action
- [ ] Study `supabase` - our exact backend pattern
- [ ] Study `with-search` - product search patterns

**Technical Validation:**
- [ ] Test MICROPHONE permission on simulator
- [ ] Test WebSocket connection from Mini → Supabase
- [ ] Test audio recording formats
- [ ] Test GPT-4o-mini API from Supabase edge function

---

## 📊 Progress Tracking

### Overall Status: 🟡 5% Complete

**Completed:**
- [x] Research Shop Minis docs
- [x] Analyze Klariqo existing codebase
- [x] Read incentive PDFs
- [x] Create project plan
- [x] Define feature set
- [x] Choose tech stack

**In Progress:**
- [ ] 🟡 Install Shop app (blocked - India issue)
- [ ] 🟡 Schedule Nicolas kick-off call
- [ ] 🟡 Clone examples repo

**Blocked:**
- ⚠️ Shop app not available in India - need workaround

**Next Up:**
1. Clone shop-minis-examples repo
2. Run examples locally
3. Schedule call with Nicolas
4. Scaffold new Shop Mini project

---

### Phase Breakdown

| Phase | Status | Progress | ETA |
|-------|--------|----------|-----|
| Research & Planning | 🟡 In Progress | 40% | Nov 15 |
| MVP Build | 🔴 Not Started | 0% | Nov 20 |
| Product Integration | 🔴 Not Started | 0% | Nov 27 |
| Killer Features | 🔴 Not Started | 0% | Dec 4 |
| Polish & Submit | 🔴 Not Started | 0% | Dec 11 |

---

## 📚 Resources

### Documentation
- **Main docs:** https://shopify.dev/docs/api/shop-minis
- **Design guidelines:** https://shopify.dev/docs/api/shop-minis/design
- **Custom backend:** https://shopify.dev/docs/api/shop-minis/custom-backend
- **Guidelines:** https://shopify.dev/docs/api/shop-minis/guidelines
- **Community forum:** https://community.shopify.dev/c/shop-minis
- **Your private thread:** https://community.shopify.dev/t/klariqo-ai-voice-assistant-shop-mini/25648

### GitHub
- **Examples repo:** https://github.com/Shopify/shop-minis-examples
- **UI Extensions:** https://github.com/Shopify/shop-minis-ui-extensions

### Contacts
- **Nicolas Chavanes** - nicolas.chavanes@shopify.com (Partnerships Lead)
- **David Hoffman** - @davidhoffman-shopify (Product Lead for Shop)
- **Support:** shopminisdevelopers@shopify.com
- **Kick-off call:** https://calendar.app.google/Mes8LDEGNZZpMVUx8

### Our Files
- **Research doc:** `/opt/klariqo/voice-aiv2/SHOPIFY_SHOP_MINIS_RESEARCH.md`
- **This plan:** `/opt/klariqo/voice-aiv2/SHOP_MINI_PROJECT_PLAN.md`
- **Email threads:** `/opt/klariqo/voice-aiv2/shopify_email.txt` & `shopify_email2.txt`
- **Incentive PDFs:** `/opt/klariqo/voice-aiv2/Shop Minis Early Access_*.pdf`

### Existing Codebase to Reference
- **Backend:** `/opt/klariqo/voice-aiv2/core/supabase/functions/chat-websocket/`
- **Voice UI:** `/opt/klariqo/voice-aiv2/nlc-demo/src/components/VoiceInterface.tsx`
- **React patterns:** `/opt/klariqo/voice-aiv2/core/src/`
- **Shopify app:** `/opt/klariqo/voice-aiv2/klariqo-voice-ai/`

---

## 🎯 Success Criteria

### Minimum Viable Product (Must Have)
- ✅ Voice input works reliably
- ✅ Product search from natural language
- ✅ Visual product cards display
- ✅ Basic add to cart functionality
- ✅ <3s load time
- ✅ <5MB bundle size
- ✅ Works on iOS + Android
- ✅ No critical bugs

### Featured Placement (Should Have)
- ✅ Voice + visual hybrid (as David suggested)
- ✅ Smart voice commands (add to cart)
- ✅ Order tracking
- ✅ Smooth animations
- ✅ Professional design
- ✅ Fast performance
- ✅ Accessibility support

### Wow Factor (Nice to Have)
- 🔥 Photo analysis for outfit suggestions
- 🔥 Personalized recommendations
- 🔥 Natural conversation flow
- 🔥 Multi-language support
- ⚠️ Wake word detection (if allowed)

---

## 💰 Financials

### Guaranteed Income (If We Ship)
- **Bounty:** $5,000 - $10,000 (quality-based)
- **AI Reimbursement:** $3,000 ($500/month × 6 months)
- **Total Potential:** $8,000 - $13,000

### Operating Costs (Covered by Shopify)
- **GPT-4o-mini:** ~$50-100/month
- **AssemblyAI:** ~$100-150/month
- **ElevenLabs:** ~$50-100/month
- **Total:** ~$200-350/month
- **Reimbursed:** $500/month ✅

**Net Profit:** $8k-13k for 4 weeks of work + $150/month AI subsidy

### Long-Term Revenue (TBD)
- **Engagement-based revenue share** starting mid-2026
- Details not yet announced
- Based on user engagement (not GMV)

---

## 🚀 Let's Build This!

**Next Immediate Actions:**
1. ⏭ Clone shop-minis-examples repo
2. ⏭ Schedule kick-off call with Nicolas
3. ⏭ Find workaround for Shop app (VPN? YouTube demos?)
4. ⏭ Run example Minis locally

**This Week's Goal:**
Get a "Hello World" Shop Mini running on iOS simulator with mic permission working.

**This Month's Goal:**
Submit by Dec 5 for featured placement + $10k bounty!

---

*Last Updated: Nov 14, 2025 - 1:00 PM IST*
*Status: Planning Phase*
*Next Review: Nov 15, 2025*
