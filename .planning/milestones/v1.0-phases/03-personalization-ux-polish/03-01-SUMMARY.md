---
phase: 03-personalization-ux-polish
plan: 01
subsystem: storage
tags: [chrome-extension, chrome-storage-sync, typescript, react-hooks, settings]

# Dependency graph
requires:
  - phase: 01-foundation-text-selection
    provides: useStorageValue hook pattern for chrome.storage.local
provides:
  - ToneLevel union type (baby | 5 | 12 | 18 | big_boy) for age-based simplification
  - UserSettings interface with tone, depth, profession, displayMode, keyboardShortcut, dismissedOnboardingPrompts
  - DEFAULT_SETTINGS constant with tone:12 brand default
  - useStorageSyncValue hook for reading/writing chrome.storage.sync
  - initSyncDefaults helper for seeding defaults on first install
affects:
  - 03-02 (tone picker — reads/writes tone via useStorageSyncValue)
  - 03-03 (depth picker — reads/writes depth via useStorageSyncValue)
  - 03-04 (profession input — reads/writes profession via useStorageSyncValue)
  - 03-05 (display mode — reads/writes displayMode via useStorageSyncValue)
  - 03-06 (keyboard shortcut — reads keyboardShortcut for display)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useStorageSyncValue hook mirrors useStorageValue but targets chrome.storage.sync
    - areaName guard in onChanged listener prevents local-storage changes from triggering sync hook re-renders
    - initSyncDefaults pattern for first-install seeding without overwriting existing prefs

key-files:
  created: []
  modified:
    - src/storage/types.ts
    - src/storage/useStorage.ts

key-decisions:
  - "ToneLevel uses literal numbers (5, 12, 18) and string literals (baby, big_boy) — union type prevents invalid tone values"
  - "chrome.storage.sync chosen over local for UserSettings — sync persists across browser restarts and syncs across profiles"
  - "onChanged listener checks areaName === 'sync' to prevent local storage writes from triggering sync hook re-renders"
  - "initSyncDefaults only sets keys absent in storage — preserves any existing user preferences on updates"
  - "keyboardShortcut stored for display only — actual binding managed by chrome.commands in manifest"

patterns-established:
  - "Sync storage pattern: useStorageSyncValue<T>(key, default) — parallel to useStorageValue for local storage"
  - "First-install seeding: initSyncDefaults(DEFAULT_SETTINGS) called from service worker onInstalled handler"
  - "Type safety: UserSettings interface enforces valid values at compile time for all preference fields"

requirements-completed: [PERS-01, PERS-04]

# Metrics
duration: 1min
completed: 2026-02-24
---

# Phase 3 Plan 01: Settings Storage Foundation Summary

**chrome.storage.sync settings foundation with UserSettings interface, ToneLevel type, DEFAULT_SETTINGS, useStorageSyncValue hook, and initSyncDefaults — enabling all Phase 3 personalization features**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-24T03:22:06Z
- **Completed:** 2026-02-24T03:23:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `ToneLevel` union type and `UserSettings` interface to `types.ts` — type-safe foundation for all user preferences
- Added `DEFAULT_SETTINGS` constant with `tone: 12` (Twelveify brand default) and sensible defaults for all fields
- Added `useStorageSyncValue<T>` hook that reads/writes `chrome.storage.sync` with proper `areaName === 'sync'` guard
- Added `initSyncDefaults` helper for first-install seeding without overwriting existing preferences
- Kept `useStorageValue`, `ExtensionState`, and `DEFAULT_STATE` fully unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add UserSettings interface and DEFAULT_SETTINGS to storage types** - `acbf780` (feat)
2. **Task 2: Add useStorageSyncValue hook to useStorage.ts** - `2f02816` (feat)

**Plan metadata:** committed with docs commit after summary

## Files Created/Modified
- `src/storage/types.ts` - Added ToneLevel, UserSettings, DEFAULT_SETTINGS after existing DEFAULT_STATE
- `src/storage/useStorage.ts` - Added useStorageSyncValue hook and initSyncDefaults export

## Decisions Made
- `ToneLevel` uses literal numbers (`5`, `12`, `18`) and string literals (`'baby'`, `'big_boy'`) — TypeScript union prevents invalid tone values at compile time
- `chrome.storage.sync` chosen over local for `UserSettings` — sync persists across browser restarts and propagates across profiles
- `onChanged` listener guards `areaName === 'sync'` to avoid local storage writes (from FloatingButton, background.ts) incorrectly triggering sync hook re-renders
- `initSyncDefaults` only writes keys absent in storage — safe to call on every install/update without clobbering existing preferences
- `keyboardShortcut` field stored in sync for display only — actual key binding remains under `chrome.commands` control in the manifest

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npx tsc --noEmit` reports `chrome` API errors (TS2304) and JSX errors (TS17004) across the codebase — these are pre-existing infrastructure limitations (43 errors before my changes, same count after, same error pattern). WXT uses Vite which provides `chrome` types and JSX transform at build time, not via standalone `tsc`. My changes introduced zero new errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 personalization features can now import `useStorageSyncValue` from `src/storage/useStorage.ts` and `DEFAULT_SETTINGS`, `UserSettings`, `ToneLevel` from `src/storage/types.ts`
- Service worker should call `initSyncDefaults(DEFAULT_SETTINGS as unknown as Record<string, unknown>)` in its `runtime.onInstalled` handler (03-06 or earlier plan should wire this up)
- No blockers for 03-02, 03-03, 03-04, 03-05, 03-06

---
*Phase: 03-personalization-ux-polish*
*Completed: 2026-02-24*
