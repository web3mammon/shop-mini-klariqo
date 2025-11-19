# Shop Mini - Klariqo Voice Shopping Assistant

All Shop Minis related files, code, and documentation.

## 📁 Folder Structure

```
shop-mini/
├── docs/                          # Documentation & planning
│   ├── SHOP_MINI_PROJECT_PLAN.md  # Master project plan (living doc)
│   ├── SHOPIFY_SHOP_MINIS_RESEARCH.md  # Technical research
│   ├── shopify-mini-details.md     # Initial email from Nicolas
│   ├── shopify_email.txt           # Email thread 1
│   ├── shopify_email2.txt          # Email thread 2
│   └── Shop Minis Early Access_*.pdf  # Incentive & AI reimbursement docs
│
├── examples/                      # Shopify official examples (cloned)
│   └── shop-minis-examples/
│       ├── all-hooks/             # See ALL available hooks ⭐
│       ├── supabase/              # Supabase backend example ⭐⭐
│       ├── with-search/           # Product search example
│       ├── kitchen-sink/          # Comprehensive features
│       └── user-data/             # User data handling
│
├── code/                          # Our Shop Mini codebase (to be created)
│   └── klariqo-voice-assistant/   # Main Shop Mini project
│       ├── src/                   # React components
│       ├── manifest.json          # Permissions & scopes
│       └── package.json
│
└── README.md                      # This file
```

## 🎯 Quick Start

### Study Examples First
```bash
cd examples/shop-minis-examples/all-hooks
cat README.md
npm install
npx shop-minis dev
```

### Create Our Project (When Ready)
```bash
cd code/
npm init @shopify/shop-mini@latest
# Follow prompts
```

## 🔗 Important Links

**Shopify Resources:**
- Docs: https://shopify.dev/docs/api/shop-minis
- Community: https://community.shopify.dev/c/shop-minis
- Our Thread: https://community.shopify.dev/t/klariqo-ai-voice-assistant-shop-mini/25648

**Contacts:**
- Nicolas Chavanes: nicolas.chavanes@shopify.com
- David Hoffman: @davidhoffman-shopify
- Support: shopminisdevelopers@shopify.com
- Kick-off Call: https://calendar.app.google/Mes8LDEGNZZpMVUx8

## 📅 Timeline

**Target:** Dec 5, 2025 (21 days) for featured placement + $10k
**Final Deadline:** Dec 20, 2025

See `docs/SHOP_MINI_PROJECT_PLAN.md` for detailed timeline.

## 💰 Incentives

- **Bounty:** $5-10k (quality-based)
- **AI Costs:** $500/month reimbursement (6 months = $3k)
- **Total:** $8-13k guaranteed

## 🛠 Tech Stack

**Frontend:** React (Shop Minis SDK)
**Backend:** Supabase Edge Functions (reuse existing `chat-websocket`)
**STT:** AssemblyAI
**LLM:** GPT-4o-mini (upgraded from Groq)
**TTS:** ElevenLabs

## 📝 Current Status

🟡 **Research Phase** (5% complete)

**Completed:**
- [x] Clone examples repo
- [x] Organize project structure
- [x] Research complete

**Next:**
- [ ] Study `all-hooks` example
- [ ] Study `supabase` example
- [ ] Schedule Nicolas call
- [ ] Scaffold new project

---

*Last Updated: Nov 15, 2025*
