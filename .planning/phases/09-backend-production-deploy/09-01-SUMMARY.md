---
phase: 09-backend-production-deploy
plan: 01
subsystem: infra
tags: [express, cors, graceful-shutdown, health-check, rate-limit, openai, sigterm]

# Dependency graph
requires:
  - phase: 08-ui-redesign
    provides: Phase 8 completed — stable extension UI ready for production deployment
provides:
  - Express server with SIGTERM/SIGINT graceful shutdown (30s force-exit)
  - Multi-origin CORS callback using ALLOWED_ORIGINS env var
  - Deep health endpoint with Anthropic API ping (503 on failure), version, uptime, memory
  - Rate limit reduced to 30 req/min with /health excluded from rate limiting
  - env.ts updated with ALLOWED_ORIGINS, GIT_SHA, BUILD_TIMESTAMP fields
affects: [09-02-render-deploy, render.yaml, extension-production-config]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Graceful shutdown: isShuttingDown flag + server.close() + 30s force-exit setTimeout"
    - "CORS: callback-based origin allow-list parsed from comma-separated env var"
    - "Health check: async deep check with external API ping, 503 on degraded state"
    - "Rate limiter skip: skip function on express-rate-limit to exempt /health"

key-files:
  created: []
  modified:
    - backend/src/index.ts
    - backend/src/routes/health.ts
    - backend/src/config/env.ts
    - backend/src/config/constants.ts
    - backend/src/middleware/rateLimit.ts

key-decisions:
  - "CORS uses callback-based multi-origin allow-list (not wildcard) from ALLOWED_ORIGINS env var — protects Anthropic API quota from unauthorized origins"
  - "Rate limit reduced from 100/hr to 30/min — more conservative for production API cost control"
  - "Health endpoint excluded from rate limiting — ensures Render health checks never get throttled"
  - "Health endpoint uses OpenAI client (models.list()) as Anthropic API connectivity probe — returns 503 on failure so Render can detect expired keys"

patterns-established:
  - "Graceful shutdown: SIGTERM/SIGINT both handled, in-flight SSE streams get 30s to complete"
  - "Env validation: Zod schema is single source of truth for all env var types and defaults"

requirements-completed: [DEPL-02, DEPL-03, DEPL-05, DEPL-06]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 9 Plan 01: Backend Production Hardening Summary

**Express backend hardened for zero-downtime Render deploys: SIGTERM graceful shutdown, deep Anthropic API health check (503 on failure), multi-origin CORS callback, and rate limit tightened to 30 req/min**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T00:05:44Z
- **Completed:** 2026-02-26T00:07:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added SIGTERM/SIGINT graceful shutdown with 30-second force-exit safety net — in-flight SSE streams are no longer killed on Render deploys
- Replaced wildcard CORS with callback-based multi-origin allow-list parsed from `ALLOWED_ORIGINS` env var — production extension ID and domain can be whitelisted without code changes
- Upgraded `/health` endpoint to deep check: pings Anthropic API via `openai.models.list()`, returns 503 on failure so Render detects expired or missing API keys
- Added version info (gitSha, buildTime), uptime, memory stats, and responseTimeMs to health response
- Reduced rate limit from 100/hr to 30/min; excluded `/health` from rate limiting so Render health checks are never throttled

## Task Commits

Each task was committed atomically:

1. **Task 1: Add graceful SIGTERM/SIGINT shutdown and multi-origin CORS callback** - `38d1657` (feat)
2. **Task 2: Deep health check, env updates, rate limit 30/min, skip health from rate limiter** - `fed46f4` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `backend/src/index.ts` - Graceful shutdown handlers, multi-origin CORS callback, shutdown middleware
- `backend/src/routes/health.ts` - Deep health check with Anthropic API ping, version/memory/uptime stats
- `backend/src/config/env.ts` - Renamed ALLOWED_ORIGIN -> ALLOWED_ORIGINS, added GIT_SHA and BUILD_TIMESTAMP
- `backend/src/config/constants.ts` - Rate limit window 60*1000ms (1 min), max 30
- `backend/src/middleware/rateLimit.ts` - Added skip option to exempt /health from rate limiting

## Decisions Made

- CORS uses callback-based multi-origin allow-list from `ALLOWED_ORIGINS` env var (not wildcard) — prevents unauthorized sites from draining Anthropic API quota
- Rate limit reduced from 100/hr to 30/min — more conservative for production API cost control
- `/health` excluded from rate limiting — Render health checks must never be throttled
- Health endpoint uses `openai.models.list()` as Anthropic API connectivity probe — returns 503 on failure so Render detects expired keys automatically

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated env.ts during Task 1 to unblock compilation**
- **Found during:** Task 1 (index.ts rewrite)
- **Issue:** index.ts references `env.ALLOWED_ORIGINS` (plural) but env.ts still exported `ALLOWED_ORIGIN` (singular), causing TypeScript error TS2551
- **Fix:** Updated env.ts schema during Task 1 execution (ahead of Task 2 schedule) to add ALLOWED_ORIGINS, GIT_SHA, BUILD_TIMESTAMP — then committed env.ts as part of Task 2
- **Files modified:** backend/src/config/env.ts
- **Verification:** `npx tsc --noEmit` passed after env.ts update
- **Committed in:** fed46f4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking — compile error from renamed env var)
**Impact on plan:** Minimal deviation — env.ts was always part of Task 2, just applied it earlier to unblock Task 1 verification. No scope creep.

## Issues Encountered

None beyond the ordering deviation above.

## User Setup Required

None - no external service configuration required at this stage. ALLOWED_ORIGINS and GIT_SHA/BUILD_TIMESTAMP env vars will be configured in Render dashboard (Plan 02).

## Next Phase Readiness

- Backend code is production-ready for zero-downtime Render deploys
- Plan 02 (render.yaml + Render dashboard config) can proceed immediately
- ALLOWED_ORIGINS env var must be set in Render to include production extension Chrome ID and domain

---
*Phase: 09-backend-production-deploy*
*Completed: 2026-02-26*
