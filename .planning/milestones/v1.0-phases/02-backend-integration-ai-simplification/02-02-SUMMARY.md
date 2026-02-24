---
phase: 02-backend-integration-ai-simplification
plan: "02"
subsystem: ui
tags: [chrome-extension, sse, fetch, readablestream, rate-limiting, dom-manipulation, react]

# Dependency graph
requires:
  - phase: 02-01
    provides: Express backend with SSE /api/simplify endpoint and rate limiting
  - phase: 01-04
    provides: FloatingButton component with isLoading/selectedText storage-driven visibility
provides:
  - Real SSE streaming integration: fetch+ReadableStream replaces Phase 1 stub
  - In-place DOM text replacement word-by-word as chunks arrive
  - Client-side soft rate limit (50 req/hr) tracked in chrome.storage
  - Text length validation (>5000 chars) before any API call
  - SIMPLIFY_ERROR and SIMPLIFY_COMPLETE message types in messaging contract
  - errorState field in ExtensionState for error propagation to FloatingButton
  - Updated manifest host_permissions pointing to twelvify-backend.onrender.com
affects:
  - 02-03 (error state UI — FloatingButton now reads errorState, ready for yellow/shake/tooltip)
  - 02-04 (end-to-end testing checkpoint)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ReadableStream SSE parsing via fetch (not EventSource — EventSource lacks POST body support)
    - DOM Range capture before async work to survive user deselection during streaming
    - Scroll position preservation via window.scrollTo after range.deleteContents()
    - Span wrapper for highlight + fade animation, then unwrapped to plain text node
    - Client-side rate limit window tracking: hourWindowStart + simplifyCountThisHour in storage
    - Belt-and-suspenders validation: client checks text length, backend also validates

key-files:
  created: []
  modified:
    - src/messaging/messages.ts
    - src/storage/types.ts
    - src/entrypoints/content.ts
    - src/entrypoints/background.ts
    - src/components/FloatingButton.tsx
    - wxt.config.ts

key-decisions:
  - "fetch+ReadableStream used for SSE instead of EventSource — EventSource doesn't support POST with body"
  - "DOM Range captured before async fetch to preserve selection if user clicks away during streaming"
  - "Client-side rate limit window (50 req/hr) tracked in chrome.storage, not just server-side — belt-and-suspenders"
  - "Background.ts handles SIMPLIFY_ERROR by persisting errorState to storage — FloatingButton reads it reactively"
  - "wxt.config.ts host_permissions updated to twelvify-backend.onrender.com — must update before Web Store submission"
  - "Span wrapper approach for highlight fade: insert, animate background transparent, then unwrap to plain textNode"

patterns-established:
  - "SSE streaming: fetch POST with ReadableStream reader, line-by-line buffer split on newline, parse data: prefix"
  - "Pre-flight checks before API call: rate limit -> text length -> offline -> capture range -> set loading"
  - "Storage-first rate limit: read hourWindowStart, reset if > 1 hour, check count, update on success"

requirements-completed: [SIMP-02, BACK-04, ERRH-04]

# Metrics
duration: 25min
completed: 2026-02-24
---

# Phase 2 Plan 02: Backend Integration Summary

**SSE streaming simplification wired end-to-end: fetch+ReadableStream replaces stub, DOM text replaced word-by-word in-place with client-side rate limiting and text length validation**

## Performance

- **Duration:** 25 min
- **Started:** 2026-02-24T01:04:51Z
- **Completed:** 2026-02-24T01:29:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced Phase 1 handleSimplify() stub with full SSE streaming implementation using fetch + ReadableStream
- Implemented in-place DOM text replacement word-by-word as chunks arrive via textNode.textContent updates
- Added client-side soft rate limit (50 req/hr) tracked via simplifyCountThisHour/hourWindowStart in chrome.storage
- Added SIMPLIFY_ERROR/SIMPLIFY_COMPLETE message types and errorState field to complete the messaging contract
- Updated manifest host_permissions to real backend URL (twelvify-backend.onrender.com)
- FloatingButton now reads errorState with 5-second auto-dismiss

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend message types, storage state, and update manifest host_permissions** - `6e60aeb` (feat)
2. **Task 2: Implement handleSimplify() with SSE streaming, client-side rate limit, and in-place DOM replacement** - `7decb91` (feat)

## Files Created/Modified

- `/Users/brunocampos/Twelvify/src/messaging/messages.ts` - Added SIMPLIFY_COMPLETE and SIMPLIFY_ERROR types, SimplifyCompleteMessage and SimplifyErrorMessage interfaces
- `/Users/brunocampos/Twelvify/src/storage/types.ts` - Added errorState, simplifyCountThisHour, hourWindowStart fields to ExtensionState and DEFAULT_STATE
- `/Users/brunocampos/Twelvify/src/entrypoints/content.ts` - Full async handleSimplify() with SSE streaming, rate limit, length check, offline check, DOM range capture, in-place replacement, highlight animation
- `/Users/brunocampos/Twelvify/src/entrypoints/background.ts` - Added SIMPLIFY_ERROR and SIMPLIFY_COMPLETE cases to persist errorState to storage
- `/Users/brunocampos/Twelvify/src/components/FloatingButton.tsx` - Added errorState hook read with 5-second auto-dismiss effect
- `/Users/brunocampos/Twelvify/wxt.config.ts` - Updated host_permissions to twelvify-backend.onrender.com with comment for Web Store submission

## Decisions Made

- **fetch+ReadableStream instead of EventSource** for SSE: EventSource is GET-only and can't send POST body with text payload.
- **Capture DOM Range before async work**: The user's selection may be gone by the time the first SSE chunk arrives (they may have clicked elsewhere). Range must be cloned synchronously before the first await.
- **Client-side rate limit window**: Server-side rate limiting is authoritative, but client checks prevent optimistic requests that will fail, improving UX and reducing server load.
- **Span wrapper for highlight animation**: Inserting a span around the text node allows CSS background transition, then unwrapping restores a clean DOM state.
- **NOTE**: `wxt.config.ts` host_permissions currently points to `https://twelvify-backend.onrender.com/*`. This URL MUST be updated to the actual deployed backend domain before Chrome Web Store submission.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required for the extension itself. The backend URL (`https://twelvify-backend.onrender.com/api/simplify`) is hardcoded in `src/entrypoints/content.ts`. For production deployment, update both the `BACKEND_URL` constant in content.ts and the host_permissions in wxt.config.ts to match the actual deployed backend.

## Next Phase Readiness

- Extension is fully wired to backend SSE endpoint
- errorState field is ready for Plan 03 to add yellow/shake/tooltip error UI in FloatingButton
- All success criteria for SIMP-02, BACK-04, and ERRH-04 are met
- Manual end-to-end test with real OPENAI_API_KEY is the remaining verification step (Plan 04 checkpoint)

---
*Phase: 02-backend-integration-ai-simplification*
*Completed: 2026-02-24*
