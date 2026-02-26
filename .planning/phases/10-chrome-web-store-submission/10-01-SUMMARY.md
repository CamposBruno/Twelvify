---
phase: 10-chrome-web-store-submission
plan: 01
subsystem: ui
tags: [react, vite, tailwind, vercel, privacy-policy, landing]

# Dependency graph
requires:
  - phase: 08-ui-redesign
    provides: landing site with brand tokens (font-display, font-punk, text-primary, bg-background-light)
provides:
  - Live privacy policy page at twelvify.com/privacy
  - Vite multi-page build with privacy.html as second entry point
  - Vercel rewrite routing /privacy to /privacy.html
  - Footer Privacy link pointing to /privacy
affects:
  - chrome-web-store-submission (privacy URL required for Store listing)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Vite MPA (multi-page app) via rollupOptions.input with named entries"
    - "Vercel rewrites for clean URL routing to static HTML files"

key-files:
  created:
    - landing/privacy.html
    - landing/src/privacy-main.tsx
    - landing/src/privacy.tsx
  modified:
    - landing/vite.config.ts
    - landing/vercel.json
    - landing/src/components/Footer.tsx
    - landing/tailwind.config.ts

key-decisions:
  - "Vite MPA approach (rollupOptions.input) chosen over react-router — landing has no router, MPA keeps pages fully independent"
  - "Vercel rewrite (not redirect) used for /privacy — serves privacy.html at clean URL without 301 bounce"
  - "tailwind.config.ts content array updated to include privacy.html — ensures Tailwind scans body classes in HTML entry"

patterns-established:
  - "Landing MPA pattern: each new static page gets its own .html entry + -main.tsx mount + component"

requirements-completed: [STOR-01]

# Metrics
duration: 2min
completed: 2026-02-25
---

# Phase 10 Plan 01: Privacy Policy Page Summary

**Vite multi-page privacy policy page at twelvify.com/privacy with all 7 Chrome Web Store required disclosure sections, Vercel rewrite routing, and footer link**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-25T00:47:49Z
- **Completed:** 2026-02-25T00:49:31Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created complete privacy policy page as a second Vite entry point (MPA build), producing `dist/privacy.html` in the build output
- Privacy component contains all 7 required sections with exact Chrome Web Store-compliant disclosures: no content logging, transient text processing, anonymous statistics only, "third-party AI service" language (no OpenAI name)
- Vercel rewrite rule routes `/privacy` to `/privacy.html` enabling clean URL at twelvify.com/privacy
- Footer Privacy link updated from `href="#"` to `href="/privacy"` — users can navigate to policy from landing site

## Task Commits

Each task was committed atomically:

1. **Task 1: Add privacy policy page as Vite multi-page entry** - `33c9d11` (feat)
2. **Task 2: Add Vercel routing for /privacy and update Footer link** - `e79e4d5` (feat)

## Files Created/Modified

- `landing/privacy.html` - HTML entry point for /privacy route; mirrors index.html structure with privacy-specific title, description, canonical URL
- `landing/src/privacy-main.tsx` - React root mount for the privacy page
- `landing/src/privacy.tsx` - Full privacy policy component with 7 sections using brand styling (font-display, font-punk, text-primary, border-4 border-slate-900)
- `landing/vite.config.ts` - Added `resolve` import and `rollupOptions.input` with `main` and `privacy` entries for MPA build
- `landing/vercel.json` - Added `rewrites` array mapping `/privacy` to `/privacy.html`
- `landing/src/components/Footer.tsx` - Updated Privacy anchor `href="#"` to `href="/privacy"`
- `landing/tailwind.config.ts` - Added `privacy.html` to `content` array so Tailwind processes body class tokens

## Decisions Made

- **Vite MPA over react-router:** Landing site has no router installed (react-dom only). Adding react-router for a single static page would be unnecessary complexity. MPA build approach keeps pages independent and is idiomatic Vite.
- **Vercel rewrite not redirect:** A rewrite serves `privacy.html` at `/privacy` without a visible URL change or 301 bounce, giving the cleanest user experience.
- **tailwind.config.ts content update:** The `<body>` tag in `privacy.html` uses Tailwind classes (`bg-background-light`, `font-body`, etc.). Without adding `privacy.html` to the content array, those classes would be purged from the CSS bundle.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added privacy.html to tailwind.config.ts content array**
- **Found during:** Task 1 (build verification)
- **Issue:** The plan specified updating vite.config.ts but not tailwind.config.ts. The `<body>` tag in `privacy.html` uses brand-token Tailwind classes (`bg-background-light`, `font-body`, `antialiased`, `selection:bg-primary`). Without adding `privacy.html` to the Tailwind content array, these classes would be tree-shaken from the CSS output in production, breaking the page styling.
- **Fix:** Added `'./privacy.html'` to the `content` array in `landing/tailwind.config.ts`
- **Files modified:** `landing/tailwind.config.ts`
- **Verification:** Build passes, privacy page renders with correct background and body styling
- **Committed in:** `33c9d11` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical)
**Impact on plan:** Necessary for correct styling. Without this fix, the page background and body font classes would be missing in production. No scope creep.

## Issues Encountered

None — plan executed cleanly with one minor Tailwind config addition needed.

## User Setup Required

None - no external service configuration required. The privacy page will go live on the next Vercel deployment of the landing site.

## Next Phase Readiness

- Privacy policy URL (twelvify.com/privacy) will be live after next Vercel deployment
- Ready to use this URL in Chrome Web Store submission form (Store Listing > Privacy practices > Privacy policy URL)
- Remaining Phase 10 plans can proceed: store assets, submission form, review wait

---
*Phase: 10-chrome-web-store-submission*
*Completed: 2026-02-25*
