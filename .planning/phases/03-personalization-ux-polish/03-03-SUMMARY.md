---
phase: 03-personalization-ux-polish
plan: 03
subsystem: ui
tags: [chrome-extension, keyboard-shortcut, chrome-commands, manifest-v3, messaging]

# Dependency graph
requires:
  - phase: 03-01
    provides: UserSettings storage foundation with keyboardShortcut field in chrome.storage.sync
  - phase: 02-02
    provides: handleSimplify() in content.ts that will be triggered by the hotkey
provides:
  - wxt.config.ts commands block registering simplify-hotkey with Ctrl+Shift+1 (Command+Shift+1 mac)
  - SimplifyHotkeyMessage type and SIMPLIFY_HOTKEY in ExtensionMessage union
  - chrome.commands.onCommand listener in background.ts routing hotkey to active tab content script
affects: [03-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - chrome.commands API for global keyboard shortcuts registered in manifest commands block
    - Top-level listener registration in defineBackground() for service worker restart safety
    - satisfies keyword for type-safe message literal construction
    - Silent lastError suppression for chrome:// pages where content scripts cannot inject

key-files:
  created: []
  modified:
    - wxt.config.ts
    - src/messaging/messages.ts
    - src/entrypoints/background.ts

key-decisions:
  - "suggested_key uses object with default/mac keys (not flat string) per Chrome commands API spec"
  - "chrome.commands.onCommand listener registered at top level of defineBackground() for MV3 service worker restart safety"
  - "SIMPLIFY_HOTKEY switch case added to handleMessage to prevent Unknown message type errors if routed back through background"
  - "Silent lastError suppression in sendMessage callback handles chrome:// pages where content scripts cannot inject"

patterns-established:
  - "Global keyboard shortcuts: manifest commands block + chrome.commands.onCommand + content script message handler"
  - "Background-to-content routing: chrome.tabs.query active+currentWindow, sendMessage with error suppression"

requirements-completed: [SIMP-03]

# Metrics
duration: 2min
completed: 2026-02-24
---

# Phase 03 Plan 03: Keyboard Shortcut Plumbing Summary

**Ctrl+Shift+1 global keyboard shortcut wired through Chrome commands manifest, background service worker routing, and SIMPLIFY_HOTKEY message type — content script handler in Plan 04**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-24T03:25:56Z
- **Completed:** 2026-02-24T03:27:22Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Registered `simplify-hotkey` command in wxt.config.ts manifest block with Ctrl+Shift+1 default (Command+Shift+1 on Mac) — Chrome now recognizes the shortcut globally, not just when popup is open
- Added `SimplifyHotkeyMessage` interface and `SIMPLIFY_HOTKEY` to both `MessageType` and `ExtensionMessage` unions in messages.ts
- Added `chrome.commands.onCommand` listener at top level of `defineBackground()` routing hotkey to active tab's content script via `SIMPLIFY_HOTKEY` message, with silent error suppression for chrome:// pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Register keyboard shortcut in manifest and add SIMPLIFY_HOTKEY message type** - `103f81b` (feat)
2. **Task 2: Add chrome.commands.onCommand handler to background.ts** - `739bbd5` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `wxt.config.ts` - Added commands block with simplify-hotkey Ctrl+Shift+1 (Command+Shift+1 mac)
- `src/messaging/messages.ts` - Added SimplifyHotkeyMessage interface, SIMPLIFY_HOTKEY to MessageType and ExtensionMessage unions
- `src/entrypoints/background.ts` - Imported SimplifyHotkeyMessage, added chrome.commands.onCommand listener, added SIMPLIFY_HOTKEY switch case

## Decisions Made
- `suggested_key` uses object form `{ default: 'Ctrl+Shift+1', mac: 'Command+Shift+1' }` per Chrome commands API spec (not flat string)
- `chrome.commands.onCommand` listener placed at top level of `defineBackground()` — consistent with MV3 service worker restart safety pattern established in Phase 01-02
- SIMPLIFY_HOTKEY case added to `handleMessage` switch to acknowledge the message gracefully if it ever routes back through background (e.g., during testing)
- Silent `if (chrome.runtime.lastError) {}` in `sendMessage` callback suppresses "Could not establish connection" errors on chrome:// pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npx tsc --noEmit` reports pre-existing errors (chrome globals not found, JSX not configured) because WXT uses its own Vite-based build chain with internally configured TypeScript, not a standalone `tsc` invocation. WXT build (`npx wxt build`) compiles cleanly with zero errors — this is the correct verification for this project.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 03 hotkey plumbing complete — wxt.config.ts registers the command, background routes it to content script
- Plan 04 must add `SIMPLIFY_HOTKEY` message handler to content.ts that calls `handleSimplify()`
- No blockers

---
*Phase: 03-personalization-ux-polish*
*Completed: 2026-02-24*
