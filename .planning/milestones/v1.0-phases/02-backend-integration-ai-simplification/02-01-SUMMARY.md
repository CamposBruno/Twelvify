---
phase: 02-backend-integration-ai-simplification
plan: "01"
subsystem: api
tags: [express, openai, sse, rate-limiting, winston, zod, typescript, cors, dotenv]

# Dependency graph
requires:
  - phase: 01-foundation-text-selection
    provides: Extension scaffold (WXT/React) that will send text to this backend

provides:
  - Express backend at backend/ with POST /api/simplify SSE streaming endpoint
  - GET /health endpoint returning 200 JSON status
  - express-rate-limit middleware: 100 req/hr hard limit per IP+User-Agent fingerprint hash
  - Winston privacy logger: emits only fingerprint hash, token counts, timestamps — never text
  - OpenAI gpt-4o-mini streaming wrapper via streamSimplification() async generator
  - Zod validation enforcing 1-5000 char text input with friendly error messages

affects:
  - 02-02: Extension must POST to this backend's /api/simplify endpoint
  - 02-03: Error messages defined here (rate limit copy, timeout copy) need UI handling
  - 02-04: Deployment target needs OPENAI_API_KEY env var and PORT configuration

# Tech tracking
tech-stack:
  added:
    - express@4.18 (HTTP server, routing, middleware)
    - cors@2.8 (cross-origin resource sharing for extension)
    - dotenv@16 (environment variable loading)
    - zod@3.22 (runtime request validation)
    - winston@3.11 (structured JSON privacy logging)
    - openai@4.50 (OpenAI streaming SDK)
    - express-rate-limit@7.4 (per-fingerprint rate limiting)
    - typescript@5.3 + @types/* (strict TypeScript compilation)
    - ts-node@10 (development runtime)
  patterns:
    - SSE streaming: res.setHeader('Content-Type', 'text/event-stream') + chunked writes
    - Async generator pattern: streamSimplification() yields chunks for-await consumption
    - Privacy-first logging: all logs use hashed fingerprint, never raw IP or text content
    - Fail-fast env validation: Zod schema throws on startup if OPENAI_API_KEY missing
    - Fingerprint-based rate limiting: SHA-256(IP:UserAgent).slice(0,16) as rate limit key

key-files:
  created:
    - backend/src/index.ts
    - backend/src/config/env.ts
    - backend/src/config/constants.ts
    - backend/src/middleware/rateLimit.ts
    - backend/src/middleware/errorHandler.ts
    - backend/src/middleware/logging.ts
    - backend/src/routes/simplify.ts
    - backend/src/routes/health.ts
    - backend/src/services/aiClient.ts
    - backend/src/services/logger.ts
    - backend/src/utils/errors.ts
    - backend/src/utils/validate.ts
    - backend/src/utils/fingerprint.ts
    - backend/package.json
    - backend/tsconfig.json
    - backend/.env.example
    - backend/.gitignore
  modified: []

key-decisions:
  - "Used gpt-4o-mini model — cost-efficient for simplification, upgrade path documented in code comment"
  - "express-rate-limit v7 uses AugmentedRequest type for req.rateLimit access (cast required in handler)"
  - "SSE chosen over WebSockets — simpler for one-way streaming, auto-reconnects, no persistent connection overhead"
  - "SHA-256(IP:UserAgent).slice(0,16) for fingerprint — anonymous rate limiting without user accounts"
  - "backend/.env.local created locally with placeholder key — required for build verification; in .gitignore"
  - "Trust proxy enabled (app.set('trust proxy', 1)) for correct IP resolution behind Vercel/Render/nginx"
  - "10s timeout on res.setTimeout + OPENAI_TIMEOUT_MS for defense-in-depth against hung streams"

patterns-established:
  - "SSE route pattern: setHeader + flushHeaders + for-await stream + res.write(data: JSON) + res.end()"
  - "Privacy logging: always log fingerprint hash, never text/body/IP"
  - "Validation-first: Zod safeParse at top of handler, return early on failure"
  - "inputLengthBin: bin text length as short/medium/long instead of logging exact length"

requirements-completed: [BACK-01, BACK-02, BACK-03, BACK-04]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 2 Plan 01: Express Backend with SSE Streaming and Privacy Logging Summary

**Node.js/Express backend proxy with OpenAI gpt-4o-mini SSE streaming, IP+User-Agent fingerprint rate limiting (100/hr), and Winston privacy logger that never logs text content**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T00:59:44Z
- **Completed:** 2026-02-24T01:02:30Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- POST /api/simplify endpoint streams OpenAI tokens via SSE — extension receives chunks in real-time
- Rate limiter fingerprints users via SHA-256(IP:UserAgent), enforces hard 100 req/hr limit with friendly 429 copy
- Logger emits only fingerprint hash, input length bin, approximate word count, and duration — never text content
- TypeScript compiles cleanly (strict mode, ES2022, CommonJS) with all types verified

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold backend with Express, dependencies, and TypeScript config** - `b3ce09b` (feat)
2. **Task 2: Implement OpenAI client, logger, rate limiter, middleware, routes, and Express app** - `680abf4` (feat)

## Files Created/Modified

- `backend/src/index.ts` - Express app assembly: CORS, JSON parser, trust proxy, middleware chain, routes
- `backend/src/config/env.ts` - Zod env validation, fails fast if OPENAI_API_KEY missing
- `backend/src/config/constants.ts` - Rate limit (100/hr), OpenAI timeout (10s), SSE keepalive config
- `backend/src/middleware/rateLimit.ts` - express-rate-limit with SHA-256 fingerprint keyGenerator, 429 with resetAt
- `backend/src/middleware/errorHandler.ts` - Global Express error handler, privacy-safe logging
- `backend/src/middleware/logging.ts` - Request logger: fingerprint + metadata only, never req.body
- `backend/src/routes/simplify.ts` - POST /api/simplify: Zod validation, SSE headers, OpenAI streaming, timeout
- `backend/src/routes/health.ts` - GET /health: 200 JSON with timestamp
- `backend/src/services/aiClient.ts` - OpenAI client with gpt-4o-mini, streamSimplification() async generator
- `backend/src/services/logger.ts` - Winston structured logger (JSON format, privacy policy documented)
- `backend/src/utils/errors.ts` - Custom error classes: ValidationError, RateLimitError, AITimeoutError
- `backend/src/utils/validate.ts` - Zod schema: text string, min 1, max 5000 chars
- `backend/src/utils/fingerprint.ts` - SHA-256(IP:UserAgent).slice(0,16) fingerprint function
- `backend/package.json` - All dependencies pinned, build/start/dev scripts
- `backend/tsconfig.json` - Strict TypeScript: ES2022, CommonJS, strict, esModuleInterop
- `backend/.env.example` - Template for required environment variables
- `backend/.gitignore` - Excludes node_modules/, dist/, .env, .env.local, logs/

## Decisions Made

- **gpt-4o-mini model selected**: Cost-efficient for text simplification; upgrade path to gpt-4-turbo noted in code comment
- **express-rate-limit v7 type fix**: v7 uses `AugmentedRequest` type for `req.rateLimit` property; required casting `req as AugmentedRequest` in handler callback — documented as deviation below
- **SSE over WebSockets**: One-way data flow, auto-reconnect, simpler implementation, no persistent connection overhead
- **Trust proxy enabled**: Required for correct IP resolution when deployed behind Vercel/Render/nginx proxies
- **Defense-in-depth timeouts**: Both `res.setTimeout(10000)` and `OPENAI_TIMEOUT_MS = 10000` for hung stream protection

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed express-rate-limit v7 TypeScript type error in rate limit handler**
- **Found during:** Task 2 (rateLimit.ts implementation)
- **Issue:** Plan used `req.rateLimit.resetTime` directly but express-rate-limit v7 defines `req` as `AugmentedRequest` type with index signature `[key: string]: RateLimitInfo` — TypeScript strict mode rejected `req.rateLimit` as property access on plain `Request` type
- **Fix:** Imported `AugmentedRequest` from express-rate-limit, cast `req as AugmentedRequest` in handler, then accessed via bracket notation `augmented['rateLimit']`
- **Files modified:** backend/src/middleware/rateLimit.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `680abf4` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type bug)
**Impact on plan:** Type fix required for TypeScript strict mode compliance. Behavior identical to plan spec.

## Issues Encountered

None — compilation error was caught immediately and resolved with proper type import.

## User Setup Required

**External service requires manual configuration before backend can function end-to-end:**

1. Get OpenAI API key from: https://platform.openai.com/api-keys
2. Create `backend/.env.local` (copy from `backend/.env.example`)
3. Replace `OPENAI_API_KEY=sk-placeholder-replace-with-real-key` with your real key
4. Optionally set `ALLOWED_ORIGIN=chrome-extension://YOUR_EXTENSION_ID` for production
5. Verify: `cd backend && npm run dev` — server should start on port 3001

## Next Phase Readiness

- Backend is deployable: `npm run build && npm start` or `npm run dev` for development
- Extension (Phase 02-02) needs to POST to `http://localhost:3001/api/simplify` with `{ text: string }` body and consume SSE stream
- Real OPENAI_API_KEY required for end-to-end testing — placeholder in .env.local will be rejected by OpenAI

---
*Phase: 02-backend-integration-ai-simplification*
*Completed: 2026-02-24*
