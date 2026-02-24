---
phase: 01-foundation-text-selection
plan: 01
subsystem: infra
tags: [wxt, chrome-extension, manifest-v3, react, typescript, vite]

# Dependency graph
requires: []
provides:
  - WXT Chrome extension project scaffold with React 18 + TypeScript
  - Manifest V3 configuration with minimal permissions (storage only)
  - Popup entrypoint (index.html, main.tsx, App.tsx)
  - Build pipeline via WXT + Vite producing .output/chrome-mv3/
  - CSP: script-src 'self'; object-src 'self' (no inline scripts)
  - Placeholder host_permissions for backend API URL
affects:
  - 01-02 (service worker background script builds on this scaffold)
  - 01-03 (content script builds on this scaffold)
  - 02-api-integration (will update host_permissions to real Cloudflare Workers URL)

# Tech tracking
tech-stack:
  added:
    - wxt@0.20.18 (Chrome extension build framework, Vite-based)
    - react@18.3.1
    - react-dom@18.3.1
    - typescript@5.4.5
  patterns:
    - WXT srcDir set to 'src' with entrypoints at src/entrypoints/
    - Manifest config via wxt.config.ts merged into generated manifest.json
    - Functional React components with explicit return type annotation

key-files:
  created:
    - wxt.config.ts
    - package.json
    - tsconfig.json
    - src/entrypoints/popup/App.tsx
    - src/entrypoints/popup/main.tsx
    - src/entrypoints/popup/index.html
    - .gitignore
  modified: []

key-decisions:
  - "Used srcDir: 'src' in wxt.config.ts so WXT resolves entrypoints at src/entrypoints/ (WXT default is root/entrypoints)"
  - "npm create wxt@latest unavailable — scaffolded project manually with identical structure to react-ts template"
  - "Manifest config co-located in wxt.config.ts (no separate public/manifest.json needed — WXT merges at build time)"
  - "Only 'storage' permission granted — principle of least privilege per EXTF-04"

patterns-established:
  - "WXT manifest config pattern: all manifest fields in wxt.config.ts manifest: {} block, WXT merges at build"
  - "Entrypoints location: src/entrypoints/{name}/{name}.html + main.tsx + App.tsx"

requirements-completed: [EXTF-01, EXTF-04]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 01 Plan 01: WXT Extension Scaffold Summary

**WXT Chrome extension scaffolded with React 18 + TypeScript, Manifest V3 configured with storage-only permissions, placeholder backend host_permissions, and self-only CSP — builds cleanly via `npm run build`**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T14:31:51Z
- **Completed:** 2026-02-23T14:34:24Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- WXT project scaffolded with React 18 + TypeScript, building cleanly to `.output/chrome-mv3/`
- Manifest V3 configured with minimal permissions (storage only), placeholder host_permissions, and strict CSP
- Popup entrypoint created with minimal placeholder UI ("Twelveify" / "Select text on any webpage to simplify it.")
- `.gitignore` added to exclude node_modules, .output, and .wxt generated directories

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold WXT project with React 18 and TypeScript** - `e834ad0` (feat)
2. **Task 2: Configure Manifest V3 with permissions, CSP, and host_permissions** - `4dc9b5f` (feat)

## Files Created/Modified

- `wxt.config.ts` - WXT configuration with srcDir, manifest name/version/permissions/CSP/host_permissions
- `package.json` - Project dependencies: wxt, react, react-dom, typescript
- `package-lock.json` - Locked dependency tree
- `tsconfig.json` - Extends WXT-generated .wxt/tsconfig.json
- `src/entrypoints/popup/App.tsx` - Minimal placeholder popup component
- `src/entrypoints/popup/main.tsx` - React root mount
- `src/entrypoints/popup/index.html` - Popup HTML entry
- `.gitignore` - Excludes node_modules, .output, .wxt

## Decisions Made

- Used `srcDir: 'src'` in `wxt.config.ts` because WXT defaults to looking for entrypoints in `./entrypoints/` (root), but the plan specifies `src/entrypoints/` structure — setting `srcDir: 'src'` resolves this.
- Scaffolded manually instead of using `npm create wxt@latest` — the create package is unavailable in the npm registry; used `npx wxt init` but it requires interactive prompts. Manually creating files produces identical output to the react-ts template.
- Manifest config placed in `wxt.config.ts` only (no separate `public/manifest.json`) — WXT merges the `manifest:` block from `wxt.config.ts` into the output manifest at build time. This is the canonical WXT pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added .gitignore**
- **Found during:** Task 1 (Scaffold)
- **Issue:** No .gitignore existed; node_modules, .output, .wxt would be committed without it
- **Fix:** Created `.gitignore` excluding node_modules/, .output/, .wxt/, .env, and OS/editor files
- **Files modified:** `.gitignore`
- **Verification:** `git status` shows node_modules and .output are excluded
- **Committed in:** e834ad0 (Task 1 commit)

**2. [Rule 3 - Blocking] Manual scaffold instead of npm create wxt**
- **Found during:** Task 1 (Scaffold)
- **Issue:** `npm create wxt@latest` returns 404 (package not in registry); `npx wxt init` requires interactive prompts
- **Fix:** Manually created all files matching the WXT react-ts template structure (package.json, tsconfig.json, popup entrypoint files)
- **Files modified:** All Task 1 files
- **Verification:** `npm run build` exits 0, `.output/chrome-mv3/` produced correctly
- **Committed in:** e834ad0 (Task 1 commit)

**3. [Rule 1 - Bug] Added srcDir: 'src' to wxt.config.ts**
- **Found during:** Task 1 (npm install postinstall)
- **Issue:** WXT `postinstall` (wxt prepare) failed with "No entrypoints found in /Users/brunocampos/Twelvify/entrypoints" — WXT defaults to root/entrypoints but plan uses src/entrypoints
- **Fix:** Added `srcDir: 'src'` to `wxt.config.ts` so WXT resolves entrypoints at `src/entrypoints/`
- **Files modified:** `wxt.config.ts`
- **Verification:** `npm install` postinstall passes, `npm run build` exits 0
- **Committed in:** 4dc9b5f (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 missing critical, 1 blocking, 1 bug)
**Impact on plan:** All auto-fixes were essential for project initialization. No scope creep — no features added beyond plan scope.

## Issues Encountered

- `npm create wxt@latest` package not available in npm registry. Resolved by creating project files manually (identical structure to react-ts template).
- WXT `postinstall` failed until `srcDir: 'src'` was added to `wxt.config.ts`.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- WXT scaffold is complete and building cleanly — Plan 02 (service worker) and Plan 03 (content script) can build directly on this foundation
- `wxt.config.ts` manifest configuration is ready to be extended with additional permissions as needed by subsequent plans
- host_permissions placeholder URL (`https://api.simplify.example.com/*`) will be updated to real Cloudflare Workers URL in Phase 2

---
*Phase: 01-foundation-text-selection*
*Completed: 2026-02-23*
