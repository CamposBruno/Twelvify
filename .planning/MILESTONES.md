# Milestones

## v1.0 MVP (Shipped: 2026-02-24)

**Phases completed:** 3 phases, 14 plans
**Timeline:** 5 days (2026-02-20 → 2026-02-24)
**Lines of code:** 2,190 TypeScript/TSX/CSS
**Git range:** `e834ad0` → `b9069c8`

**Delivered:** AI-powered text simplification Chrome extension with streaming SSE backend, personalized rewrites, and progressive onboarding.

**Key accomplishments:**
1. Chrome extension with MV3 architecture, service worker state management, and storage-driven reactive UI
2. Express backend with OpenAI SSE streaming, anonymous rate limiting, and zero-content privacy logging
3. End-to-end text simplification: highlight → click → streaming in-place DOM replacement
4. Sarcastic error handling for offline, rate limit, timeout, and text-too-long scenarios
5. Personalization system with tone/depth/profession preferences, progressive onboarding, and chrome.storage.sync persistence
6. Keyboard shortcut, undo/revert, floating popup display mode, and settings panel

**Tech debt carried forward:**
- Backend URL hardcoded to localhost:3001 (update before Web Store submission)
- Host permissions include both localhost and production domain (remove localhost before production)
- CORS origin set to wildcard (*) (content scripts send page origin, not extension origin)

**Archives:** `milestones/v1.0-ROADMAP.md`, `milestones/v1.0-REQUIREMENTS.md`

---


## v1.1 Landing Page (Shipped: 2026-02-25)

**Phases completed:** 4 phases (4-7), 12 plans
**Timeline:** 5 days (2026-02-20 → 2026-02-25)
**Lines of code:** 758 TSX/TS/CSS (landing page)
**Git range:** `9e99ffc` → `74f0d32`

**Delivered:** React landing page with zine/punk aesthetic, live AI playground demo, and Vercel deployment at twelvify.com to drive Chrome Web Store installs.

**Key accomplishments:**
1. React landing page with zine/punk design system (Permanent Marker, Special Elite fonts; sharp borders, rotation transforms, paper-tear effects)
2. All page sections: sticky nav, hero with browser mockup, how-it-works cards, features, CTA, and footer with responsive mobile/desktop layout
3. Live AI playground demo with SSE streaming typing animation, one-shot disable, and graceful rate-limit error handling
4. Plausible privacy-first analytics with CTA click tracking by location (nav, hero, cta_section)
5. Deployed to twelvify.com via Vercel CI with custom domain, www redirect, and cache/security headers
6. Lighthouse performance score 96 (median) via inline SVG icons replacing 3.8MB Material Symbols font and lazy-loaded Playground

**Archives:** `milestones/v1.1-ROADMAP.md`, `milestones/v1.1-REQUIREMENTS.md`, `milestones/v1.1-MILESTONE-AUDIT.md`

---

