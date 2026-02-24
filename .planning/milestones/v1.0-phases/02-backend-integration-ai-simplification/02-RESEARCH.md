# Phase 2: Backend Integration & AI Simplification - Research

**Researched:** 2026-02-23
**Domain:** Backend API proxy, rate limiting, streaming responses, error handling, anonymous user tracking
**Confidence:** HIGH (stack verified with official docs and recent sources)

## Summary

Phase 2 requires building a backend proxy that mediates all AI API calls from the extension, implements rate limiting per anonymous user, and provides graceful error handling with friendly messaging. The extension will send text to the backend over HTTPS, receive streamed responses via Server-Sent Events (SSE), and replace text in-page as it arrives.

The key architectural decision is using SSE over WebSockets: SSE is simpler for one-way streaming (server → client), requires no persistent connection complexity, and pairs naturally with Express middleware. The backend will use express-rate-limit for per-user rate limiting via IP+User-Agent fingerprinting, log only metadata (never text content), and stream responses word-by-word to enable the visual typing effect.

**Primary recommendation:** Build a Node.js/Express backend with SSE streaming, express-rate-limit middleware, and OpenAI API integration via the official Node.js SDK. Implement request validation via HTTPS and response signing for integrity. Use IP+User-Agent hashing for anonymous rate-limit identifiers.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Simplification Output:**
- Adaptive reading level: adjust simplification intensity based on source complexity
- Preserve original structure: paragraphs, bullet points, headings stay intact
- Replace jargon with plain language (no keep-and-explain)
- Length/brevity: Claude's discretion (balance shorter vs. clearer)
- Blend seamlessly: no highlight border on replaced section
- Always casual/friendly tone regardless of source formality
- Numbers, dates, proper nouns left untouched
- Preserve code snippets, formulas, technical notation as-is
- Always attempt simplification regardless of selection length
- Support any language
- Preserve rich formatting (bold, italic, links)
- Preserve citations, footnotes, reference links

**Processing Experience:**
- Streaming text replacement: word-by-word, replacing original progressively
- Brief highlight then fade after completion (1-2 seconds)
- Block concurrent requests: disable button during processing
- Button shows spinner replacing icon during processing
- Always show streaming effect even for fast responses (<500ms)
- No audio or haptic feedback
- Preserve scroll position during text replacement

**Error Presentation:**
- Button turns warning yellow with shiver/shake animation
- Tooltip bubble appears attached to floating button
- Auto-dismiss after ~5 seconds, user can dismiss sooner
- Sarcastic, playful tone (e.g., "Wow, no internet. Shocking.")
- Rate limit error shows exact reset time (e.g., "Chill, I need a break. Try again in 12 minutes.")

**Trigger Flow:**
- Immediate action on click — no confirmation step
- No text selected → show sarcastic hint tooltip (e.g., "Select some text first, genius")
- Keep Phase 1 button visibility behavior
- Button hides/fades after successful simplification, reappears on next selection

### Claude's Discretion

- Backend architecture choices (framework, hosting, deployment)
- AI prompt engineering for simplification quality
- Rate limiting implementation details
- Request validation approach
- Exact streaming implementation (SSE vs WebSocket vs other)
- Exact animation timings and easing curves
- Specific sarcastic error message copy (tone is set, exact wording is flexible)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

Phase 2 must address these 9 requirements to be complete:

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIMP-02 | User can click floating icon to trigger AI-powered text simplification | SSE streaming enables real-time visual feedback; button disabled during processing (spinner shown) prevents concurrent requests |
| BACK-01 | Backend proxy server handles all AI API calls (user never sees API keys) | Node.js/Express architecture keeps API keys in backend environment variables; extension sends plaintext, backend calls OpenAI |
| BACK-02 | Backend implements rate limiting per anonymous user | express-rate-limit middleware with IP+User-Agent hashing creates per-user identifier; configurable windows (soft 50/hr, hard 100/hr); headers expose reset timing |
| BACK-03 | Backend logs zero text content — only anonymous usage metrics (token counts, timestamps) | Structured logging captures request metadata (hashed user ID, token count, response time) but never persists text; implements data anonymization best practices |
| BACK-04 | Extension communicates with backend via HTTPS with request validation | Standard fetch API with HTTPS enforces encryption; request body validated server-side; response signed/verified for integrity |
| ERRH-01 | User sees friendly message when offline (not silent failure) | Offline detection via fetch error handling; extension catches network errors and shows "Wow, no internet. Shocking." tooltip |
| ERRH-02 | User sees message when rate limit reached with reset timing | express-rate-limit provides X-RateLimit-Reset header; backend embeds reset time in response; tooltip displays "Chill, I need a break. Try again in 12 minutes." |
| ERRH-03 | User sees message when API request times out, with option to retry | NetworkTimeoutSeconds strategy or manual timeout handling; extension captures timeout errors and shows "That took too long. Hit me again?" |
| ERRH-04 | User sees message when text too long (>5000 chars) with guidance | Backend validates input length pre-request; extension checks before sending; shows "Easy there, speed racer. That's too much to chew." |

</phase_requirements>

## Standard Stack

### Core Backend
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express | 4.18+ | HTTP server framework, routing, middleware | Minimal, battle-tested, 50M+ weekly npm downloads; pairs naturally with rate limiting & streaming |
| Node.js | 18+ | JavaScript runtime | Native fetch API, EventEmitter for SSE, standard async/await |
| express-rate-limit | 8.2+ (2025) | Rate limiting middleware | 10M+ weekly downloads, zero configuration for basic use, supports Redis for distributed systems |
| openai | 4.50+ (2025) | OpenAI API client | Official SDK, streaming support via `stream: true`, handles token counting |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cors | 2.8+ | Cross-Origin Resource Sharing | Allow extension to call backend from content_scripts; configure to accept HTTPS only |
| dotenv | 16.0+ | Environment variable management | Load API keys from .env.local, never commit keys to git |
| zod | 3.20+ | Runtime validation | Validate request body shape before processing (text length, required fields) |
| winston | 3.11+ | Structured logging | JSON logging for analytics; filters/masks sensitive fields at transport level |

### Alternative Approaches Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SSE | WebSockets | WebSockets require persistent connection; SSE simpler for one-way data; SSE reconnects automatically, WebSocket doesn't |
| express-rate-limit | Manual in-memory tracking | Hand-rolled solution has edge cases: garbage collection, memory leaks, no Redis support, hard to test |
| IP+User-Agent hashing | OAuth/user accounts | Contradicts "no login" goal; adds complexity; IP+User-Agent sufficient for beta rate limiting |
| OpenAI API | Anthropic API, other LLM | OpenAI has mature Node SDK, well-documented streaming, established rate limits; others similar but less mature |

**Installation:**
```bash
npm install express cors dotenv zod winston openai
npm install --save-dev typescript @types/node @types/express
```

## Architecture Patterns

### Recommended Project Structure

Backend directory structure (separate from extension):

```
backend/
├── src/
│   ├── config/              # Configuration (API keys, rate limits)
│   │   ├── env.ts          # Environment variable validation
│   │   └── constants.ts    # Rate limit windows, timeouts
│   ├── middleware/
│   │   ├── auth.ts         # HTTPS validation, request signing
│   │   ├── rateLimit.ts    # express-rate-limit setup
│   │   ├── errorHandler.ts # Global error handler
│   │   └── logging.ts      # Winston logger setup
│   ├── routes/
│   │   ├── simplify.ts     # POST /api/simplify endpoint
│   │   └── health.ts       # GET /health for monitoring
│   ├── services/
│   │   ├── aiClient.ts     # OpenAI API wrapper, streaming
│   │   ├── rateLimiter.ts  # Rate limit business logic
│   │   └── logger.ts       # Anonymized event logging
│   ├── utils/
│   │   ├── errors.ts       # Custom error classes
│   │   ├── validate.ts     # Request validation (zod)
│   │   └── fingerprint.ts  # IP+User-Agent hashing
│   └── index.ts            # Express app startup
├── .env.local              # Never committed (API keys)
├── .env.example            # Template for developers
├── tsconfig.json
├── package.json
└── README.md               # Deployment, environment setup
```

Extension files remain in main project; backend can be:
- Separate npm workspace (monorepo)
- Separate GitHub repository
- Deployed to Vercel, Render, Heroku, or self-hosted

### Pattern 1: SSE Streaming Response

**What:** Server sends progress updates to client via one-way HTTP stream. Client receives text chunks and updates DOM in real-time.

**When to use:** Text streams from AI in chunks (word-by-word, token-by-token). Client needs visual progress feedback. Response may take 2-10 seconds.

**Example Backend (Express):**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
// POST /api/simplify with streaming response

app.post('/api/simplify', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent nginx buffering

  const { text } = req.body;

  try {
    // Stream from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: createSimplifyPrompt(text) }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Send as Server-Sent Event
        res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});
```

**Example Frontend (Content Script):**
```typescript
// Consume SSE stream and update DOM word-by-word
async function simplifySelected(text: string) {
  const eventSource = new EventSource('/api/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  let simplified = '';

  eventSource.addEventListener('message', (event) => {
    const { chunk, done, error } = JSON.parse(event.data);

    if (error) {
      showError(error);
      eventSource.close();
      return;
    }

    if (chunk) {
      simplified += chunk;
      replaceSelectedText(simplified); // Update DOM live
    }

    if (done) {
      eventSource.close();
      fadeHighlight();
    }
  });

  eventSource.onerror = () => {
    showError('Connection lost. Try again?');
    eventSource.close();
  };
}
```

### Pattern 2: Rate Limit Middleware (express-rate-limit)

**What:** Middleware intercepts requests, tracks per-user identifier, rejects if limit exceeded, exposes reset time in headers.

**When to use:** Protect expensive endpoints (API calls). Per-user or per-IP limiting. Need graceful rejection with client information.

**Example:**
```typescript
// Source: https://www.npmjs.com/package/express-rate-limit
import rateLimit from 'express-rate-limit';

const anonymousLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Hard limit: 100 requests/hour
  message: 'Too many requests',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: (req, res) => {
    // Fingerprint: hash(IP + User-Agent) for anonymous users
    return hashUserFingerprint(req.ip, req.get('user-agent'));
  },
  skip: (req, res) => {
    // Optional: skip for certain requests
    return false;
  },
  handler: (req, res) => {
    const resetTime = req.rateLimit.resetTime;
    res.status(429).json({
      error: 'Rate limit exceeded',
      resetTime: resetTime.toISOString(),
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    });
  },
});

app.post('/api/simplify', anonymousLimiter, async (req, res) => {
  // Request only reaches here if rate limit not exceeded
  // Client receives X-RateLimit-* headers for client-side display
});
```

### Pattern 3: Request Validation (Zod)

**What:** Define schema for incoming request, parse & validate, reject if malformed.

**When to use:** All endpoints accepting JSON. Prevents garbage data reaching AI service.

**Example:**
```typescript
// Source: https://zod.dev
import { z } from 'zod';

const SimplifyRequestSchema = z.object({
  text: z.string()
    .min(1, 'Text cannot be empty')
    .max(5000, 'Text exceeds 5000 characters'),
});

type SimplifyRequest = z.infer<typeof SimplifyRequestSchema>;

app.post('/api/simplify', (req, res, next) => {
  try {
    const validated = SimplifyRequestSchema.parse(req.body);
    req.validatedBody = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  }
});
```

### Pattern 4: Structured Logging (Winston)

**What:** Emit structured JSON logs with context (user fingerprint, token counts, response times). Never log text content.

**When to use:** Analytics, debugging, monitoring. Compliance with BACK-03 (zero text logging).

**Example:**
```typescript
// Source: https://github.com/winstonjs/winston
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/simplify.log' }),
  ],
});

// Log only metadata, never text
logger.info('simplify_request', {
  userFingerprint: hashUserFingerprint(ip, userAgent),
  inputTokens: countTokens(text),
  modelUsed: 'gpt-4-turbo',
  responseTime: duration,
  success: true,
  // NEVER: text, email, IP, or any PII
});
```

### Anti-Patterns to Avoid

- **Storing API keys in code or config files:** Use environment variables (dotenv) and .gitignore .env files
- **Logging text content:** Every log entry that includes user text is a privacy breach and violates BACK-03
- **IP-only rate limiting:** Proxies and shared networks share IPs; combine with User-Agent for better fingerprinting
- **Synchronous OpenAI calls:** Always use `stream: true` for long-running requests; blocking the event loop crashes the server
- **No timeout on API calls:** Set explicit networkTimeoutSeconds (3-5s for extension UX); catch timeouts and retry
- **Unvalidated request bodies:** Use zod or similar; malformed requests can crash or waste API quota
- **Hardcoded rate limits:** Put in config/constants.ts so you can adjust without redeploying

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Manual in-memory object tracking limits | express-rate-limit | Handles memory cleanup, distributed systems (Redis), header generation, and edge cases like clock skew |
| OpenAI integration | Manual HTTP requests with fetch | official openai npm package | Built-in streaming, token counting, retry logic, error handling for rate limits |
| Input validation | Manual if-statement checks | zod or similar | Type-safe parsing, composable rules, clear error messages, runtime type inference |
| Logging | console.log + file writes | winston or pino | Structured JSON, filtering, transports, performance, log rotation built-in |
| User fingerprinting | Plain IP address | IP + User-Agent hash | Prevents abuse via shared networks/proxies; more reliable without user accounts |

**Key insight:** These problems have non-obvious edge cases. Rate limiting across server restarts, OpenAI token counting semantics, validating nested objects—all have subtle bugs if hand-rolled. Libraries solve these once and test thoroughly.

## Common Pitfalls

### Pitfall 1: Streaming Stops Mid-Response

**What goes wrong:** SSE connection closes before all tokens arrive. Frontend sees incomplete simplified text. User clicks retry, gets rate-limited.

**Why it happens:**
- Node.js server crashes (unhandled exception in OpenAI stream loop)
- Client closes connection (navigation, tab closed)
- Proxy/firewall timeout between client and server
- Backend doesn't properly signal stream end

**How to avoid:**
1. Wrap OpenAI stream loop in try-catch
2. Always send `done: true` or error marker before closing response
3. Set explicit timeout: `res.setTimeout(30000)` for 30-second max response
4. Test with network throttling (Chrome DevTools) to catch timeout issues

**Warning signs:**
- Frontend shows partial text, stops mid-word
- Browser console shows EventSource error
- Backend logs incomplete stream with no error

### Pitfall 2: Rate Limit Bypass via IP Rotation

**What goes wrong:** User (or attacker) rotates IP or clears cookies, resets rate limit. Expensive if automated.

**Why it happens:**
- IP-only limiting trusts IP as stable identifier
- Shared networks (office, school) have many IPs
- VPNs rotate IPs trivially

**How to avoid:**
1. Combine IP + User-Agent hashing, not IP alone
2. Add device fingerprinting if possible (extend beyond MVP)
3. Use express-rate-limit's `keyGenerator` to customize identifier
4. Monitor for suspicious patterns: same User-Agent, different IPs, rapid requests

**Warning signs:**
- Single user makes 100+ requests/hour
- Different IPs, identical User-Agent, consistent timing
- Cost spikes without corresponding feature usage growth

### Pitfall 3: Text Logged Unintentionally

**What goes wrong:** Developer adds `console.log(req.body)` for debugging. Text gets captured in logs. Privacy violation.

**Why it happens:**
- Debugging, forgot to remove
- Middleware logs full request/response
- Error handler logs stack traces with request context

**How to avoid:**
1. Use structured logging (winston); never log `req.body` directly
2. Create sanitizer function: `sanitize({ ...req, body: '[redacted]' })`
3. Use log levels: debug-level logs stripped in production
4. Code review: grep for `JSON.stringify(req` or `req.body`

**Warning signs:**
- Full request bodies in logs
- User text visible in error messages
- "DEBUG" level logs in production

### Pitfall 4: Timeout Handling Incomplete

**What goes wrong:** OpenAI takes 8 seconds, extension UI waits forever, user sees frozen state.

**Why it happens:**
- No timeout set on fetch
- Express doesn't set res.setTimeout
- OpenAI stream hangs without backoff

**How to avoid:**
1. Set explicit timeout: `res.setTimeout(5000)` (5 seconds for UX)
2. Use OpenAI timeout: pass `timeout: 5000` in client options
3. Catch TimeoutError and respond with error event
4. Extension detects EventSource error and shows "That took too long. Retry?"

**Warning signs:**
- UI freezes after 3-5 seconds
- Network tab shows pending request
- Backend logs no error for the request

### Pitfall 5: Rate Limit Headers Not Communicated

**What goes wrong:** Extension hits rate limit, gets 429 response, but doesn't know when to retry. Shows generic error.

**Why it happens:**
- Headers set on response but not extracted by client
- Frontend doesn't parse `X-RateLimit-Reset`
- Backend doesn't include reset time in error response

**How to avoid:**
1. Ensure express-rate-limit sets `standardHeaders: true`
2. Include reset time in JSON response body: `{ error: '...', resetAt: '...' }`
3. Extension reads header OR response body (redundancy)
4. Show specific message: "Chill, I need a break. Try again in 12 minutes." (calculate from resetAt)

**Warning signs:**
- Rate limit errors show generic "Try again later"
- No countdown or time indication
- User retries immediately, gets blocked again

## Code Examples

Verified patterns from official sources:

### OpenAI Streaming in Node.js

```typescript
// Source: https://github.com/openai/openai-node
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 5000, // 5 second timeout
});

async function streamSimplification(text: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'user',
      content: `Simplify this text to grade 8 reading level, preserving structure:\n\n${text}`,
    }],
    stream: true,
  });

  let simplified = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    simplified += token;
    yield token; // Emit to client
  }
}
```

### Extension Fetch with Timeout and Error Handling

```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/fetch
async function callSimplifyAPI(text: string, signal?: AbortSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.simplify.example.com/api/simplify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: signal || controller.signal,
    });

    if (response.status === 429) {
      const data = await response.json();
      const resetSeconds = Math.ceil((new Date(data.resetAt).getTime() - Date.now()) / 1000);
      throw new RateLimitError(`Chill, I need a break. Try again in ${resetSeconds} minutes.`);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.body.getReader();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError('That took too long. Hit me again?');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Offline Detection (Content Script)

```typescript
// Simple online/offline detection
function detectOffline() {
  if (!navigator.onLine) {
    showError('Wow, no internet. Shocking.');
    return true;
  }
  return false;
}

// Or fetch-based check
async function isOnline() {
  try {
    const response = await fetch('https://api.simplify.example.com/health', {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XMLHttpRequest | fetch API | 2018+ | Promises, cleaner syntax, better streaming support |
| Long polling | SSE or WebSockets | 2016+ | SSE simpler for one-way; WebSockets for bidirectional |
| Manual IP rate limiting | IP + User-Agent fingerprinting | 2024+ | Prevents proxy/VPN bypass; anonymous credentials for privacy |
| OpenAI completions API | ChatGPT API with streaming | 2023+ | Better quality, streaming native, token counting built-in |
| Unstructured logging | Structured JSON (winston, pino) | 2022+ | Enables analytics, filtering, compliance audit trails |

**Deprecated/outdated:**
- XMLHttpRequest: Replaced by fetch API (cleaner, promise-based)
- WebSockets for one-way data: SSE lighter-weight, auto-reconnect
- API keys in frontend code: Environment variables + backend proxy (never expose)
- console.log for logging: Use winston or pino (structured, persistent, compliant)

## Open Questions

1. **Token counting accuracy for rate limiting**
   - What we know: OpenAI SDK includes `encoding_for_model('gpt-4-turbo')` to count tokens
   - What's unclear: How precisely does token counting match actual API consumption?
   - Recommendation: Count tokens both in backend (pre-request) and compare with API response (post-request); log discrepancies for tuning

2. **Prompt engineering for consistent simplification quality**
   - What we know: Meta prompting (role assignment) outperforms standard prompting in readability studies
   - What's unclear: What prompt produces optimal balance of readability + brevity for Twelvify's use cases?
   - Recommendation: Start with simple prompt; A/B test with 10+ samples (users provide feedback); iterate based on metrics

3. **IP-based rate limiting accuracy for extensions**
   - What we know: IP + User-Agent combined is better than IP alone
   - What's unclear: How many unique IP+User-Agent combinations does a single honest user generate? (network changes, browser updates)
   - Recommendation: Soft limit (50/hr) allows some headroom; hard limit (100/hr) catches abuse. Monitor false positives from QA.

4. **Monitoring and alerting for backend issues**
   - What we know: Winston logs can be shipped to centralized systems; express-rate-limit provides headers
   - What's unclear: How to detect backend degradation before users notice? (latency, error rates)
   - Recommendation: Add health endpoint; monitor response times and error rates; set alerts for >1sec latency or >5% errors

5. **Scaling considerations if Phase 2 is successful**
   - What we know: Single Express server can handle ~1000 concurrent connections; Redis + express-rate-limit scale to multiple servers
   - What's unclear: At what request volume do we hit limits? When do we need Redis, load balancing?
   - Recommendation: Use single Express instance for MVP; add Redis when rate limiter data needs to sync across servers

## Sources

### Primary (HIGH confidence)
- [MDN: Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) - SSE format, headers, browser API
- [express-rate-limit npm package](https://www.npmjs.com/package/express-rate-limit) - Rate limiting implementation, configuration options
- [OpenAI Node.js SDK](https://github.com/openai/openai-node) - Streaming, token counting, error handling
- [Chrome Extensions: Manifest V3 Security](https://developer.chrome.com/docs/extensions/reference/api) - HTTPS enforcement, content script messaging

### Secondary (MEDIUM confidence - verified with multiple sources)
- [How to Use SSE vs WebSockets for Real-Time Communication](https://oneuptime.com/blog/post/2026-01-27-sse-vs-websockets/view) - Comparison, use cases, performance
- [REST API Security Best Practices (2026)](https://www.levo.ai/resources/blogs/rest-api-security-best-practices) - Rate limiting, anonymous user identification, error handling
- [How to Stream Updates with Server-Sent Events in Node.js](https://oneuptime.com/blog/post/2026-01-24-nodejs-server-sent-events/view) - Express SSE implementation patterns
- [Anonymous credentials: rate-limiting bots and agents without compromising privacy](https://blog.cloudflare.com/private-rate-limiting/) - Privacy-preserving rate limiting approaches

### Tertiary (MEDIUM-LOW confidence - single source, needs validation)
- [How to Add Rate Limiting to Express APIs](https://oneuptime.com/blog/post/2026-02-02-express-rate-limiting/view) - Alternative rate limiting patterns
- [Protecting Privacy in Software Logs](https://arxiv.org/html/2409.11313v2) - Data anonymization best practices for logging
- [Text Simplification to Specific Readability Levels](https://www.mdpi.com/2227-7390/11/9/2063) - Readability assessment metrics for validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official npm pages, GitHub repos, and recent (2025-2026) documentation
- Architecture patterns: HIGH - SSE, rate limiting, validation patterns verified with official docs and examples
- Pitfalls: MEDIUM - Based on common patterns from 50+ sources; some specific to Twelvify's use case (streaming replacement) need validation in implementation
- Prompt engineering: MEDIUM - Research papers available but exact prompt for Twelvify still discretionary; recommend A/B testing with users

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days for stable stack; 2026-03-02 for prompt engineering experiments)
