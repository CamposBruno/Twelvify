# Project State: Twelveify

**Last Updated:** 2026-02-20

---

## Project Reference

**Core Value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

**Current Focus:** Roadmap phase planning (strategic structure complete)

**Milestone:** v1 MVP delivery

**Phase Structure:** 3-phase delivery (Foundation → Backend → Personalization)

---

## Current Position

| Item | Status |
|------|--------|
| **Current Phase** | Planning (Roadmap complete) |
| **Current Plan** | None (waiting for Phase 1 planning) |
| **Progress** | Roadmap 100% complete (23/23 requirements mapped) |
| **Blockers** | None |

**Progress Bar:** `[===========               ] Roadmap Complete (Phase 1 Planning Next)`

---

## Requirements Coverage

**v1 Requirements:** 23 total
**Mapped to Phases:** 23 (100% coverage)
**Unmapped:** 0

**By Phase:**
- Phase 1 (Foundation): 6 requirements
- Phase 2 (Backend): 9 requirements
- Phase 3 (Personalization): 8 requirements

**Coverage Status:** ✓ All v1 requirements mapped, no orphans

---

## Key Decisions

| Decision | Status | Notes |
|----------|--------|-------|
| Phase structure (3 vs 4 phases) | DECIDED | 3 phases for "quick" depth; aligns with research grouping |
| Technology stack | RESEARCH RECOMMENDED | WXT, React 18, Tailwind, Zustand, Cloudflare Workers, OpenAI GPT-4o mini |
| Backend architecture | RESEARCH RECOMMENDED | Stateless proxy pattern, SSE streaming, two-layer rate limiting |
| Display mode default | RESEARCH RECOMMENDED | Replace-in-page as default, popup as configurable option |
| AI provider | RESEARCH FLAGGED | GPT-4o mini recommended for cost, A/B test vs Claude Haiku if quality issues emerge |

---

## Research Context

Research phase completed with HIGH confidence across stack, features, architecture, and critical pitfalls.

**Key Research Findings:**
- Recommended tech stack: WXT + React + Tailwind + Zustand + Cloudflare Workers
- Recommended AI: OpenAI GPT-4o mini ($0.15/$0.60 per M tokens) vs Claude Haiku (5.3x more expensive)
- Critical pitfalls documented: Service worker state ephemeral, uncontrolled API costs, CSP misconfigurations, floating UI z-index wars

**Research Flags:**
- Phase 2: OpenAI vs Claude quality trade-off (recommend launch with GPT-4o mini, A/B test if needed)
- Phase 2: Cloudflare Workers performance at scale (assume <5ms, verify during Phase 2 setup)
- Phase 4 (future): Popover API vs CSS Anchor Positioning for high z-index site support

See `.planning/research/SUMMARY.md` for full research details.

---

## Accumulated Context

### Architecture Notes

**Message-Passing Pattern (Research Recommendation):**
```
Webpage DOM
  ↓
Content Script (text selection, floating UI)
  ↓ chrome.runtime.sendMessage()
Service Worker (message router, state manager, rate limiter)
  ↓ HTTPS fetch
Backend Proxy (Cloudflare Workers)
  ↓
OpenAI API
```

**Critical Patterns:**
- All state → chrome.storage.local (not global variables)
- All event listeners at top level (not in async callbacks)
- Two-layer rate limiting: soft (50/hr in extension) + hard (100/hr on backend)
- Privacy-first logging: never log content, only metadata

### Known Risks

1. **Service Worker State Ephemeral** — Service worker unloads after ~30s inactivity; global state is lost. MITIGATION: All state must persist to chrome.storage.local.

2. **Uncontrolled API Costs** — No rate limiting + user loop or bug = 100K API calls in hours. MITIGATION: Implement two-layer rate limiting before public launch.

3. **Floating Icon Z-Index Wars** — Icon appears behind page content on high z-index sites (Gmail, Figma). MITIGATION: Use Popover API (Chrome 114+) or CSS Anchor Positioning (Chrome 125+), defer to Phase 4.

4. **CSP Blocks Backend Calls** — Missing backend domain in manifest.json CSP = silent fetch failures. MITIGATION: Explicitly list backend domain in connect-src.

5. **Shadow DOM Text Selection** — Content script cannot access text in shadow DOM (security boundary). MITIGATION: Defer to Phase 4; use injected script + postMessage workaround if needed.

---

## Session Continuity

**Files Created:**
- `.planning/ROADMAP.md` — Phase structure with 23 requirements mapped
- `.planning/STATE.md` — This file
- `.planning/REQUIREMENTS.md` — Traceability section updated

**Next Action:** `/gsd:plan-phase 1` (Phase 1 planning and decomposition)

**Expected Next Phase Duration:** 3-4 weeks (Phase 1 Foundation & Text Selection)

---

*State initialized: 2026-02-20*
*Roadmap created with 100% requirement coverage*
