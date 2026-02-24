# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.
**Current focus:** v1.1 Landing Page — Phase 6: Playground Interactivity

## Position

**Milestone:** v1.1 Landing Page
**Current phase:** 6 of 7 (Phase 6: Playground Interactivity)
**Current Plan:** Not started
**Status:** Milestone complete

Progress: [████████░░] 75% (v1.1)

## Decisions

- v1.1 uses phases 4-7 (continuing numbering from v1.0 phases 1-3)
- Playground is one-shot demo only: button disabled after first successful call
- Backend `/api/playground` accepts no arbitrary input — hardcoded sample text only
- PERF-02 (font loading) placed in Phase 4 (Foundation) — it is a setup-level concern
- Vite project scaffolded manually (npm create vite cancelled on existing landing/ dir)
- .zine-box and .paper-tear defined in @layer base, not as utilities
- Google Fonts loaded via index.html link tag for pre-hydration availability
- Two separate preconnect tags required: googleapis.com (no crossorigin) + gstatic.com (with crossorigin)
- display=swap delivered via URL param (&display=swap) in Google Fonts href — no additional CSS needed
- App.tsx wires Nav > Hero > HowItWorks > Playground placeholder (#try-it) > Features > CTA > Footer — matches code.html document order
- CHROME_STORE_URL defined in constants.ts — placeholder, easy to swap when extension goes live
- Nav uses hidden md:flex for section links — mobile shows logo + CTA only
- CSS placeholder div used for Features illustration — Phase 7 will add real image
- Footer links use href="#" placeholder — to be wired in later phases
- Playground rate limit 60 req/min (1 req/sec) vs 100 req/hr for /api/simplify — stricter for public demo protection
- playgroundRateLimiter defined locally in playground.ts (not shared middleware/) — self-contained isolation pattern
- Playground fixed options: tone 12, depth medium, profession empty — sensible defaults for hardcoded demo
- Playground.tsx uses useCallback for handleClick; toast rendered inside .zine-box with overflow-hidden for natural slide-in effect
- Mid-stream SSE errors preserve typed text and disable button (partial success state)
- Vite proxy /api -> http://localhost:3001 added to vite.config.ts for local dev (keeps Playground component portable, no hardcoded baseURL)
- Legend labels: COMPLEX ORIGINAL is active/highlighted in idle state; swaps to SIMPLIFIED VERSION after AI completion
- E2E Playwright tests added in /e2e directory with playwright.config.ts at root — 9/9 pass for Phase 6 playground flow

## Session Log

- 2026-02-24: v1.0 MVP milestone completed and archived
- 2026-02-24: Milestone v1.1 Landing Page started
- 2026-02-24: v1.1 roadmap created — 4 phases (4-7), 27/27 requirements mapped
- 2026-02-24: Completed 04-01-PLAN.md — Vite+React+TS+Tailwind scaffold with zine/punk design system
- 2026-02-24: Completed 04-02-PLAN.md — Google Fonts preconnect loading + design system demo, human-verified
- 2026-02-24: Completed 05-01-PLAN.md — App shell, Nav component, CHROME_STORE_URL constant, SEO meta tags
- 2026-02-24: Completed 05-02-PLAN.md — Hero section with CSS browser mockup and HowItWorks with 3 rotating zine-box cards
- 2026-02-24: Completed 05-03-PLAN.md — Features, CTA, and Footer components with rotating icon boxes and paper-tear CTA
- 2026-02-24: Completed 05-04-PLAN.md — Integration: all sections wired into App.tsx, smooth scroll enabled, 13/13 Playwright tests passed
- 2026-02-24: Completed 06-01-PLAN.md — POST /api/playground SSE endpoint with hardcoded sample text and 60 req/min per-IP rate limiter
- 2026-02-24: Completed 06-02-PLAN.md — Playground React component with SSE typing animation, one-shot lock, and toast error handling
- 2026-02-24: Completed 06-03-PLAN.md — Wired Playground into App.tsx, added Vite proxy, corrected legend labels, 9/9 E2E tests pass — Phase 6 complete

## Accumulated Context

- Existing design at `landing/code.html` — complete HTML/Tailwind implementation of zine/punk aesthetic
- Figma: https://www.figma.com/design/yoheL0SdABQcDpLhJL8ZRX/Twelvify-Landing-Page
- Stack: React (same as extension), deploy to Netlify/Vercel
- Design uses: Permanent Marker, Special Elite, Inter fonts; #f56060 primary; sharp borders; rotation effects
- Backend: new `/api/playground` endpoint on existing Express server (stricter rate limit: 1 req/sec per client)
