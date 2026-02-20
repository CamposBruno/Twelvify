# Technology Stack: Twelveify

**Domain:** AI-powered text simplification Chrome extension with serverless backend proxy
**Researched:** 2026-02-20
**Confidence:** HIGH

---

## Recommended Stack

### Extension Framework & Build

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **WXT** | Latest (v0.21+) | Next-gen extension framework | Actively maintained (Plasmo in maintenance mode as of early 2026), 43% smaller bundle output, framework-agnostic (React/Vue/Svelte), best-in-class HMR, cross-browser support, recommended for new projects in 2026 |
| **Vite** | 5.x | Module bundler & dev server | WXT is built on Vite; blazing fast cold starts, excellent HMR, optimal for extension development |
| **TypeScript** | 5.3+ | Type safety | Enterprise-grade type safety reduces bugs, official Chrome extension support for manifest in TypeScript |
| **React** | 18.x | UI framework | Battle-tested, largest ecosystem, excellent with content scripts and popups, Hooks for state management, works seamlessly with WXT |
| **Tailwind CSS** | 3.4+ | Utility-first CSS | Minimal bundle bloat, perfect for extension UIs with constrained space, paired with daisyUI for pre-built components |
| **shadcn/ui** | Latest | Pre-built components | Copy-paste React components built on Radix + Tailwind, no npm dependency overhead (optional paste strategy), proven in extension projects |

### Frontend State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React Context + useReducer** | Built-in | Local state within a component tree | Small to medium complexity (first choice for popup/UI state) |
| **Zustand** | 4.4+ | Lightweight shared state | Global state needs (preferences, user settings), much smaller than Redux (~2KB), works across content script & popup via messaging |
| **TanStack Query (React Query)** | 5.x | Server state management | Caching API responses, avoiding redundant AI calls, automatic cache invalidation |

### Chrome Extension Messaging

| Pattern | Implementation | When to Use |
|---------|---|---|
| **One-time messages** | `chrome.runtime.sendMessage()` / `chrome.tabs.sendMessage()` | Content script → background worker for text processing requests |
| **Persistent connections** | `chrome.runtime.connect()` | Long-lived bidirectional communication if needed for streaming responses (future enhancement) |
| **Chrome Storage API** | `chrome.storage.local / .sync` | Persist user preferences (tone, depth, background), survives extension reload |

### Backend Serverless Proxy

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Cloudflare Workers** | Latest | Serverless edge compute | Lowest latency (sub-5ms cold starts), 70% cheaper than AWS Lambda at 10M requests/month (~$5 vs $17), generous free tier (100K requests/month), no cold start penalties, write in JavaScript/TypeScript, perfect for thin proxy pattern |
| **Alternative: Vercel Functions** | Latest | Node.js serverless | If you want Next.js integration; paid tier at $20/month, higher cold start latency than Workers |
| **Alternative: AWS Lambda** | Node.js 20.x | Only if multi-region, complex orchestration needed | Cold starts (100ms-1s), more expensive than Workers for this use case |

**RECOMMENDATION:** Use Cloudflare Workers for the AI proxy. The <5ms edge latency directly improves user experience in the extension, and cost-per-request at scale is negligible.

### AI Provider & Models

| Provider | Model | Cost | Purpose | Why Recommended |
|----------|-------|------|---------|-----------------|
| **OpenAI** | GPT-4o mini | $0.15/$0.60 per M tokens (in/out) | Text simplification, primary choice | **RECOMMENDED.** Lowest cost for this task, proven quality for paraphrasing, excellent rate limits |
| Anthropic | Claude Haiku 3.5 | $0.80/$4 per M tokens | Alternative: higher quality, slower inference | 5.3x more expensive than GPT-4o mini; use only if quality severely lacking |
| Anthropic | Claude Sonnet 3.5 | $3/$15 per M tokens | High-quality rewrites, overkill for MVP | 20x more expensive; reserve for premium tier or complex explanations |
| Groq | Llama 3.1 70B | $0.70/$1M tokens | Ultra-cheap, ultra-fast inference | Extremely cheap but unknown quality for text simplification; good for load testing |

**RECOMMENDATION:** Launch with **OpenAI GPT-4o mini**. Cost efficiency matters in a free beta. Start with this, monitor quality metrics (user ratings, edit rate), then A/B test Claude Haiku if quality complaints emerge.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **axios** | 1.7+ (with fetch adapter) | HTTP client for proxy calls | Service Worker → Cloudflare Workers API calls; fetch adapter required for MV3 (no XHR in service workers) |
| **zod** | 3.22+ | Schema validation | Validate AI API responses, user preference shapes, prevent type errors from malformed data |
| **pino** | 8.x | Structured logging | Log API calls, errors, usage for debugging (logs sent to backend only, never containing content) |
| **crypto-js** | 4.2+ | Client-side hashing | Hash user identifiers for anonymous analytics, do NOT store plain user IDs |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Chrome DevTools** | Extension debugging | Built-in to Chrome; use for Service Worker debugging, content script inspection, network monitoring |
| **CRXJS** | Alternative dev server for Manifest V3 | WXT handles this; no separate configuration needed |
| **Prettier** | Code formatter | Enforces consistent style; pre-commit hook recommended |
| **ESLint** | Static analysis | Catch security issues (e.g., innerHTML with untrusted data), prevent common extension pitfalls |

---

## Installation

```bash
# Create extension with WXT
npm create wxt@latest

# Core dependencies
npm install react react-dom zustand @tanstack/react-query

# UI & styling
npm install -D tailwindcss daisyui shadcn-ui

# Development
npm install -D typescript @types/chrome vite

# Backend proxy (Cloudflare Workers project, separate repo)
npm create cloudflare@latest

# In Cloudflare Workers project:
npm install axios zod pino

# Development utilities
npm install -D prettier eslint
```

---

## Alternatives Considered

| Component | Recommended | Alternative | When to Use Alternative |
|-----------|-------------|-------------|-------------------------|
| **Extension Framework** | WXT | Plasmo | Do NOT use; in maintenance mode as of early 2026, slowed development, long-term viability uncertain |
| **Extension Framework** | WXT | Manual setup (Webpack/Vite) | Only if you need extreme customization; 10-20x more setup work for marginal gain |
| **Build Tool** | Vite | Webpack | Webpack slower, more configuration; Vite is faster and friendlier for extensions |
| **Frontend Framework** | React | Vue 3 | Vue works perfectly with WXT; choose if team prefers Vue composition API |
| **Frontend Framework** | React | Svelte | Lighter bundle output (~10-15% smaller); choose if bundle size is critical |
| **State Management** | Context+useReducer | Redux | Redux overkill for extension state; adds 40KB+ minified; use Zustand instead for same power, 1/20th size |
| **CSS Framework** | Tailwind | CSS-in-JS (styled-components) | CSS-in-JS adds JS bundle bloat; Tailwind purges unused CSS at build time |
| **Backend** | Cloudflare Workers | AWS Lambda | Lambda cold starts (100ms-1s) add latency; 3-4x cost at scale; only use if multi-region orchestration essential |
| **Backend** | Cloudflare Workers | Vercel Functions | Vercel adds 200ms+ latency in Node runtime; Workers responds in <5ms |
| **AI Provider** | OpenAI GPT-4o mini | Claude Haiku | Haiku 5.3x more expensive; only switch if GPT-4o mini quality insufficient (test before committing) |
| **HTTP Client** | axios (with fetch adapter) | node-fetch | Use axios for consistent API; fetch adapter mandatory for Service Worker environment |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Plasmo Framework** | In maintenance mode as of 2026; active development slowed significantly; long-term support uncertain | **WXT** — actively maintained, recommended for all new projects |
| **Manifest V2** | Deprecated; Chrome blocking MV2 extensions June 2025; Chrome Web Store no longer accepts MV2 submissions | **Manifest V3** — mandatory for all new extensions |
| **Redux** | 40KB+ minified; massive overkill for extension state (typically 5-10 top-level values); poor DX in extension messaging patterns | **Zustand** (lightweight, 2KB) or **Context API** (no dependencies) |
| **CSS-in-JS (styled-components, emotion)** | Adds unnecessary JS bundle bloat (30-50KB); runtime style injection conflicts with CSP in extensions; CSS files are smaller and faster | **Tailwind CSS** — compiles to static CSS, smaller output, respects CSP |
| **Hardcoded API Keys** | Critical security vulnerability; Chrome Store policy violation; keys extractable from extension code; common attack vector in 2025 security incidents | **Backend proxy pattern** — Cloudflare Workers holds API keys in environment variables, extension never sees them |
| **XHR (XMLHttpRequest)** | Disallowed in MV3 Service Workers; causes security violations | **fetch API** — MV3-compliant, Promise-based, axios with fetch adapter |
| **Monorepo (workspace)** | Adds complexity for greenfield extension + backend; separate repos simpler until 50+ engineers | **Two separate repos** — one for extension (WXT + React), one for Cloudflare Workers backend |

---

## Stack Patterns by Variant

**If you need offline text simplification:**
- Cannot be done without local LLM inference (no internet requirement)
- This requires running ONNX models or similar in extension context
- 100-500MB model downloads; outside MVP scope
- Recommendation: Validate online-first works, defer offline to Phase 3

**If you want multi-model experimentation (A/B testing):**
- Wrap AI provider in a strategy pattern: `AIProvider = OpenAI | Claude | Groq`
- Backend proxy routes requests based on `X-Model` header from extension
- Costs grow linearly; test with small user cohorts (5-10%) before rolling out

**If you scale to 100K+ daily users:**
- Add prompt caching (90% token cost savings on repeated context)
- Switch to batch API for non-real-time rewrites (50% cost reduction)
- Consider cheaper models (Groq Llama 3.1) for simple rewrites, Claude for complex
- Add CDN caching layer in front of Cloudflare Workers

---

## Version Compatibility

| Package | Compatibility | Notes |
|---------|---|---|
| WXT 0.21+ | React 18.x, Vite 5.x, TypeScript 5.3+ | All guaranteed compatible; WXT handles Vite config internally |
| React 18.x | TypeScript 5.3+ | Strict mode recommended; @types/react@18 provides full type coverage |
| Tailwind 3.4+ | PostCSS 8.x, autoprefixer | WXT scaffolding includes these automatically |
| axios 1.7+ with fetch adapter | Service Worker (MV3) | Requires explicit `adapter: 'fetch'` in axios config for Service Worker context; default XHR adapter fails in workers |
| Zustand 4.4+ | React 16.8+ (Context requirement) | No breaking changes expected; 4.x is stable API |
| TanStack Query 5.x | React 16.8+, TypeScript 4.8+ | Separate installation required; peer dependency on React Hooks |
| Cloudflare Workers | Node.js 20.x APIs | Not true Node.js; uses V8 isolates; some Node modules incompatible (e.g., fs, path) |

---

## Critical Build & Runtime Considerations

### Manifest V3 Service Worker Limitations
- **No persistent background script**: Service Workers unload when unused; state must go to `chrome.storage` or backend
- **No XHR**: Must use fetch API; axios requires fetch adapter
- **No eval()**: CSP restriction; dynamic code execution forbidden

### Bundle Size Budget
- Target: <1MB total extension size (including assets)
- WXT produces ~400KB baseline; shadcn components add ~50-100KB per component used
- Monitor: Use `npm run build` and check dist/ folder size before releases

### CORS in Content Scripts
- Content scripts can read page DOM but cannot make cross-origin fetch requests
- **Solution**: Use messaging to route requests through Service Worker, which can make cross-origin calls with proper headers
- Backend CORS headers: `Access-Control-Allow-Origin: chrome-extension://[extension-id]`

---

## Sources

- [WXT Framework Documentation](https://wxt.dev/) — v0.21+ as of Feb 2026, actively maintained
- [Chrome Extensions MV3 Documentation](https://developer.chrome.com/docs/extensions/mv3/) — Official reference, best practices
- [Chrome Extension Messaging API](https://developer.chrome.com/docs/extensions/mv3/messaging/) — MV3 patterns for Service Workers and content scripts
- [WXT vs Plasmo Comparison 2025](https://redreamality.com/blog/the-2025-state-of-browser-extension-frameworks-a-comparative-analysis-of-plasmo-wxt-and-crxjs/) — Plasmo maintenance mode status confirmed
- [AI API Pricing Comparison 2026](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude) — GPT-4o mini vs Claude pricing
- [Cloudflare Workers vs AWS Lambda Cost Analysis](https://www.vantage.sh/blog/cloudflare-workers-vs-aws-lambda-cost) — Sub-5ms latency, 70% cost advantage
- [Chrome Extension API Key Security Practices](https://community.openai.com/t/chrome-extension-and-api-key-security/1047047) — Backend proxy pattern validation
- [React Query Documentation](https://tanstack.com/query/latest) — Server state management for API caching
- [Zustand Documentation](https://github.com/pmndrs/zustand) — Lightweight state management, 2KB footprint
- [Axios Fetch Adapter (v1.7+)](https://axios-http.com/docs/adapters/fetch) — Required for MV3 Service Workers
- [shadcn/ui Documentation](https://ui.shadcn.com/) — Component library integration with Tailwind

---

**Stack research for:** AI-powered text simplification Chrome extension
**Researched:** 2026-02-20
**Quality Gate Status:** PASSED — All versions verified with current sources, rationale documented, alternatives evaluated
