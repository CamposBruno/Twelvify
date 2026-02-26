---
phase: 10-chrome-web-store-submission
plan: 03
subsystem: ui
tags: [chrome-web-store, screenshots, playwright, html-mockups, store-listing]

# Dependency graph
requires:
  - phase: 10-chrome-web-store-submission
    provides: Phase context, brand guidelines (#f56060, Permanent Marker font, Special Elite font)
provides:
  - store/listing.md with title (53 chars), summary (90 chars), full description
  - 5 annotated HTML screenshot mockups at 1280x800px viewport
  - Playwright capture.mjs script for rendering HTML to PNGs
  - 5 PNG files at 1280x800px (verified)
affects: [chrome-web-store-submission]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Self-contained HTML mockups as screenshot source files (no live extension required)
    - Playwright capture script for deterministic HTML-to-PNG rendering at fixed viewport
    - Annotation callouts using yellow (#fef08a) boxes with black border + shadow

key-files:
  created:
    - store/listing.md
    - store/screenshots/screenshot-1-core-flow.html
    - store/screenshots/screenshot-2-settings.html
    - store/screenshots/screenshot-3-news-context.html
    - store/screenshots/screenshot-4-before-after.html
    - store/screenshots/screenshot-5-academic-context.html
    - store/screenshots/capture.mjs
    - store/screenshots/screenshot-1-core-flow.png
    - store/screenshots/screenshot-2-settings.png
    - store/screenshots/screenshot-3-news-context.png
    - store/screenshots/screenshot-4-before-after.png
    - store/screenshots/screenshot-5-academic-context.png
  modified: []

key-decisions:
  - "HTML mockups used instead of live browser captures — allows fully autonomous screenshot production without running extension"
  - "Playwright capture.mjs renders each HTML file to a 1280x800 PNG via file:// URL with networkidle wait for Google Fonts"
  - "Brand design system inline in each HTML: #f56060 primary, Permanent Marker display, Special Elite body, 0px border-radius"
  - "Annotation callouts use yellow (#fef08a) with 2px solid #1e293b border and 2px box-shadow for visibility"

patterns-established:
  - "Browser chrome mockup: gray bar (40px) with traffic lights, centered URL bar, extension icon"
  - "Extension wand button: 44x44px, #f56060, 3px border + 4px shadow for neo-brutalist style"
  - "Popup panel: white, 360px wide, 3px border + 8px shadow, Permanent Marker title in #f56060"

requirements-completed: [STOR-03, STOR-04]

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 10 Plan 03: Store Listing Copy and Screenshot Mockups Summary

**Store listing copy (title 53 chars, summary 90 chars) and 5 annotated HTML mockup screenshots rendered to 1280x800px PNGs via Playwright — covering core flow, settings, news, before/after, and academic contexts**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-26T01:27:55Z
- **Completed:** 2026-02-26T01:31:24Z
- **Tasks:** 2
- **Files modified:** 13 (1 listing + 5 HTML + 1 capture script + 5 PNGs + 1 screenshot dir created)

## Accomplishments

- Store listing copy created with title (53 chars, limit 75), summary (90 chars, limit 132), and full casual-tone description leading with "Big words, simplified" messaging
- 5 self-contained HTML mockup files created at 1280x800px with realistic browser chrome, website content mockups, extension UI overlays, and yellow annotation callouts
- Playwright capture.mjs script generates all 5 PNGs automatically; verified all at exactly 1280x800px

## Task Commits

Each task was committed atomically:

1. **Task 1: Write store listing copy** - `31768bb` (feat)
2. **Task 2: Create 5 screenshot HTML mockups + Playwright capture script** - `b29b147` (feat)

## Files Created/Modified

- `store/listing.md` - Chrome Web Store title, summary, description, category, privacy URL, and dashboard notes
- `store/screenshots/screenshot-1-core-flow.html` - Wikipedia article with text selection, wand button, popup result, 3 annotations
- `store/screenshots/screenshot-2-settings.html` - Settings popup with reading level selector (Beginner/Standard/Advanced), 2 annotations
- `store/screenshots/screenshot-3-news-context.html` - News article with economic jargon, streaming cursor indicator, 2 annotations
- `store/screenshots/screenshot-4-before-after.html` - Side-by-side before/after comparison on Twelvify landing page, 2 annotations
- `store/screenshots/screenshot-5-academic-context.html` - arXiv paper abstract with simplification popup, 2 annotations
- `store/screenshots/capture.mjs` - Playwright ESM script: renders each HTML to PNG at 1280x800 with networkidle wait
- `store/screenshots/*.png` (x5) - Generated PNG screenshots, all 1280x800px verified

## Decisions Made

- HTML mockups chosen over live browser captures: allows fully autonomous production without a running extension or browser session
- Design system (brand colors, fonts, border-radius, box-shadows) applied inline within each HTML — no external dependencies except Google Fonts CDN
- Playwright uses `networkidle` wait to allow Google Fonts to load before capture (with timeout fallback)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Store listing copy ready to paste into Chrome Developer Dashboard
- All 5 PNGs at `store/screenshots/*.png` ready for upload to the Web Store listing
- To regenerate PNGs after HTML edits: `node store/screenshots/capture.mjs` from project root
- Phase 10 remaining work: actual Chrome Web Store submission (plan 04 onwards)

---
*Phase: 10-chrome-web-store-submission*
*Completed: 2026-02-26*
