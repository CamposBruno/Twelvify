---
phase: 05-static-sections
plan: 02
subsystem: ui
tags: [react, tailwind, components, hero, landing-page]

# Dependency graph
requires:
  - phase: 05-01
    provides: Nav component, CHROME_STORE_URL constant, App shell
provides:
  - Hero section component with CSS browser mockup and CTA buttons
  - HowItWorks section component with 3 zine-box step cards
affects: [05-03, 06-playground]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Replicating code.html sections as isolated React components
    - hidden lg:block pattern for mobile-responsive desktop-only elements
    - zine-box CSS class applied to React divs for consistent card styling
    - Material Symbols icon class strings used directly in JSX span elements

key-files:
  created:
    - landing/src/components/Hero.tsx
    - landing/src/components/HowItWorks.tsx
  modified: []

key-decisions:
  - "Social proof avatars use colored circle divs (bg-slate-400/500/600) — no external image URLs"
  - "Browser mockup right column uses hidden lg:block — consistent with CONTEXT.md mobile decision"
  - "How-it-works step icons: draw (card 1), auto_fix_high (card 2) — matching code.html exactly"

patterns-established:
  - "Component-per-section pattern: each HTML section from code.html becomes a standalone TSX file"
  - "hover:rotate-0 transition-transform on zine-box cards implements INTX-03 hover reset"

requirements-completed: [SECT-01, SECT-02, INTX-03]

# Metrics
duration: 8min
completed: 2026-02-24
---

# Phase 5 Plan 02: Hero and How-it-works Sections Summary

**Hero section with CSS browser mockup and CHROME_STORE_URL-linked CTAs, plus HowItWorks with three rotating zine-box step cards implementing INTX-03 hover effects**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-24T18:05:42Z
- **Completed:** 2026-02-24T18:13:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Hero component: badge, h1 tagline, description, Install + View Demo CTAs, colored-circle social proof, CSS browser mockup (desktop only)
- HowItWorks component: section id="how-it-works" anchor, three zine-box cards with step numbers (-2deg / 3deg / -1deg rotations) and hover:rotate-0 transition
- Both components build cleanly — TypeScript passes, no linting errors
- Code matches code.html content and structure exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Hero section component** - `c5eb723` (feat)
2. **Task 2: Build How-it-works section component** - `536619c` (feat)

## Files Created/Modified
- `landing/src/components/Hero.tsx` - Hero section with badge, h1, description, CTA buttons, social proof, CSS browser mockup hidden on mobile
- `landing/src/components/HowItWorks.tsx` - How-it-works section with 3 zine-box step cards, rotation transforms, hover:rotate-0 transition

## Decisions Made
- Social proof avatars use colored circle divs (bg-slate-400/500/600 rounded-full) instead of external image URLs — matches CONTEXT.md's "Claude's discretion" and avoids external dependencies
- Browser mockup right column: `hidden lg:block` — consistent with CONTEXT.md "Hero on mobile: text only — hide the browser mockup on small screens"
- HowItWorks step icons match code.html exactly: `draw` for card 1, `auto_fix_high` for card 2, no icon for card 3

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Hero and HowItWorks components ready to be imported in App.tsx
- Phase 05-03 can now implement Features, CTA, and Footer sections
- CHROME_STORE_URL correctly wired through constants.ts

---
*Phase: 05-static-sections*
*Completed: 2026-02-24*
