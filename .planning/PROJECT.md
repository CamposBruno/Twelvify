# Twelveify

## What This Is

A Chrome extension that rewrites complex or technical text into clear, plain language tailored to each user's preferences. Users highlight text on any webpage, click a floating icon, and the selected text is replaced with a simplified version — personalized by tone, depth, and the user's background so explanations feel natural and relatable. Shipped as v1.0 MVP with streaming AI backend, progressive onboarding, and full user controls. Landing page live at twelvify.com with interactive AI playground demo.

## Core Value

When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## Requirements

### Validated

- ✓ Text simplification via AI when user highlights and clicks — v1.0
- ✓ Replace-in-page as default display mode (popup configurable) — v1.0
- ✓ Progressive onboarding — ask preferences gradually over first few uses — v1.0
- ✓ Personalization based on tone and explanation depth — v1.0
- ✓ Profession/interest-based analogies — v1.0
- ✓ Backend proxy server for AI calls (user never manages API keys) — v1.0
- ✓ Privacy-first: no content stored server-side, anonymous usage analytics only — v1.0
- ✓ Rate limiting on backend (usage counts, no text retention) — v1.0
- ✓ Keyboard shortcut for simplification — v1.0
- ✓ One-click revert to original text — v1.0
- ✓ Loading indicator during AI processing — v1.0
- ✓ Error handling for offline, rate limit, timeout, text too long — v1.0
- ✓ MV3 with proper CSP, service worker state management, Chrome Web Store ready — v1.0
- ✓ Landing page: React app with zine/punk aesthetic design system — v1.1
- ✓ Landing page: deployed to Vercel with custom domain (twelvify.com) — v1.1
- ✓ Landing page: responsive layout with all sections (nav, hero, how-it-works, features, CTA, footer) — v1.1
- ✓ Landing page: interactive playground demo with live AI streaming — v1.1
- ✓ Landing page: Chrome Web Store install CTA links — v1.1

### Active

- [ ] Redesign popup panel with toned-down zine/punk aesthetic (fonts, colors, clean layout)
- [ ] Redesign floating button with branded appearance
- [ ] Update in-page simplified text styling to match new design language
- [ ] Deploy backend to production (Render) and update extension URLs
- [ ] Chrome Web Store submission

### Future

- Click-to-define difficult words with inline tooltip
- Chrome side panel display mode
- Dark mode matching system preference
- In-extension privacy messaging
- Readability metrics showing before/after reading level

### Out of Scope

- Multiple explanation modes (academic, ELI5, etc.) — MVP is simplification only; tone levels provide sufficient variety
- OAuth / user accounts — not needed for free beta; preferences stored locally via chrome.storage.sync
- Summarization mode — different cognitive task from simplification; separate product
- Mobile app — Chrome extension only
- Offline mode / local LLM — requires AI backend, 200MB+ model download not feasible
- Payment / subscription — validate product-market fit before monetization
- Browser support beyond Chrome — Chrome-first; Firefox only if demand exists
- Real-time on-hover simplification — massive API cost spike
- Always-on background simplification — privacy nightmare + cost explosion
- Multi-page landing site — single-page landing is sufficient
- Landing page dark mode — light-only simplifies implementation
- Landing page CMS — static content is fine

## Current Milestone: v1.2 Extension Redesign + Ship

**Goal:** Redesign the extension's user-facing UI with toned-down zine/punk aesthetic from the landing page, deploy backend to production, and submit to Chrome Web Store.

**Target features:**
- Popup panel redesign (Permanent Marker / Special Elite fonts, brand colors, clean layout)
- Branded floating button
- In-page simplified text styling updated to match design language
- Backend production deploy (Render)
- Chrome Web Store submission with production URLs

## Context

Shipped v1.0 MVP with 2,190 LOC TypeScript/TSX/CSS across 75 files.
Shipped v1.1 Landing Page with 758 LOC TSX/TS/CSS. Live at twelvify.com (Lighthouse 96).
Tech stack: WXT (Chrome extension framework), React 18, Express.js, OpenAI gpt-4o-mini, SSE streaming.
Landing page: Vite + React + Tailwind CSS, deployed on Vercel with Plausible analytics.
Extension architecture: MV3 service worker with chrome.storage-driven reactive UI, Popover API for floating button.
Backend: Express proxy with SHA-256 fingerprint rate limiting (100/hr hard, 50/hr soft client-side), Winston privacy logger. Dedicated `/api/playground` endpoint with 60 req/min rate limit.
Personalization: 5 tone levels (baby → big_boy), 3 depth levels, profession-based analogies, progressive onboarding over first 3 uses.

**Known tech debt:**
- Backend URL hardcoded to localhost:3001 (update before production)
- CORS origin wildcard (*) — necessary for content script architecture
- Host permissions include both localhost and production domain

## Constraints

- **Platform**: Chrome Extension Manifest V3 — must follow Chrome Web Store policies
- **Privacy**: Zero content logging on backend; anonymous analytics only (usage counts, feature adoption)
- **AI Dependency**: All rewrites require network + AI API call; no local inference
- **Cost**: Free beta means backend costs are absorbed; gpt-4o-mini chosen for cost efficiency

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace-in-page as default | Seamless reading experience; popup as user option | ✓ Good — users see simplified text in context |
| Progressive onboarding | Lower friction than wizard; learn preferences naturally | ✓ Good — works immediately, asks after 1st/2nd/3rd use |
| Backend proxy (not BYOK) | Simpler UX, broader audience, control over costs/quality | ✓ Good — zero setup for users |
| Free beta (no monetization) | Validate product-market fit before building payment | — Pending |
| Anonymous analytics only | Privacy-first positioning is a differentiator | ✓ Good — Winston logger strips all text content |
| Express.js backend on Render | Serverless cold starts too slow for SSE; Express handles long-lived connections | ✓ Good — streaming works reliably |
| OpenAI gpt-4o-mini | Cost efficiency for MVP; upgrade path to gpt-4-turbo documented | ✓ Good — quality acceptable per UAT |
| SSE streaming (not WebSocket) | One-directional data flow, simpler than WebSocket, works with fetch | ✓ Good — word-by-word streaming in DOM |
| Storage-driven UI | FloatingButton reads chrome.storage, not direct messages | ✓ Good — eliminates race conditions, survives service worker restarts |
| Popover API for floating button | Top-layer rendering, no z-index management | ⚠️ Revisit — fell back to z-index for stacking reliability |
| WXT framework | Convention-based Chrome extension dev with HMR | ✓ Good — fast dev cycle, proper MV3 output |
| Plausible over Google Analytics | Privacy-first, no cookie consent needed, ~1KB CDN script | ✓ Good — zero bundle overhead, GDPR-friendly |
| Inline SVGs over icon font | Material Symbols was 3.8MB; SVGs are <1KB total | ✓ Good — FCP dropped from 22.4s to 1.4-3.2s |
| Vercel over Netlify | Better Vite integration, automatic preview deploys | ✓ Good — deploy-on-tag via Ignored Build Step |
| One-shot playground demo | Prevent API abuse; single "Fix This Mess" click | ✓ Good — clear demo experience, cost-controlled |
| React.lazy for Playground | Below-the-fold SSE component deferred to separate chunk | ✓ Good — reduced initial JS parse time |

---
*Last updated: 2026-02-25 after v1.2 milestone started*
