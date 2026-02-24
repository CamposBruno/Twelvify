# Twelveify

## What This Is

A Chrome extension that rewrites complex or technical text into clear, plain language tailored to each user's preferences. Users highlight text on any webpage, click a floating icon, and the selected text is replaced with a simplified version — personalized by tone, depth, and the user's background so explanations feel natural and relatable. Shipped as v1.0 MVP with streaming AI backend, progressive onboarding, and full user controls.

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

### Active

- [ ] Landing page: implement existing Figma/HTML design as React app
- [ ] Landing page: deploy to Netlify/Vercel with custom domain support
- [ ] Landing page: responsive design matching zine/punk aesthetic from design
- [ ] Landing page: interactive playground demo section
- [ ] Landing page: Chrome Web Store install CTA links

### Deferred (from v1.0)

- [ ] Click-to-define difficult words with inline tooltip (WORD-01, WORD-02)
- [ ] Chrome side panel display mode (DISP-04)
- [ ] Dark mode matching system preference (DISP-05)
- [ ] In-extension privacy messaging (PRIV-01)
- [ ] Readability metrics showing before/after reading level (PRIV-02)
- [ ] Deploy backend to production (Render) and update extension URLs
- [ ] Chrome Web Store submission

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

## Current Milestone: v1.1 Landing Page

**Goal:** Implement the existing Figma/HTML landing page design as a React app and deploy to Netlify/Vercel to drive Chrome Web Store installs.

**Target features:**
- React implementation of zine/punk aesthetic landing page design
- Responsive layout: nav, hero, how-it-works, playground, features, CTA, footer
- Interactive playground demo section
- Dark mode support
- Deploy to Netlify/Vercel

## Context

Shipped v1.0 MVP with 2,190 LOC TypeScript/TSX/CSS across 75 files.
Tech stack: WXT (Chrome extension framework), React 18, Express.js, OpenAI gpt-4o-mini, SSE streaming.
Extension architecture: MV3 service worker with chrome.storage-driven reactive UI, Popover API for floating button.
Backend: Express proxy with SHA-256 fingerprint rate limiting (100/hr hard, 50/hr soft client-side), Winston privacy logger.
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

---
*Last updated: 2026-02-24 after v1.1 milestone started*
