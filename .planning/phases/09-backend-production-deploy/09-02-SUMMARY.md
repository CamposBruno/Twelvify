---
phase: 09-backend-production-deploy
plan: 02
subsystem: infra
tags: [render, render-blueprint, iac, chrome-extension, cors, host-permissions]

# Dependency graph
requires:
  - phase: 09-backend-production-deploy
    provides: phase context, research on Render deployment and backend architecture
provides:
  - render.yaml Render Blueprint IaC config for twelvify-backend service
  - Extension BACKEND_URL pointing to production Render URL
  - wxt.config.ts host_permissions with only production URL (localhost removed)
affects: [10-chrome-web-store, any plan touching backend URL or manifest permissions]

# Tech tracking
tech-stack:
  added: [render.yaml Render Blueprint spec]
  patterns: [IaC for Render deployment, production URL locked before Web Store submission]

key-files:
  created:
    - render.yaml
  modified:
    - src/entrypoints/content.ts
    - wxt.config.ts

key-decisions:
  - "ALLOWED_ORIGINS set to https://twelvify.com only — chrome-extension:// ID deferred until Web Store approval (Phase 10 follow-up)"
  - "render.yaml plan: free tier — upgrade path documented in comments if needed"
  - "localhost removed from host_permissions — extension now production-only for Web Store submission"

patterns-established:
  - "render.yaml Blueprint pattern: rootDir: backend scopes build/start commands to backend/ subdirectory"
  - "Secrets pattern: OPENAI_API_KEY, GIT_SHA, BUILD_TIMESTAMP documented as manual Render dashboard entries"

requirements-completed: [DEPL-01, DEPL-04]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 9 Plan 02: Render IaC Config and Extension Production URL Summary

**render.yaml Blueprint with twelvify-backend service and extension URLs migrated from localhost to https://twelvify-backend.onrender.com**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-26T00:05:41Z
- **Completed:** 2026-02-26T00:06:21Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created render.yaml Render Blueprint IaC config: service name twelvify-backend, rootDir: backend, healthCheckPath: /health, autoDeploy: true, plan: free
- Documented manual secrets (OPENAI_API_KEY, GIT_SHA, BUILD_TIMESTAMP) as comments in render.yaml
- Updated content.ts BACKEND_URL from localhost:3001 to production Render URL, removed TODO comment
- Removed localhost:3001 from wxt.config.ts host_permissions — manifest now has only production URL

## Task Commits

Each task was committed atomically:

1. **Task 1: Create render.yaml in repo root** - `46915fa` (chore)
2. **Task 2: Update extension BACKEND_URL and host_permissions to production Render URL** - `4abdf20` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `render.yaml` - Render Blueprint IaC: web service, node runtime, rootDir: backend, healthCheckPath: /health, ALLOWED_ORIGINS, manual secrets documented
- `src/entrypoints/content.ts` - BACKEND_URL updated to https://twelvify-backend.onrender.com/api/simplify, TODO comment removed
- `wxt.config.ts` - host_permissions localhost:3001 removed, comment updated to reflect production URL

## Decisions Made
- ALLOWED_ORIGINS in render.yaml set to `https://twelvify.com` only — the chrome-extension:// origin with real extension ID must be added post-Web Store approval (Phase 10 follow-up), because the ID is not known until submission
- render.yaml uses `plan: free` (Render free tier) — documented so operator can upgrade to paid tier if cold start latency is unacceptable
- localhost removed from host_permissions — no localhost development mode intended for production extension build

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required for this plan. The render.yaml itself documents which secrets must be set manually in the Render dashboard (OPENAI_API_KEY, GIT_SHA, BUILD_TIMESTAMP).

## Next Phase Readiness
- render.yaml committed to repo root — Render will detect Blueprint on next push
- Extension manifest and content script are production-ready (no localhost references)
- Ready for Plan 03: backend deployment to Render (connect repo, set secrets, trigger deploy)
- CORS ALLOWED_ORIGINS will need the chrome-extension://[ID] appended after Web Store approval (Phase 10)

## Self-Check: PASSED

- FOUND: /Users/brunocampos/Twelvify/render.yaml
- FOUND: /Users/brunocampos/Twelvify/src/entrypoints/content.ts
- FOUND: /Users/brunocampos/Twelvify/wxt.config.ts
- FOUND: /Users/brunocampos/Twelvify/.planning/phases/09-backend-production-deploy/09-02-SUMMARY.md
- FOUND commit: 46915fa (Task 1 - render.yaml)
- FOUND commit: 4abdf20 (Task 2 - extension URL update)

---
*Phase: 09-backend-production-deploy*
*Completed: 2026-02-26*
