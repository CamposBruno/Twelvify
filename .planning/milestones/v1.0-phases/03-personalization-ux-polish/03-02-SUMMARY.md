---
phase: 03-personalization-ux-polish
plan: 02
subsystem: ui
tags: [react, chrome-extension, undo-stack, tone-level, floating-button]

# Dependency graph
requires:
  - phase: 03-01
    provides: ToneLevel type, useStorageSyncValue hook, chrome.storage.sync defaults

provides:
  - UndoStack class (push/pop/peek/isEmpty/size/clear/revertLast) at src/utils/undoStack.ts
  - FloatingButton with undo mode (hasUndo/onUndo props, green button)
  - FloatingButton with age-level cycling label driven by ToneLevel from sync storage
  - Hover tooltip showing keyboard shortcut on default state

affects: [03-03, content.ts integration of undoStack, undo wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Priority hierarchy in button state: isLoading > errorState > hasUndo > default"
    - "UndoStack as in-memory-only module-scoped instance per page load"
    - "Direct DOM Text node reference in UndoEntry for O(1) revert without Range serialization"

key-files:
  created:
    - src/utils/undoStack.ts
  modified:
    - src/components/FloatingButton.tsx

key-decisions:
  - "getButtonLabel returns ONE-LEVEL-LOWER label (e.g. tone=12 → 'Explain like I'm 5') — button invites simplification to next level down"
  - "UndoStack holds direct Text node reference — avoids Range serialization, valid for full page lifetime"
  - "Undo mode gated on hasUndo AND !isLoading — loading always takes priority to prevent confusing state"
  - "&#x21A9; Unicode escape used for ↩ symbol instead of SVG — no external assets needed"

patterns-established:
  - "FloatingButton state priority: isLoading > errorState > hasUndo > default (extend this list for future modes)"
  - "Age-level cycling: big_boy → 18 → 12 → 5 → baby → big_boy (wrap-around for infinite cycling UX)"

requirements-completed: [SIMP-04, PERS-01]

# Metrics
duration: 2min
completed: 2026-02-24
---

# Phase 03 Plan 02: FloatingButton Undo Mode + UndoStack Summary

**UndoStack utility with direct Text node revert and FloatingButton extended with tone-driven age-level cycling label and green undo mode**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-24T03:25:55Z
- **Completed:** 2026-02-24T03:27:58Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- Created `src/utils/undoStack.ts` with full LIFO stack API (push/pop/peek/isEmpty/size/clear/revertLast)
- UndoStack stores direct DOM Text node references for O(1) revert without Range serialization
- Extended FloatingButton with `hasUndo`/`onUndo` props and green (#10b981) undo mode button
- Button shows tone-driven one-level-lower age label (e.g. tone=12 shows "Explain like I'm 5")
- Hover title attribute exposes keyboard shortcut `Ctrl+Shift+1` for discoverability
- All existing error state, shake animation, loading behavior preserved

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UndoStack utility module** - `9e5ccb8` (feat)
2. **Task 2: Extend FloatingButton with undo mode and age-level cycling label** - `893ee4a` (feat)

**Plan metadata:** (docs commit — below)

## Files Created/Modified
- `src/utils/undoStack.ts` - In-memory undo stack for simplification reversals; UndoEntry interface + UndoStack class
- `src/components/FloatingButton.tsx` - Extended with hasUndo/onUndo props, getButtonLabel helper, tone-aware label, green undo mode

## Decisions Made
- `getButtonLabel` returns the ONE-LEVEL-LOWER label — the button invites the user to simplify to the level below their current setting (e.g. setting=12 shows "Explain like I'm 5")
- `UndoStack` holds direct `Text` node references rather than Range serialization — simpler and O(1) revert; valid for the full page lifetime
- Undo mode requires `hasUndo && !isLoading` — loading state always wins priority to prevent user confusion
- Used Unicode `&#x21A9;` (↩) instead of SVG for the undo icon — no external assets, minimal bundle impact

## Deviations from Plan

None - plan executed exactly as written.

Note: `npx tsc --noEmit` produces pre-existing JSX/chrome-type errors across the project (the `.wxt/tsconfig.json` lacks `jsx` and chrome type lib settings for standalone tsc invocation). The undoStack.ts file itself produces zero TypeScript errors, and the WXT build (`npx wxt build`) succeeds cleanly — confirming no regressions were introduced.

## Issues Encountered
None — WXT build succeeds, no compile errors in new/modified files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `UndoStack` is ready to import in `content.ts` — create one instance per page load and push entries after each text node replacement
- `FloatingButton` accepts `hasUndo` and `onUndo` props — content.ts needs to pass these to wire undo behavior
- Phase 03-03 can proceed with integrating undo stack and wiring the button into the full simplification + undo flow

---
*Phase: 03-personalization-ux-polish*
*Completed: 2026-02-24*
