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

patterns-established:
  - "Always-render pattern: components that respond to async storage state always render a DOM placeholder"
  - "Storage-driven UI: React state drives visibility via useStorageValue, content script only dispatches messages"

requirements-completed:
  - SIMP-01
  - EXTF-03

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 01 Plan 04: Gap Closure — FloatingButton Race Condition Fix Summary

**Always-render FloatingButton with CSS opacity toggle eliminates Popover API race condition so the Simplify button now appears on text selection**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-23T23:54:22Z
- **Completed:** 2026-02-23T23:55:54Z
- **Tasks:** 2 auto-tasks complete, 1 checkpoint:human-verify pending
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
3. **Task 3: Verify button appears on text selection** - PENDING (checkpoint:human-verify)

## Files Created/Modified
- `src/components/FloatingButton.tsx` - Removed conditional null return and Popover API; always renders with CSS opacity/pointerEvents toggle
- `src/entrypoints/content.ts` - Removed showPopover/hidePopover functions and all calls; content script now only detects selections and dispatches messages

## Decisions Made
- Used `opacity + pointerEvents` instead of `display: none` to allow CSS transitions for smooth show/hide
- Added `zIndex: 2147483647` (maximum safe integer for z-index) to ensure button appears above all third-party widgets without needing Popover API top layer
- Kept `transition: opacity 0.15s ease` for smooth appearance — plan specified this explicitly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — both tasks completed without errors. Build exits cleanly (0 TypeScript errors). Compiled output confirmed: no `showPopover`/`hidePopover` in `.output/chrome-mv3/content-scripts/content.js`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Human verification (Task 3) still pending — user must reload extension in Chrome and confirm button appears on text selection
- Once verified, Phase 1 UAT tests 3-6 should all pass
- Phase 2 (AI simplification) can begin once UAT is confirmed

---
*Phase: 01-foundation-text-selection*
*Completed: 2026-02-23*
