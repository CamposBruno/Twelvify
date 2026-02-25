# Phase 9: Backend Production Deploy - Research

**Researched:** 2026-02-25
**Domain:** Express.js production deployment, Render cloud platform, graceful shutdown, health monitoring, CORS configuration
**Confidence:** HIGH

## Summary

Phase 9 requires deploying a production-ready Express backend to Render with zero-downtime deploys, proper graceful shutdown handling, health monitoring, CORS scoping for Chrome extension and landing page, and rate limiting. The Twelvify backend is already mostly well-designed—Winston logging, express-rate-limit, Zod validation, and fingerprinting are in place. The main gaps are:

1. **Graceful shutdown handler** — currently missing; SIGTERM handling required for zero-downtime deploys
2. **Enhanced health check** — currently just returns `{ status: 'ok' }`; needs version info and dependency verification
3. **render.yaml file** — infrastructure-as-code for reproducible deployment
4. **CORS production hardening** — currently allows wildcard; needs scoping to specific origins

**Primary recommendation:** Implement graceful shutdown with SIGTERM handler, enhance the health endpoint with version/dependency checks, create render.yaml with health check configuration, and harden CORS with environment-driven allow lists.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Environment & secrets:** Store all secrets (Anthropic API key, etc.) in Render's dashboard environment variables — no external vault
- **Node environment:** Use standard NODE_ENV=production on Render, NODE_ENV=development locally
- **Fresh Render setup:** Phase includes account/service creation steps
- **Production build:** Extension production build has the Render URL hardcoded; dev build uses localhost
- **CORS policy:**
  - Extension ID not yet known — allow chrome-extension://* during development, lock to specific ID once published
  - twelvify.com is already deployed and will call the backend — include in CORS whitelist
  - Strict CORS always — same whitelist approach in dev and prod, with localhost explicitly added for dev
  - Backend serves extension + landing page only — no public API, no additional origins needed
- **Deploy workflow:**
  - Auto-deploy on push to main branch
  - Use Render's built-in zero-downtime deploys with automatic rollback on health check failure
  - render.yaml checked into repo — Infrastructure as Code, version controlled and reproducible
- **Health & monitoring:**
  - Deep health check: verify server running, Anthropic API connectivity (actual minimal API call), memory usage
  - Health endpoint includes version info: git SHA and build timestamp for debugging
  - Health endpoint is public — standard for load balancers and monitoring
  - Rely on Render's built-in monitoring — no external uptime service
  - Structured JSON logs for better searchability and parsing in Render's log viewer
- **Rate limiting:**
  - Basic rate limiting included in this phase — 30 requests/min per IP (updated from current 100/hr)
  - Conservative threshold to protect Anthropic API costs

### Claude's Discretion

- Exact render.yaml configuration details
- JSON log format and library choice (Winston is already in use)
- Rate limiting middleware implementation
- Health check response structure
- Build script configuration

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEPL-01 | Express backend is deployed and running on Render with production environment variables | render.yaml configuration, Render env var setup, package.json build/start scripts |
| DEPL-02 | Backend exposes `/health` endpoint returning 200 OK for Render health checks | Enhanced health endpoint with version info, API connectivity check, memory reporting |
| DEPL-03 | Backend handles SIGTERM gracefully for zero-downtime deploys | SIGTERM handler, server.close(), connection draining pattern |
| DEPL-04 | Extension manifest points to production Render URL (no localhost references in production build) | Build-time environment variable substitution in extension code |
| DEPL-05 | CORS configuration allows requests from the Chrome extension in production | Dynamic CORS origin checking, chrome-extension:// pattern handling, callback-based configuration |
| DEPL-06 | CORS configuration allows requests from twelvify.com landing page (playground demo) | Environment-driven allow lists, multiple origin support in CORS config |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express.js | 4.18.2 | Web framework | Industry standard for Node.js APIs; already in use |
| cors | 2.8.5 | CORS middleware | Handles cross-origin requests cleanly; already in use |
| dotenv | 16.3.1 | Environment variable loading | Standard for development; Render dashboard handles prod vars |
| Winston | 3.11.0 | Structured JSON logging | Production-ready; already in use; supports JSON format natively |
| express-rate-limit | 7.4.0 | Rate limiting | Single-node deployment sufficient; already in use |
| OpenAI SDK | 4.50.0 | Anthropic API client | For health check connectivity verification |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.22.4 | Request validation | Schema validation for `/simplify` endpoint; already in use |
| TypeScript | 5.3.3 | Type safety | Compilation to JavaScript for production; already in use |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Winston | Pino | Pino is faster; Winston has better integration with Express and wider ecosystem |
| render.yaml | Manual Render setup | render.yaml ensures reproducibility and version control; manual setup loses this |
| Single health endpoint | Separate liveness/readiness | Kubernetes-style split is overkill for single Render service; one endpoint suffices |

**Installation:**
```bash
npm install express cors dotenv zod winston openai express-rate-limit
npm install --save-dev typescript @types/node @types/express @types/cors ts-node
```

(All dependencies already present in backend/package.json)

## Architecture Patterns

### Recommended Graceful Shutdown Pattern

```typescript
// Source: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
// Node.js documentation for graceful shutdown

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Track active connections
let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  isShuttingDown = true;

  // Stop accepting new connections
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds (Render's SIGKILL timeout)
  setTimeout(() => {
    console.error('Forced shutdown after 30s');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### Enhanced Health Check Pattern

```typescript
// Source: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
// https://nodeshift.dev/nodejs-reference-architecture/operations/healthchecks/

healthRouter.get('/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: {
      buildTime: process.env.BUILD_TIMESTAMP || 'unknown',
      gitSha: process.env.GIT_SHA || 'unknown',
    },
    uptime: process.uptime(),
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };

  // Test Anthropic API connectivity with minimal call
  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    await openai.models.list(); // Minimal API call to verify credentials
    checks.apiConnectivity = 'ok';
  } catch (error) {
    checks.apiConnectivity = 'failed';
    return res.status(503).json(checks);
  }

  res.status(200).json(checks);
});
```

**Why this pattern:**
- Render's health check pings this endpoint every 30 seconds (default)
- If endpoint returns non-2xx for 30+ seconds, Render considers deployment failed and rolls back
- Version info (git SHA, build timestamp) aids debugging production issues
- API connectivity test catches expired/invalid credentials immediately
- Memory reporting helps identify memory leaks early

### CORS Production Pattern

```typescript
// Source: https://oneuptime.com/blog/post/2026-01-22-nodejs-fix-cors-errors/view
// https://expressjs.com/en/resources/middleware/cors.html

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (mobile apps, curl requests, server-to-server)
    if (!origin) return callback(null, true);

    // Check if origin is in allow list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  credentials: false,
  maxAge: 3600,
};

app.use(cors(corsOptions));
```

**Environment variable format (for render.yaml):**
```
ALLOWED_ORIGINS=chrome-extension://abc123defghi,https://twelvify.com,http://localhost:3000
```

### Render.yaml Infrastructure Pattern

```yaml
# Source: https://render.com/docs/blueprint-spec
# https://render.com/docs/deploy-node-express-app

services:
  - type: web
    name: twelvify-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: ALLOWED_ORIGINS
        value: chrome-extension://[EXT_ID],https://twelvify.com,http://localhost:3000
      - key: LOG_LEVEL
        value: info
      # OPENAI_API_KEY, GIT_SHA, BUILD_TIMESTAMP added via Render dashboard
    healthCheck:
      path: /health
      interval: 30  # seconds
      timeout: 5    # seconds
      initialDelay: 10
    deploy:
      strategy: rolling  # Zero-downtime
      timeoutSeconds: 600
```

### Recommended Project Structure (No Changes)

Backend already follows good structure:
```
src/
├── config/          # env.ts, constants.ts
├── middleware/      # cors, logging, rate limiting, error handling
├── routes/          # /health, /simplify, /playground endpoints
├── services/        # OpenAI client, logger
└── utils/           # validation, fingerprinting, errors
```

This structure naturally supports production deployment.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CORS header management | Custom header logic | `cors` npm package | Edge cases (preflight, credentials, origin wildcards) are complex; library handles them correctly |
| Rate limiting tracking | In-memory Map or array | `express-rate-limit` | Requires connection counting, window sliding, TTL cleanup; library handles distributed scenarios too |
| Request logging | Manual console.log | `winston` | Structured JSON, log levels, transports, timestamps; already in use and production-ready |
| Graceful shutdown | Partial shutdown.close() | Full SIGTERM handler with timeout | Without force-shutdown timer, process hangs; Render kills after 60s; proper pattern prevents data loss |
| Health checks | Simple /health response | Full check with API call + memory | Render can't detect expired credentials or memory leaks; false positives cause unnecessary rollbacks |

**Key insight:** Production deployment is not about writing code—it's about handling edge cases (concurrent connections, signal timing, partial failures). Off-the-shelf libraries exist because these problems are genuinely hard.

## Common Pitfalls

### Pitfall 1: Missing Graceful Shutdown Handler

**What goes wrong:**
- Render sends SIGTERM when deploying new version
- App doesn't handle it, keeps accepting requests
- Render waits 60 seconds, then sends SIGKILL
- Active requests cut off mid-stream; SSE connections drop without completion
- Client sees incomplete simplification, thinks feature is broken

**Why it happens:**
- Node.js doesn't exit on SIGTERM by default
- Developers think `server.close()` is automatic
- Tests pass locally (developers Ctrl+C, which is SIGINT not SIGTERM)

**How to avoid:**
- Add explicit SIGTERM/SIGINT handler to index.ts
- Call `server.close()` to stop accepting new connections
- Set 30-second timeout (Render's SIGKILL window)
- Log when shutdown begins and completes

**Warning signs:**
- Requests timeout during deployment
- Partial SSE streams in production (working fine in dev)
- Deploy logs show "SIGKILL" instead of clean exit

### Pitfall 2: Health Check Always Returns 200

**What goes wrong:**
- Health endpoint returns `{ status: 'ok' }` without checking dependencies
- Anthropic API key expires → backend can't call OpenAI → 500 errors
- Health check still returns 200 → Render never triggers rollback
- Production is broken but looks healthy; users see API errors

**Why it happens:**
- Developers assume "if server is running, it's healthy"
- Health checks are an afterthought, not a real test

**How to avoid:**
- Make health check do a real Anthropic API call (can be minimal: `models.list()`)
- Include version info (git SHA, build timestamp) to debug mismatches
- Report memory usage to catch leaks before they crash
- Return 503 if any check fails (Render will treat as unhealthy)

**Warning signs:**
- Health endpoint never hits the Anthropic API during monitoring
- Can't tell from logs which version is running in production
- Memory usage grows unbounded in production

### Pitfall 3: CORS Wildcard in Production

**What goes wrong:**
- CORS configured with `origin: '*'` to speed up development
- Deployed to production as-is
- Any website can now call `/api/simplify` and burn your Anthropic API quota
- Users' text simplifications might leak to unintended callers (privacy issue)

**Why it happens:**
- Wildcard works everywhere, tempting to leave it
- CORS errors are annoying during development, developers disable checking
- ENV_ALLOW_ORIGIN mistake in environment variable

**How to avoid:**
- Never use `origin: '*'` in production code
- Environment variable parsing must fail loudly if missing/empty
- Use a callback function that checks against allow list
- Include localhost only in dev environment variable
- Document expected format: comma-separated origins

**Warning signs:**
- `ALLOWED_ORIGINS` env var missing from render.yaml
- Production manifest still hardcoded to localhost backend
- CORS header shows `Access-Control-Allow-Origin: *`

### Pitfall 4: Not Updating Extension Manifest for Production

**What goes wrong:**
- Extension development uses `http://localhost:3001` hardcoded in manifest
- Extension builds for production, still has localhost
- Chrome Web Store submission rejects with "manifest references localhost"
- Or: extension submits OK, but production requests go to localhost (404), feature broken

**Why it happens:**
- Manifest is built at compile time, not runtime
- If manifest is committed with localhost, it gets deployed
- Build process doesn't substitute the Render URL

**How to avoid:**
- Store backend URL in extension/src/config.ts with environment variable substitution
- Build step: `sed` or `webpack` plugin replaces __BACKEND_URL__ with actual URL
- Commit only the template, never the final value
- Verify in extension dist/ that final manifest has Render URL, not localhost
- Add git hook to prevent committing manifest with localhost

**Warning signs:**
- manifest.json in dist/ contains localhost
- Extension network requests fail in production
- manifest.json source-controlled with absolute URL (should be relative or templated)

### Pitfall 5: Rate Limiting Doesn't Scale Across Deploys

**What goes wrong:**
- Rate limiter uses in-memory store
- During deploy, old instance shuts down, memory cleared
- New instance starts with reset counters
- Attacker can burst twice the request limit by timing around deploy
- Rate limit is defeated during each zero-downtime deploy

**Why it happens:**
- `express-rate-limit` defaults to memory store
- Works fine for single instance, but breaks with multiple/rotating instances
- Developer assumes Render's architecture is transparent

**How to avoid:**
- For current phase: acknowledge limitation (single instance on Render)
- Document that rate limiting resets on deploy (acceptable for now)
- If multi-instance needed later: use Redis store with `rate-limit-redis`
- Include note in PLAN: "Scale to Redis if deployment creates multiple instances"

**Warning signs:**
- Requests spike exactly when deploy happens
- Rate limit headers show reset immediately after deploy
- Load test shows doubled request limits

## Code Examples

Verified patterns from official sources:

### Graceful Shutdown with SIGTERM

```typescript
// Source: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html

import express from 'express';

const app = express();
let isShuttingDown = false;

app.get('/api/simplify', (req, res) => {
  if (isShuttingDown) {
    // Reject new requests during shutdown
    res.status(503).json({ error: 'Server is shutting down' });
    return;
  }
  // Handle request normally
  res.json({ ok: true });
});

const server = app.listen(3001, () => {
  console.log('Server listening on port 3001');
});

const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, starting graceful shutdown...`);
  isShuttingDown = true;

  // Stop accepting new connections
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### Health Check with Dependency Verification

```typescript
// Source: https://nodeshift.dev/nodejs-reference-architecture/operations/healthchecks/

import { Router } from 'express';
import { OpenAI } from 'openai';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  const startTime = Date.now();

  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: {
      gitSha: process.env.GIT_SHA || 'unknown',
      buildTime: process.env.BUILD_TIMESTAMP || 'unknown',
    },
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    checks: {
      anthropic: 'pending',
    },
  };

  // Test Anthropic API connectivity
  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    await openai.models.list(); // Minimal call to verify credentials
    checks.checks.anthropic = 'ok';
  } catch (error) {
    checks.checks.anthropic = 'failed';
    checks.status = 'degraded';
    return res.status(503).json(checks);
  }

  const durationMs = Date.now() - startTime;
  checks.responseTimeMs = durationMs;

  res.status(200).json(checks);
});
```

### CORS Configuration with Origin Callback

```typescript
// Source: https://expressjs.com/en/resources/middleware/cors.html

import cors from 'cors';

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (same-site requests, mobile apps, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is in allow list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  credentials: false,
  maxAge: 3600, // Preflight cache for 1 hour
};

app.use(cors(corsOptions));
```

### Rate Limit Configuration for Production

```typescript
// Source: https://betterstack.com/community/guides/scaling-nodejs/rate-limiting-express/

import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 30,              // 30 requests per minute per IP (conservative for API costs)
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  keyGenerator: (req) => {
    // Use fingerprint instead of raw IP for privacy
    return hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? '');
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Try again later.',
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Console.log everywhere | Structured JSON logging (Winston) | 2020+ | Production logs are searchable and parseable |
| In-memory rate limiting | express-rate-limit with memory store | 2015+ (mature now in 2026) | Simple single-instance deployment; scales to Redis if needed |
| Manual SIGTERM handling | Process signal handlers with timeout | 2014+ (Node.js best practice) | Prevents data loss and partial failures during deploys |
| Wildcard CORS (`*`) | Callback-based origin whitelist | 2023+ | Security best practice; prevents API quota theft |
| Simple health check | Deep health checks with dependency verification | 2019+ | Catches issues before users see them; enables automated rollback |

**Deprecated/outdated:**
- **Callback-based CORS (old):** Older code used hard-coded regex patterns. Modern approach uses environment-driven allow lists.
- **Forever.js, StrongLoop Process Manager:** Replaced by process managers like systemd or cloud platform tooling (Render handles this).
- **Manual error tracking:** Replaced by structured logging + analytics.

## Open Questions

1. **Build timestamp injection**
   - What we know: Health endpoint should include `BUILD_TIMESTAMP` and `GIT_SHA` for debugging
   - What's unclear: How to inject these at build time in Render? (Environment variable? Build script?)
   - Recommendation: Add to render.yaml `buildCommand` — set env vars before `npm run build`; frontend code reads from `process.env.BUILD_TIMESTAMP`

2. **Redis for rate limiting scale**
   - What we know: Current rate limiter uses memory; acceptable for single instance
   - What's unclear: When should we migrate to Redis?
   - Recommendation: Document in PLAN as future work; flag if Render shows multiple instances running

3. **Chrome extension ID for CORS**
   - What we know: Extension ID is not yet known (assigned by Chrome Web Store post-submission)
   - What's unclear: Should we commit a placeholder? How to update CORS on production after ID is assigned?
   - Recommendation: Plan Phase 10 task to update ALLOWED_ORIGINS after extension approval; document the process

## Sources

### Primary (HIGH confidence)

- [Express.js Health Checks and Graceful Shutdown](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html) — Official Express docs; covers SIGTERM patterns and health endpoints
- [Render Blueprints (IaC) – Render Docs](https://render.com/docs/infrastructure-as-code) — Official Render documentation; render.yaml structure and health check configuration
- [Render Environment Variables and Secrets – Render Docs](https://render.com/docs/configure-environment-variables) — Official documentation for Render env var management
- [Node.JS Reference Architecture - Health Checks](https://nodeshift.dev/nodejs-reference-architecture/operations/healthchecks/) — Best practices for health check design
- [cors npm package](https://www.npmjs.com/package/cors) — Official documentation for CORS callback function
- [express-rate-limit npm package](https://www.npmjs.com/package/express-rate-limit) — Official documentation for rate limiting configuration

### Secondary (MEDIUM confidence)

- [How to Build a Graceful Shutdown Handler in Node.js](https://oneuptime.com/blog/post/2026-01-06-nodejs-graceful-shutdown-handler/view) — Verified with official Express docs; current best practices
- [Master Express Graceful Shutdowns for Zero-Downtime Deploys](https://jsmastery.com/blogs/master-express-graceful-shutdowns-for-zero-downtime-deploys) — Community resource aligned with official patterns
- [How to implement a health check in Node.js - LogRocket Blog](https://blog.logrocket.com/how-to-implement-a-health-check-in-node-js/) — Practical implementation guide; verified against official docs
- [How to Fix CORS Errors in Node.js Express](https://oneuptime.com/blog/post/2026-01-22-nodejs-fix-cors-errors/view) — Recent (2026-01-22); covers production CORS patterns
- [Cross-Origin Resource Sharing (CORS) in Chrome Extensions | Reintech media](https://reintech.io/blog/cors-chrome-extensions) — Chrome extension-specific CORS guidance
- [How to Add Rate Limiting to Express APIs](https://oneuptime.com/blog/post/2026-02-02-express-rate-limiting/view) — Current best practices; recent publication
- [Rate Limiting in Express.js | Better Stack Community](https://betterstack.com/community/guides/scaling-nodejs/rate-limiting-express/) — Production-focused guide
- [Deploy a Node Express App on Render – Render Docs](https://render.com/docs/deploy-node-express-app) — Official Render guide for Node.js deployment

### Tertiary (LOW confidence - reference only)

- [Render vs Vercel (2026): Which platform suits your app architecture better?](https://northflank.com/blog/render-vs-vercel) — Comparative analysis; useful context but not primary source
- [How to Configure Node.js for Production with Environment Variables](https://oneuptime.com/blog/post/2026-01-06-nodejs-production-environment-variables/view) — General practices; specific to Render via primary sources

## Metadata

**Confidence breakdown:**
- **Standard Stack:** HIGH - All libraries already in use, versions verified in package.json
- **Architecture Patterns:** HIGH - Express and Render official docs cover all patterns; health check pattern from Node.js reference architecture
- **Pitfalls:** MEDIUM-HIGH - Based on documented production issues and community reports (verified across multiple sources)
- **Render Configuration:** HIGH - Official render.yaml spec and docs reviewed
- **CORS & Rate Limiting:** HIGH - Express official docs + library docs + verified best practices

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (30 days; Render/Express stable; Node.js LTS track; modest change velocity in this domain)

**Gaps that remain:**
- Exact build timestamp injection method (will need to test with Render's build system)
- Chrome extension ID (assigned after Web Store submission; Phase 10 follow-up)
- Potential need for Redis migration (single-instance assumption holds for v1.2 launch)
