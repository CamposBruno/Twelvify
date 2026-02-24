---
phase: 01-foundation-text-selection
plan: "04"
subsystem: ui
tags: [react, chrome-extension, floating-button, css-visibility, popover-api, race-condition]

# Dependency graph
requires:
  - phase: 01-foundation-text-selection
    provides: FloatingButton with Popover API and content.ts with showPopover/hidePopover (01-03)
provides:
  - FloatingButton always renders in DOM with CSS opacity/pointerEvents visibility toggle
  - content.ts with single responsibility: selection detection and message dispatch
  - Race condition eliminated — no imperative showPopover() call ever needed
affects:
  - phase-02 (any UI enhancements to FloatingButton)
  - phase-04 (shadow DOM selection support)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Always-render pattern: React components that must respond to async events always render a DOM element; never return null based on async state"
    - "CSS visibility toggle: opacity + pointerEvents instead of conditional null return eliminates React render cycle race conditions"
    - "Storage-driven visibility: FloatingButton reads selectedText from chrome.storage via useStorageValue — no imperative show/hide calls from content script"

key-files:
  created: []
  modified:
    - src/components/FloatingButton.tsx
    - src/entrypoints/content.ts

key-decisions:
  - "Always-render FloatingButton: removed conditional null return — DOM element must exist before any external code can reference it"
  - "CSS visibility (opacity/pointerEvents) instead of Popover API: eliminates imperative showPopover() call race condition"
  - "content.ts single responsibility: selection detection and sendMessage only — no visibility management"
  - "z-index 2147483647 (max) on container: ensures button appears above all third-party page content without Popover API top-layer"
  - "Explicit React import required in content script .tsx files — Vite automatic JSX transform fails on React async scheduler re-renders (MessageChannel path)"

patterns-established:
  - "Always-render pattern: components that respond to async storage state always render a DOM placeholder"
  - "Storage-driven UI: React state drives visibility via useStorageValue, content script only dispatches messages"

requirements-completed:
  - SIMP-01
  - EXTF-03

# Metrics
duration: 45min
completed: 2026-02-23
---

# Phase 01 Plan 04: Gap Closure — FloatingButton Race Condition Fix Summary

**Always-render FloatingButton with CSS opacity toggle eliminates Popover API race condition so the Simplify button now appears on text selection**

## Performance

- **Duration:** ~45 min (including human-verify debugging)
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 2

## Accomplishments
- Removed `if (!selectedText) return null` conditional that prevented DOM element from existing during showPopover() call
- Removed entire Popover API (popover="manual" attribute, declare module block, showPopover/hidePopover functions)
- FloatingButton now always renders with CSS opacity/pointerEvents toggle driven by selectedText storage value
- content.ts simplified to single responsibility: selection detection and sendMessage dispatch only

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor FloatingButton to always render with CSS visibility** - `39d037e` (fix)
2. **Task 2: Remove showPopover/hidePopover from content script** - `de3f6d1` (fix)
3. **Task 3: Verify button appears on text selection** - `aaefa2f` (fix — React import + human-verified)

## Files Created/Modified
- `src/components/FloatingButton.tsx` - Removed conditional null return and Popover API; always renders with CSS opacity/pointerEvents toggle
- `src/entrypoints/content.ts` - Removed showPopover/hidePopover functions and all calls; content script now only detects selections and dispatches messages

## Decisions Made
- Used `opacity + pointerEvents` instead of `display: none` to allow CSS transitions for smooth show/hide
- Added `zIndex: 2147483647` (maximum safe integer for z-index) to ensure button appears above all third-party widgets without needing Popover API top layer
- Kept `transition: opacity 0.15s ease` for smooth appearance — plan specified this explicitly

## Deviations from Plan

### Auto-fixed Issues

**1. Missing React import causing async re-render crash**
- **Found during:** Task 3 (human verification)
- **Issue:** `ReferenceError: React is not defined` on storage-triggered re-renders. Initial render worked via Vite's esbuild transform, but React's async scheduler (MessageChannel) lost the React reference in content script context.
- **Fix:** Added `import React from 'react'` to FloatingButton.tsx
- **Files modified:** src/components/FloatingButton.tsx
- **Verification:** Button appears on text selection, no console errors
- **Committed in:** aaefa2f

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for functionality. No scope creep.

## Issues Encountered

- React async re-render crash required diagnostic logging to identify — initial render worked fine, only storage-change re-renders via MessageChannel scheduler failed with "React is not defined"

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 4 UAT tests pass: button appears on selection, disappears on deselect, shows spinner on click, works in textareas
- Phase 1 foundation complete, ready for Phase 2 (AI simplification API integration)

---
*Phase: 01-foundation-text-selection*
*Completed: 2026-02-23*
