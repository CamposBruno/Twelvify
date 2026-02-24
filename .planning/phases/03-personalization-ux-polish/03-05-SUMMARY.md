---
phase: 03-personalization-ux-polish
plan: 05
subsystem: ui
tags: [chrome-extension, react, inline-styles, onboarding, settings-panel, floating-popup]

# Dependency graph
requires:
  - phase: 03-01-personalization-ux-polish
    provides: useStorageSyncValue hook, UserSettings interface, ToneLevel type, DEFAULT_SETTINGS
  - phase: 03-04-personalization-ux-polish
    provides: stubs for onboarding.ts, OnboardingPrompt.tsx, FloatingPopup.tsx (created by content.ts integration)
provides:
  - onboarding.ts with PROMPTS array and getNextOnboardingPrompt logic (tone@3, depth@6, profession@9)
  - OnboardingPrompt.tsx React component for inline preference discovery (3 variants: tone buttons, depth buttons, profession input)
  - FloatingPopup.tsx React component for popup display mode (fixed-position card, fade-in, close button)
  - SettingsPanel.tsx with all 5 user preference settings (tone, depth, profession, displayMode, keyboardShortcut)
  - Updated App.tsx with Twelveify header and embedded SettingsPanel
affects:
  - 03-06 (keyboard shortcut — can now display current shortcut from SettingsPanel)
  - content.ts (already imports OnboardingPrompt and FloatingPopup — stubs replaced with full components)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Inline styles throughout — content script components cannot import CSS; popup uses inline for consistency
    - Draft state pattern for text inputs (professionDraft, shortcutDraft) — avoids writing to sync storage on every keystroke
    - OnboardingPrompt variant dispatch on prompt.id — single component handles all 3 prompt types

key-files:
  created:
    - src/utils/onboarding.ts
    - src/components/OnboardingPrompt.tsx
    - src/components/FloatingPopup.tsx
    - src/entrypoints/popup/SettingsPanel.tsx
  modified:
    - src/entrypoints/popup/App.tsx

key-decisions:
  - "OnboardingPrompt renders all 3 variants (tone/depth/profession) from single component via prompt.id dispatch — avoids three separate components"
  - "Draft state for text inputs in SettingsPanel — save to chrome.storage.sync on blur or Enter, not on each keystroke, to avoid quota issues"
  - "FloatingPopup uses opacity CSS transition (0→1 in 0.2s) via setTimeout(10ms) to trigger fade-in after mount"
  - "ACTIVE_BUTTON_STYLE defined but not used in OnboardingPrompt — inline style chosen per-button for simplicity"

patterns-established:
  - "Draft-then-commit pattern: local useState draft + onBlur/onKeyDown(Enter) commit to storage — for text inputs writing to sync storage"
  - "Inline styles only: all new UI components use React.CSSProperties inline styles, no CSS imports"

requirements-completed: [PERS-02, PERS-03, DISP-02]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 3 Plan 05: UI Components and Settings Panel Summary

**OnboardingPrompt inline preference discovery (tone/depth/profession variants), FloatingPopup fixed-position card display mode, and SettingsPanel with 5 live-sync settings replacing stubbed components from Plan 04**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T03:30:06Z
- **Completed:** 2026-02-24T03:32:21Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced `src/utils/onboarding.ts` stub with full `PROMPTS` array and `getNextOnboardingPrompt` — triggers tone at simplifyCount >= 3, depth at >= 6, profession at >= 9; respects dismissedPrompts
- Replaced `src/components/OnboardingPrompt.tsx` stub with full inline card component — tone (5 buttons: Baby/5/12/18/Big Boy), depth (3 buttons: Light/Medium/Detailed), profession (text input + Save), all with "Not now →" dismiss
- Replaced `src/components/FloatingPopup.tsx` stub with fixed-position card at bottom-right (z-index 2147483646, below FloatingButton), opacity fade-in, close button
- Created `src/entrypoints/popup/SettingsPanel.tsx` with 5 settings using `useStorageSyncValue` for live read/write, `initSyncDefaults` called on mount
- Updated `src/entrypoints/popup/App.tsx` with Twelveify header (spark SVG icon) and embedded SettingsPanel

## Task Commits

Each task was committed atomically:

1. **Task 1: Create onboarding utility, OnboardingPrompt and FloatingPopup components** - `1bf4edb` (feat)
2. **Task 2: Build SettingsPanel and update popup App.tsx** - `7049dc4` (feat)

**Plan metadata:** committed with docs commit after summary

## Files Created/Modified
- `src/utils/onboarding.ts` - PROMPTS array + getNextOnboardingPrompt (tone@3, depth@6, profession@9; filters dismissedPrompts)
- `src/components/OnboardingPrompt.tsx` - Inline card component for preference discovery (3 prompt variants via id dispatch)
- `src/components/FloatingPopup.tsx` - Fixed-position card for popup display mode (fade-in animation, close button, z-index 2147483646)
- `src/entrypoints/popup/SettingsPanel.tsx` - Full settings UI with 5 live-sync settings sections
- `src/entrypoints/popup/App.tsx` - Twelveify header + SettingsPanel embedded

## Decisions Made
- OnboardingPrompt renders all 3 variants from a single component via `prompt.id` dispatch — avoids 3 separate components for tone/depth/profession
- Draft state pattern for text inputs (profession, keyboard shortcut) — writes to `chrome.storage.sync` on blur or Enter keypress only, not every keystroke, to avoid sync storage quota issues
- FloatingPopup fade-in uses `setTimeout(10ms)` to defer opacity `0→1` switch to next frame, triggering CSS transition after mount
- `initSyncDefaults(DEFAULT_SETTINGS as unknown as Record<string, unknown>)` called in `useEffect(() => {}, [])` in SettingsPanel — seeds first-install defaults without overwriting existing prefs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npx tsc --noEmit` reports pre-existing JSX/chrome infrastructure errors (same pattern as previous plans — WXT uses Vite for JSX transform and chrome API types at build time, not standalone tsc). Zero new errors introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 UI components are now fully implemented and replace Plan 04 stubs
- content.ts already imports `OnboardingPrompt`, `FloatingPopup`, and `getNextOnboardingPrompt` — stubs are transparently replaced
- Extension popup now shows full settings UI when user clicks the toolbar icon
- Plan 06 (keyboard shortcut final wiring) can reference SettingsPanel for display

---
*Phase: 03-personalization-ux-polish*
*Completed: 2026-02-24*
