---
phase: 07-launch
plan: 01
subsystem: ui
tags: [analytics, plausible, react, typescript, landing-page]

# Dependency graph
requires:
  - phase: 06-playground
    provides: landing page components (Nav, Hero, CallToAction) that needed instrumentation
provides:
  - Plausible Analytics integration with page view tracking and CTA click events
  - Typed analytics helper (trackPageView, trackEvent) in landing/src/analytics.ts
affects: [07-launch]

# Tech tracking
tech-stack:
  added: [Plausible Analytics (CDN script — zero bundle overhead)]
  patterns: [trackEvent('cta_click', { location }) for CTA instrumentation, defer script for non-blocking analytics]

key-files:
  created:
    - landing/src/analytics.ts
  modified:
    - landing/index.html
    - landing/src/main.tsx
    - landing/src/components/Nav.tsx
    - landing/src/components/Hero.tsx
    - landing/src/components/CallToAction.tsx

key-decisions:
  - "Plausible Analytics chosen: privacy-first (~1KB CDN), no cookie consent required, zero bundle cost"
  - "trackPageView is a no-op hook — Plausible auto-tracks page views from script load; hook exists for future SPA routing"
  - "trackEvent called on anchor onClick — default navigation preserved, event fires before navigation"

patterns-established:
  - "Analytics pattern: import trackEvent from analytics.ts, call on onClick of CTA anchors"
  - "Event naming: cta_click with location prop (nav | hero | cta_section)"

requirements-completed: [ANALYTICS-01]

# Metrics
duration: 8min
completed: 2026-02-25
---

# Phase 7 Plan 01: Analytics Summary

**Plausible Analytics wired into landing page — deferred CDN script, typed helper, and three CTA placements instrumented with cta_click events**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-25T01:39:32Z
- **Completed:** 2026-02-25T01:47:32Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created typed analytics.ts helper exporting trackPageView and trackEvent with window.plausible safety guard
- Added Plausible CDN script to index.html with defer (non-blocking) and data-domain="twelvify.com"
- Instrumented all three CTA placements: Nav, Hero, and CallToAction — each fires trackEvent('cta_click', { location }) on click

## Task Commits

Each task was committed atomically:

1. **Task 1: Create analytics helper** - `05be906` (feat)
2. **Task 2: Inject Plausible script + instrument CTA click events** - `801acab` (feat)

**Plan metadata:** (docs commit, see below)

## Files Created/Modified

- `landing/src/analytics.ts` - Typed analytics helper with Window.plausible declaration, trackPageView (no-op hook), and safe trackEvent wrapper
- `landing/index.html` - Added Plausible `<script defer data-domain="twelvify.com">` in head
- `landing/src/main.tsx` - Import and call trackPageView via setTimeout after React renders
- `landing/src/components/Nav.tsx` - onClick on "ADD TO CHROME" anchor fires cta_click location:nav
- `landing/src/components/Hero.tsx` - onClick on "Install Twelveify" anchor fires cta_click location:hero
- `landing/src/components/CallToAction.tsx` - onClick on "ADD TO CHROME" anchor fires cta_click location:cta_section

## Decisions Made

- Plausible over Google Analytics: privacy-first, no GDPR cookie banner needed, ~1KB vs ~50KB, free plan available at plausible.io
- CDN script approach (not npm package) to keep zero bundle overhead — plan specification honored
- trackPageView left as explicit no-op rather than omitted — provides clear hook for future SPA routing if routes are added

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**External service requires manual configuration after deploy:**
- Sign up for a free account at https://plausible.io
- Add `twelvify.com` as a site in the Plausible dashboard
- The `data-domain="twelvify.com"` attribute in index.html must match the domain registered in Plausible
- Analytics data will only appear once the site is live and receiving real traffic

## Next Phase Readiness

- Analytics wired and build is clean — ready for Phase 7 Plan 02 (Vercel deployment)
- No blockers

---
*Phase: 07-launch*
*Completed: 2026-02-25*
