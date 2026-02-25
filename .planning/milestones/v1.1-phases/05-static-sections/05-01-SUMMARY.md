---
phase: 05-static-sections
plan: 01
subsystem: landing
tags: [nav, seo, constants, app-shell, semantic-html]
dependency_graph:
  requires: []
  provides: [Nav component, CHROME_STORE_URL constant, App shell, SEO meta tags]
  affects: [landing/src/App.tsx, landing/index.html]
tech_stack:
  added: []
  patterns: [sticky-nav, semantic-html-landmarks, open-graph, twitter-card]
key_files:
  created:
    - landing/src/constants.ts
    - landing/src/components/Nav.tsx
  modified:
    - landing/src/App.tsx
    - landing/index.html
decisions:
  - CHROME_STORE_URL defined once in constants.ts and imported by Nav — placeholder URL ready to swap when extension goes live
  - Nav uses hidden md:flex for desktop-only section links — logo and CTA always visible on mobile
  - App.tsx replaced design system demo with semantic shell (Nav + main + footer placeholders)
metrics:
  duration: ~8 minutes
  completed: 2026-02-24T21:04:15Z
  tasks_completed: 2
  files_changed: 4
---

# Phase 05 Plan 01: App Shell, Nav Component, and SEO Foundation Summary

**One-liner:** Sticky zine/punk Nav with CHROME_STORE_URL constant, semantic App shell, and full Open Graph + Twitter Card SEO meta tags in index.html.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create constants.ts and Nav component | 9e99ffc | landing/src/constants.ts, landing/src/components/Nav.tsx |
| 2 | Update App.tsx shell + add SEO meta tags | 28411bb | landing/src/App.tsx, landing/index.html |

## What Was Built

### constants.ts
Single exported constant `CHROME_STORE_URL` pointing to the Chrome Web Store. Placeholder URL — swap the value when the extension goes live. This is the single source of truth used by all CTA buttons.

### Nav component (landing/src/components/Nav.tsx)
Sticky top nav matching code.html design exactly:
- Outer `<nav>` with `sticky top-0 z-50 border-b-4 border-slate-900 bg-white`
- Logo: rotated red box with bike icon + "Twelveify" in font-display
- Section links: `hidden md:flex` — desktop only (HOW IT WORKS, FEATURES, PLAYGROUND)
- CTA button: `<a>` wrapping `<button>` linked to `CHROME_STORE_URL`, shadow-punk styling

### App.tsx shell
Replaced the Phase 4 design system demo with the real page scaffold:
- `<Nav />` at the top
- `<main>` with placeholder comment (sections added in plans 02-03)
- `<footer id="footer">` with placeholder comment (footer added in plan 03)
- Fragment wrapper (no extra div)

### SEO meta tags (landing/index.html)
Added after existing `<title>` tag:
- `<meta name="description">` — plain English description
- `<link rel="canonical" href="https://twelvify.com">`
- 5 Open Graph tags: type, url, title, description, image
- 5 Twitter Card tags: card, url, title, description, image
- All confirmed present in `dist/index.html` after build

## Verification

- `npm run build` exits 0 — TypeScript + Vite build pass
- `grep -c "og:title\|twitter:card" dist/index.html` returns 2
- All SEO tags confirmed in built output
- Nav contains CHROME_STORE_URL import and usage
- App.tsx renders `<Nav />` in semantic landmark structure

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] landing/src/constants.ts — FOUND
- [x] landing/src/components/Nav.tsx — FOUND
- [x] landing/src/App.tsx — FOUND (updated)
- [x] landing/index.html — FOUND (updated)
- [x] Commit 9e99ffc — FOUND (feat(05-01): create constants.ts and Nav component)
- [x] Commit 28411bb — FOUND (feat(05-01): update App.tsx shell and add SEO meta tags)
- [x] dist/index.html contains og:title and twitter:card — CONFIRMED
