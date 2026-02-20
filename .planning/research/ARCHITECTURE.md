# Architecture Patterns: Chrome Extension with Backend AI Proxy

**Domain:** Chrome extension with backend AI text processing
**Project:** Twelveify
**Researched:** 2026-02-20
**Confidence:** HIGH

## Standard Architecture

### System Overview

Twelveify uses a distributed architecture with three primary layers: the browser extension (chrome context), the content script (webpage context), and a backend AI proxy server. Data flows through these layers with clear isolation boundaries.

```
┌────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                              │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Web Page DOM                              │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────┐               │  │
│  │  │ [highlighted text] ◄─── injects text    │               │  │
│  │  │                         replacement     │               │  │
│  │  │                         & read events   │               │  │
│  │  └─────────────────────────────────────────┘               │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                           │
│  ┌──────────────────────┴───────────────────────────────────────┐  │
│  │          CONTENT SCRIPT (Webpage Isolation Context)          │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ • Detects user text selection (window.getSelection())   │ │  │
│  │  │ • Injects floating "Simplify" button/icon              │ │  │
│  │  │ • Listens for user click on button                     │ │  │
│  │  │ • Sends text + preferences to Service Worker via       │ │  │
│  │  │   chrome.runtime.sendMessage()                         │ │  │
│  │  │ • Receives simplified text from Service Worker         │ │  │
│  │  │ • Replaces original text in DOM with simplified text   │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └────────────────┬──────────────────────────────────────────────┘  │
│                   │                                                  │
│                   │ chrome.runtime.sendMessage()                    │
│                   │ Message format:                                 │
│                   │ { type: 'SIMPLIFY_TEXT',                       │
│                   │   payload: { text, preferences } }             │
│                   ▼                                                  │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │      EXTENSION UI LAYER (Popup / Side Panel)                 │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ Side Panel / Popup:                                    │  │ │
│  │  │ • User preferences form (tone, depth, background)     │  │ │
│  │  │ • Progressive onboarding screens                      │  │ │
│  │  │ • Settings & profile management                       │  │ │
│  │  │ • Usage statistics & rate limit info                 │  │ │
│  │  │ • Reads/writes to chrome.storage.local/sync          │  │ │
│  │  │ • Sends pref updates to Service Worker               │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ chrome.runtime.sendMessage()
                                │ chrome.runtime.onMessage
                                │
┌──────────────────────────────────────────────────────────────────────┐
│          SERVICE WORKER (Manifest V3 Background Context)             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Message Router                                              │  │
│  │ • chrome.runtime.onMessage listener                         │  │
│  │ • Routes messages by type (SIMPLIFY_TEXT, GET_PREFS, etc) │  │
│  │ • Directs to appropriate handler                          │  │
│  └────────────┬────────────────────────────────────────────────┘  │
│               │                                                   │
│  ┌────────────┴────────────────────────────────────────────────┐  │
│  │ State Manager                                               │  │
│  │ • Reads user preferences from chrome.storage.local/sync    │  │
│  │ • Tracks rate limiting state (requests per hour/day)      │  │
│  │ • Manages request queue & retry logic                     │  │
│  │ • chrome.storage.onChanged listener for pref updates      │  │
│  └────────────┬────────────────────────────────────────────────┘  │
│               │                                                   │
│  ┌────────────┴────────────────────────────────────────────────┐  │
│  │ Backend API Client                                          │  │
│  │ • Validates request (text length, rate limit, schema)      │  │
│  │ • Constructs backend request:                              │  │
│  │   {text, tone, depth, background, profession}             │  │
│  │ • Makes HTTPS POST to backend server                       │  │
│  │ • Streams response tokens if using SSE                    │  │
│  │ • Handles errors & retries                                │  │
│  │ • Updates usage metrics in chrome.storage                 │  │
│  └────────────┬────────────────────────────────────────────────┘  │
│               │                                                   │
└───────────────┼───────────────────────────────────────────────────┘
                │
                │ HTTPS POST /api/simplify
                │ Request: { text, preferences, userContext }
                │ Response: SSE stream or JSON
                │
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│             BACKEND AI PROXY SERVER (Thin Layer)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Request Validation Layer                                    │  │
│  │ • Verify auth token (optional, for abuse prevention)       │  │
│  │ • Validate text length, format, encoding                  │  │
│  │ • Rate limit enforcement per extension user              │  │
│  └─────────────────────┬───────────────────────────────────────┘  │
│                        │                                          │
│  ┌─────────────────────┴───────────────────────────────────────┐  │
│  │ Prompt Builder                                              │  │
│  │ • Takes user text + preferences (tone, depth, background)  │  │
│  │ • Constructs system prompt:                               │  │
│  │   "Simplify this text to a [tone] tone, [depth] depth,   │  │
│  │    for someone with a [background] background..."         │  │
│  │ • Includes profession-specific analogies if set           │  │
│  │ • Validates prompt safety (no injection attacks)          │  │
│  └─────────────────────┬───────────────────────────────────────┘  │
│                        │                                          │
│  ┌─────────────────────┴───────────────────────────────────────┐  │
│  │ LLM API Caller (OpenAI / Anthropic)                         │  │
│  │ • Retrieves API key from environment variables             │  │
│  │ • Makes streaming request to LLM:                         │  │
│  │   POST https://api.openai.com/v1/chat/completions        │  │
│  │   { stream: true, messages: [...], model: ... }          │  │
│  │ • Never exposes API key to client                         │  │
│  │ • Handles LLM API errors & fallbacks                      │  │
│  └─────────────────────┬───────────────────────────────────────┘  │
│                        │                                          │
│  ┌─────────────────────┴───────────────────────────────────────┐  │
│  │ Response Streamer (SSE or JSON)                             │  │
│  │ • Sets SSE headers: Content-Type: text/event-stream       │  │
│  │ • For each token from LLM, writes:                        │  │
│  │   data: {"token": "word"}\n\n                            │  │
│  │ • Sends final: data: {"done": true}\n\n                 │  │
│  │ • OR: Returns full JSON response for simpler cases        │  │
│  │ • Service Worker receives stream, updates DOM in real-time │  │
│  └─────────────────────┬───────────────────────────────────────┘  │
│                        │                                          │
│  ┌─────────────────────┴───────────────────────────────────────┐  │
│  │ Analytics Logger (Privacy-First)                            │  │
│  │ • NEVER logs: original text, rewritten text, preferences  │  │
│  │ • ONLY logs: userId (hashed), timestamp, tokenCount,      │  │
│  │   inputLength (binned), responseTime (ms)                 │  │
│  │ • Sends to anonymous analytics endpoint                   │  │
│  │ • No personal data, impossible to re-identify user        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                        ▲
                        │ HTTPS (API key in header)
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    OpenAI API                  Anthropic API
    gpt-4o-mini                 Claude Haiku
    (streaming)                 (streaming)
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---|---|
| **Content Script** | Detect text selection (window.getSelection), render floating UI button, listen for user clicks, send text to Service Worker, inject rewritten text into DOM, handle MutationObserver for dynamic content | Service Worker (sendMessage) |
| **Service Worker** | Message router, state manager (preferences, rate limits), orchestrate API calls, validate requests, handle retries, manage storage, coordinate between content scripts and UI | Content Script, Popup/Side Panel, Backend API |
| **Popup / Side Panel UI** | User preferences form (tone, depth, background, profession), progressive onboarding screens, settings management, display usage stats, read/write to chrome.storage | Service Worker (sendMessage), chrome.storage.local/sync |
| **Backend API Proxy** | Receive text + user preferences, validate input, construct AI prompt, call LLM API (secret key never exposed), stream response via SSE, log anonymous metrics, enforce rate limits | Service Worker (HTTPS), OpenAI/Anthropic API |
| **chrome.storage.local** | Persist user preferences, onboarding state, rate limit counters, usage metrics for current session | Service Worker, Content Script, Popup |
| **chrome.storage.sync** | Optional: sync preferences across user's Chrome browsers | Service Worker, Popup |

## Recommended Project Structure

```
src/
├── extension/                    # All client-side extension code
│   ├── manifest.json             # Manifest V3: permissions, background, content scripts
│   ├── service-worker.ts         # Background service worker (background script)
│   ├── content-script.ts         # Injected into webpage context
│   │
│   ├── ui/
│   │   ├── side-panel/           # Side panel interface (persistent UI)
│   │   │   ├── panel.html        # Sidebar HTML
│   │   │   ├── panel.tsx         # React component (preferences, onboarding)
│   │   │   ├── hooks.ts          # Custom hooks (usePreferences, useUsage)
│   │   │   └── styles.css        # Tailwind classes
│   │   │
│   │   └── popup/                # Popup interface (fallback to side panel)
│   │       ├── popup.html
│   │       ├── popup.tsx
│   │       └── styles.css
│   │
│   ├── types/
│   │   ├── messages.ts           # Message types (SIMPLIFY_TEXT, etc)
│   │   ├── storage.ts            # chrome.storage schema
│   │   └── api.ts                # Backend response types
│   │
│   ├── utils/
│   │   ├── constants.ts          # API endpoint, limits
│   │   ├── storage.ts            # Wrapper for chrome.storage API
│   │   ├── messaging.ts          # Message sending/receiving helpers
│   │   └── logger.ts             # Logging (no PII)
│   │
│   └── icons/
│       ├── icon-16.png           # 16x16 icon
│       ├── icon-48.png           # 48x48 icon
│       └── icon-128.png          # 128x128 icon
│
├── backend/                      # Backend proxy server
│   ├── index.ts                  # Main server entry point (Express/Hono)
│   │
│   ├── handlers/
│   │   ├── simplifyText.ts       # POST /api/simplify request handler
│   │   ├── health.ts             # GET /health for monitoring
│   │   └── analytics.ts          # POST /api/analytics (optional)
│   │
│   ├── middleware/
│   │   ├── auth.ts               # Validate auth token (if needed)
│   │   ├── rateLimit.ts          # Rate limiter (per extension user)
│   │   ├── validation.ts         # Input validation (text length, schema)
│   │   └── errorHandler.ts       # Global error handler
│   │
│   ├── services/
│   │   ├── llmClient.ts          # OpenAI/Anthropic SDK wrapper
│   │   ├── promptBuilder.ts      # Construct system + user prompts
│   │   ├── streamHandler.ts      # SSE streaming logic
│   │   └── analytics.ts          # Log metrics (privacy-first)
│   │
│   ├── config/
│   │   ├── env.ts                # Environment variable validation
│   │   └── llmConfig.ts          # LLM provider settings
│   │
│   └── types/
│       ├── request.ts            # Backend request/response types
│       └── config.ts             # Configuration types
│
├── shared/
│   ├── types.ts                  # Shared types (used by extension + backend)
│   └── constants.ts              # Shared constants (error codes, etc)
│
├── tests/
│   ├── extension/                # Extension tests
│   │   ├── service-worker.test.ts
│   │   ├── content-script.test.ts
│   │   └── messaging.test.ts
│   │
│   └── backend/                  # Backend tests
│       ├── handlers.test.ts
│       ├── services.test.ts
│       └── middleware.test.ts
│
└── docs/
    ├── ARCHITECTURE.md           # This file
    ├── API.md                    # Backend API specification
    └── DEPLOYMENT.md             # Backend deployment instructions
```

### Structure Rationale

- **extension/:** All client-side code runs in the browser. Separated from backend to enforce security boundaries and prevent accidental credential leakage.
- **backend/:** Server-side proxy that handles secrets (API keys), rate limiting, and AI orchestration. Can be deployed independently and scaled horizontally.
- **shared/:** Minimal shared types to keep contracts consistent without exposing backend implementation details.
- **Separation of content-script and service-worker:** Different isolation contexts with explicit messaging. Content script is less trustworthy (runs in webpage context) than service worker.

## Architectural Patterns

### Pattern 1: Layered Message Passing (Content Script → Service Worker → Backend API)

**What:** Messages flow through a centralized service worker that acts as a message router, preventing direct backend calls from content scripts. All API calls, rate limiting, and authentication happen in one place.

**When to use:** Standard pattern for Chrome extensions because:
- Content scripts run in an isolated, less trustworthy context
- Service worker can validate, rate-limit, and authenticate all requests
- Single point of control for debugging and monitoring
- Simpler security model (credentials stored only in service worker/backend)

**Trade-offs:**
- Adds one extra hop (content script → service worker)
- Simpler mental model and more secure
- Easier to debug all logic in one place

**Example:**

```typescript
// content-script.ts
const selectedText = window.getSelection().toString();
if (selectedText.trim().length > 0) {
  // Never call backend directly; always go through service worker
  chrome.runtime.sendMessage(
    {
      type: 'SIMPLIFY_TEXT',
      payload: {
        text: selectedText,
        // Don't send preferences here; service worker has them
      }
    },
    (response) => {
      if (response.success) {
        replaceSelectedTextInDOM(selectedText, response.simplifiedText);
      } else {
        showErrorToast(response.error);
      }
    }
  );
}

// service-worker.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message came from this extension
  if (sender.id !== chrome.runtime.id) {
    sendResponse({ error: 'Unauthorized' });
    return;
  }

  if (message.type === 'SIMPLIFY_TEXT') {
    (async () => {
      try {
        // Service worker has access to preferences
        const prefs = await getStoredPreferences();

        // Service worker checks rate limit
        const rateLimitOk = await checkRateLimit();
        if (!rateLimitOk) {
          sendResponse({ error: 'Rate limit exceeded' });
          return;
        }

        // Service worker calls backend (only place with access to auth token)
        const simplified = await callBackendAPI(message.payload.text, prefs);

        // Service worker updates usage metrics
        await updateUsageMetrics(message.payload.text.length);

        sendResponse({ success: true, simplifiedText: simplified });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep channel open for async response
  }
});
```

### Pattern 2: Server-Sent Events (SSE) for Streaming Responses

**What:** Backend streams AI response tokens in real-time via Server-Sent Events, allowing the extension to display text as it's generated rather than waiting for the complete response.

**When to use:**
- User expectation: Rewrites appear incrementally (like typing)
- Better perceived performance
- Essential for longer text rewrites
- Cannot use WebSockets in service worker (Chrome limitation)

**Why SSE over WebSocket:**
- One-way communication (server → client) is all we need
- Works over standard HTTP
- Built-in automatic reconnection
- No persistent connection burden on service worker
- Simpler protocol (no framing/unframing)

**Example:**

```typescript
// backend/handlers/simplifyText.ts
app.post('/api/simplify', async (req, res) => {
  const { text, preferences } = req.body;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://...');

  try {
    // Get API key from environment (never in code)
    const apiKey = process.env.OPENAI_API_KEY;

    // Call LLM with streaming enabled
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `Simplify text to a ${preferences.tone} tone, ${preferences.depth} depth,
                    for someone with ${preferences.background} background.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 500
    });

    // Stream tokens back to extension
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token, done: false })}\n\n`);
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ token: '', done: true })}\n\n`);
    res.end();

  } catch (error) {
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// service-worker.ts - Consume SSE stream
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'simplify-stream') {
    (async () => {
      try {
        const response = await fetch('https://backend.example.com/api/simplify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: port.text, preferences: port.prefs })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          // Parse SSE format: "data: {...}\n\n"
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              port.postMessage({ type: 'TOKEN', token: data.token });
              if (data.done) {
                port.postMessage({ type: 'COMPLETE' });
                return;
              }
            }
          }
        }
      } catch (error) {
        port.postMessage({ type: 'ERROR', error: error.message });
      }
    })();
  }
});
```

### Pattern 3: Progressive Onboarding via Preference Storage

**What:** Extension works immediately with sensible defaults. Over the first few uses, it gradually asks the user to refine preferences (tone, depth, background/profession) rather than requiring up-front configuration.

**When to use:** Lowering friction for new users while eventually collecting personalization data to improve results.

**Trade-offs:**
- More state transitions to manage
- Better UX than forcing a form immediately
- Users can abandon onboarding anytime; still works with defaults

**Example:**

```typescript
// service-worker.ts
const getOrCreatePreferences = async () => {
  let { userPreferences } = await chrome.storage.local.get('userPreferences');

  if (!userPreferences) {
    // First-time user: create with sensible defaults
    userPreferences = {
      tone: 'casual',           // Default for broad audience
      depth: 'medium',          // Balanced explanation length
      background: undefined,    // To be filled in via onboarding
      profession: undefined,    // To be filled in via onboarding
      completedOnboarding: false,
      version: 1
    };
    await chrome.storage.local.set({ userPreferences });
  }

  return userPreferences;
};

// On each simplify request, check if onboarding needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SIMPLIFY_TEXT') {
    (async () => {
      const prefs = await getOrCreatePreferences();

      // If onboarding incomplete, show side panel
      if (!prefs.completedOnboarding) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
        // Let onboarding handler complete preferences before simplifying
        sendResponse({
          error: 'Please complete onboarding first',
          onboardingRequired: true
        });
        return;
      }

      // Normal flow: simplify text
      const result = await callBackendAPI(message.payload.text, prefs);
      sendResponse({ success: true, simplifiedText: result });
    })();
    return true;
  }
});

// side-panel.tsx - Onboarding UI
const OnboardingForm = () => {
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    chrome.storage.local.get('userPreferences', (result) => {
      setPrefs(result.userPreferences);
    });
  }, []);

  const handleSubmit = async (formData) => {
    // Save preferences
    await chrome.storage.local.set({
      userPreferences: {
        ...prefs,
        ...formData,
        completedOnboarding: true
      }
    });

    // Close side panel and return to page
    chrome.sidePanel.getPanelBehavior((behavior) => {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select name="tone">
        <option>casual</option>
        <option>direct</option>
        <option>supportive</option>
      </select>
      <select name="background">
        <option>student</option>
        <option>developer</option>
        <option>general</option>
      </select>
      <button type="submit">Continue</button>
    </form>
  );
};
```

### Pattern 4: Backend as Stateless API Proxy (No User Session Storage)

**What:** Backend is a thin, stateless proxy that doesn't store content, doesn't maintain user sessions, and is purely request/response. All state lives in the extension (chrome.storage). Backend forgets about every request immediately after responding.

**When to use:** Privacy-first model where backend has minimal knowledge of individual users, enabling easy horizontal scaling.

**Trade-offs:**
- Cannot build user history (but users can use browser history)
- Scales linearly with requests (no database bottleneck)
- Simpler to deploy and reason about

**Example:**

```typescript
// backend/handlers/simplifyText.ts - Stateless handler
app.post('/api/simplify', async (req, res) => {
  const { text, preferences, userContext } = req.body;

  // Log only: tone used, depth used, input length (binned)
  // Never log: the actual text, the user's identity, etc.
  console.log(`Request: tone=${preferences.tone}, depth=${preferences.depth}, inputLengthBin=${Math.floor(text.length / 100) * 100}`);

  try {
    // Construct prompt for this request
    const systemPrompt = buildPrompt(text, preferences, userContext);

    // Call LLM
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    });

    const simplifiedText = response.choices[0].message.content;

    // Return response. Forget about this user immediately.
    // No database writes, no session storage, no correlation tracking.
    res.json({
      simplifiedText,
      tokensUsed: response.usage.total_tokens
    });

    // After response is sent, any data associated with this request
    // is eligible for garbage collection. No persistent state.

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// backend/services/analytics.ts - Privacy-first logging
async function logRequest(request: SimplifyRequest) {
  // Hash or anonymize user ID (cannot be reversed to identify individual)
  const hashedUserId = await hashUserId(request.userContext?.id);

  // Log only aggregatable metrics
  await analyticsDB.insert({
    timestamp: Date.now(),
    hashedUserId,           // Hashed (privacy-safe)
    tone: request.preferences.tone,
    depth: request.preferences.depth,
    inputLengthBin: Math.floor(request.text.length / 100) * 100, // Quantized
    responseTimeMs: Date.now() - request.startTime,
    // NEVER store: request.text, request.preferences.background, etc.
  });
}
```

### Pattern 5: Rate Limiting with Two Layers (Soft + Hard)

**What:** Rate limiting enforced at both extension and backend. Soft limit in extension (user-friendly error messages), hard limit on backend (prevents abuse even if client is compromised).

**When to use:** Always, for any API with costs or resource constraints.

**Example:**

```typescript
// service-worker.ts - Soft limit (user-friendly)
const checkRateLimit = async (): Promise<boolean> => {
  const now = Date.now();
  const oneHourAgo = now - 3600000;

  let { rateLimitState } = await chrome.storage.local.get('rateLimitState');

  if (!rateLimitState) {
    rateLimitState = { requestCount: 0, resetTime: now + 3600000 };
  }

  // Reset if hour has passed
  if (now > rateLimitState.resetTime) {
    rateLimitState = { requestCount: 0, resetTime: now + 3600000 };
  }

  // Allow up to 50 requests per hour
  if (rateLimitState.requestCount >= 50) {
    return false;
  }

  // Increment and persist
  rateLimitState.requestCount++;
  await chrome.storage.local.set({ rateLimitState });
  return true;
};

// backend/middleware/rateLimit.ts - Hard limit (security)
app.use((req, res, next) => {
  const clientId = req.headers['x-client-id'];
  const key = `ratelimit:${clientId}`;

  // In-memory or Redis counter (depending on deployment)
  redisClient.incr(key, (err, count) => {
    if (err) return next(err);

    // Set expiry on first increment
    if (count === 1) {
      redisClient.expire(key, 3600); // 1 hour
    }

    // Hard limit: 100 per hour (higher than client soft limit)
    if (count > 100) {
      res.status(429).json({ error: 'Too many requests', retryAfter: 3600 });
      return;
    }

    // Attach count to request for logging
    req.rateLimitCount = count;
    next();
  });
});
```

## Data Flow

### Complete User Journey: Select Text → Rewrite → Replace

```
STEP 1: USER SELECTS TEXT ON WEBPAGE
  └─ Webpage's DOM contains text
  └─ User triple-clicks or drags to select
  └─ Browser fires 'selection' event

STEP 2: CONTENT SCRIPT DETECTS SELECTION
  └─ Content script's window.getSelection() listener triggers
  └─ Gets selected text: window.getSelection().toString()
  └─ Injects floating "Simplify" button near selection
  └─ Waits for user to click button

STEP 3: USER CLICKS BUTTON
  └─ Content script click handler fires
  └─ Prepares message: { type: 'SIMPLIFY_TEXT', payload: { text: '...' } }
  └─ Calls chrome.runtime.sendMessage() to Service Worker
  └─ Sets response timeout (30 seconds)

STEP 4: SERVICE WORKER RECEIVES MESSAGE
  └─ chrome.runtime.onMessage listener fires
  └─ Validates sender (must be this extension, not webpage)
  └─ Validates message schema { type: 'SIMPLIFY_TEXT', payload: ... }
  └─ Validates text length (must be >0 and <5000 chars)
  └─ Calls getOrCreatePreferences() → chrome.storage.local.get
  └─ Calls checkRateLimit() → have we exceeded quota this hour?
  └─ If rate limited: sendResponse({ error: 'Rate limit exceeded' })
  └─ Continues...

STEP 5: SERVICE WORKER CONSTRUCTS BACKEND REQUEST
  └─ Collects: text, preferences (tone, depth, background)
  └─ Adds: userContext (hashed ID, timestamp)
  └─ Body: { text, preferences, userContext }
  └─ Prepares HTTPS POST to backend server
  └─ Auth: None (stateless) or Bearer token if needed

STEP 6: SERVICE WORKER CALLS BACKEND (HTTPS POST)
  └─ fetch('https://backend.example.com/api/simplify', {
  │   method: 'POST',
  │   headers: { 'Content-Type': 'application/json' },
  │   body: JSON.stringify({ text, preferences, userContext })
  │ })
  └─ Opens EventSource to consume SSE stream
  └─ OR: Awaits response.json() for non-streaming

STEP 7: BACKEND VALIDATES REQUEST
  └─ Middleware layer: auth, rate limit, input validation
  └─ Checks: Is text present? Is length valid? Is user rate-limited?
  └─ If invalid: return 400 Bad Request
  └─ If rate-limited: return 429 Too Many Requests
  └─ Continues...

STEP 8: BACKEND CONSTRUCTS AI PROMPT
  └─ Takes user's text + preferences
  └─ Constructs system prompt:
      "You are a text simplification assistant. Rewrite the following text to a
       [TONE] tone, with [DEPTH] depth explanation, for someone with a [BACKGROUND] background.
       Keep the meaning intact. Use simple words. Break into short sentences."
  └─ Injects user's selected text as user message
  └─ Validates prompt (no injection attacks)
  └─ Passes to LLM

STEP 9: BACKEND CALLS LLM API
  └─ OpenAI: POST https://api.openai.com/v1/chat/completions
       { model: 'gpt-4o-mini', stream: true, messages: [...] }
  └─ OR Anthropic: POST https://api.anthropic.com/v1/messages
       { model: 'claude-3-haiku', stream: true, messages: [...] }
  └─ Passes API key from environment (never exposed to client)
  └─ Requests streaming: stream: true

STEP 10: LLM GENERATES RESPONSE TOKEN-BY-TOKEN
  └─ LLM sends back stream of tokens:
      [Token 1] [Token 2] [Token 3] ...
  └─ Each token arrives in separate SSE event

STEP 11: BACKEND RELAYS TOKENS VIA SSE
  └─ For each LLM token received:
      res.write(`data: ${JSON.stringify({ token: 'hello' })}\n\n`);
  └─ Service Worker receives each SSE line
  └─ Accumulates tokens into full text

STEP 12: SERVICE WORKER RECEIVES TOKENS
  └─ EventSource 'message' event fires for each SSE line
  └─ Parses: data: {"token": "..."}
  └─ Opens long-lived port to content script:
      const port = chrome.runtime.connect({ name: 'simplify-stream' });
  └─ Forwards each token: port.postMessage({ type: 'TOKEN', token: '...' })
  └─ Service worker updates usage metrics in chrome.storage

STEP 13: CONTENT SCRIPT RECEIVES TOKENS INCREMENTALLY
  └─ chrome.runtime.onConnect listener (for port connection)
  └─ Accumulates tokens: fullText += token
  └─ After each token, updates DOM with partial text
  └─ User sees text appearing word-by-word

STEP 14: BACKEND LOGS ANONYMOUSLY
  └─ NEVER logs: original text, rewritten text
  └─ ONLY logs:
      { hashedUserId, timestamp, tone, depth, inputLength, tokensUsed, responseTimeMs }
  └─ Sends to analytics backend (or writes to local logs)
  └─ These analytics are aggregatable (no personal data)

STEP 15: REQUEST COMPLETES
  └─ Last token received: data: {"done": true}
  └─ Content script finalizes text in DOM
  └─ User can now:
      • Continue reading
      • Click "Copy" to copy rewritten text
      • Click "Undo" to revert to original
  └─ Port closes
  └─ Service worker may terminate (will wake on next action)

STEP 16: USAGE METRICS UPDATED
  └─ Service worker reads rateLimitState from chrome.storage
  └─ Increments requestCount
  └─ Saves back to chrome.storage.local
  └─ Next request checks this counter
```

### State Management Across Components

```
STORAGE HIERARCHY:

chrome.storage.local (per browser)
├─ userPreferences: {
│  ├─ tone: 'casual' | 'direct' | 'supportive'
│  ├─ depth: 'shallow' | 'medium' | 'deep'
│  ├─ background: 'student' | 'developer' | 'general' | custom
│  ├─ profession?: 'engineer' | 'doctor' | 'teacher' | null
│  ├─ completedOnboarding: boolean
│  └─ lastUpdated: number (timestamp)
│}
├─ rateLimitState: {
│  ├─ requestCount: number
│  ├─ resetTime: number (timestamp)
│  └─ hourlyLimit: 50
│}
├─ usageMetrics: {
│  ├─ totalRequests: number
│  ├─ totalTokensUsed: number
│  ├─ totalCharsSimplified: number
│  └─ lastRequestTime: number
│}
└─ sessionState: {
   ├─ currentlySimplifying: boolean
   ├─ lastErrorMessage?: string
   └─ streamingPort?: Port | null
}

chrome.storage.sync (optional, syncs across user's Chrome browsers)
└─ userPreferences (same as above, synced if enabled)

Service Worker Memory (ephemeral, cleared on termination)
├─ preferencesCache: Preferences
├─ activeConnections: Map<Port>
└─ pendingRequests: Map<RequestId, Promise>

Content Script Memory (per page)
├─ selectedText: string
├─ floatingButton: HTMLElement
└─ tokens: string[] (accumulated for current request)

Backend Memory (stateless, nothing persisted)
├─ Active LLM streams (cleared after response)
└─ Rate limit counters (in Redis or memory)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **100-500 users** | Single backend instance (Cloudflare Workers free tier or basic compute), in-memory rate limiting counter. Chrome.storage is sufficient for all state. Call OpenAI API directly; costs ~$5-20/month with gpt-4o-mini. No database needed. |
| **500-10k users** | Scale backend horizontally (Cloudflare automatically handles this). Move rate limiter from in-memory to Redis (persistent across instances). Monitor LLM API costs ($50-500/month). Add request caching layer (if same text simplified twice, return cached result). |
| **10k-100k users** | Multiple backend regions for latency. Redis cluster for distributed rate limiting. Implement aggressive caching (Cloudflare Cache API). Consider batch processing for off-peak requests to reduce LLM API costs. Set monthly cost limits. |
| **100k-1M+ users** | Dedicated backend infrastructure (not serverless). Implement in-house caching layer. Consider cheaper LLM models (Groq, local inference) for simple rewrites. Build request deduplication. Separate analytics pipeline (Kafka → BigQuery). Plan for LLM API costs ($5k-50k/month). |

### First Scaling Bottleneck

**LLM API costs.** At 10k users with 5 requests/day each = 50k requests/day. At $0.03 per 1k tokens and ~150 tokens per request = ~$225/day. Solution: Implement request caching, use cheaper models for simple text, batch API calls.

## Anti-Patterns

### Anti-Pattern 1: Hardcoded API Keys in Extension Code

**What people do:** Store OpenAI/Anthropic API key directly in extension JavaScript files.

**Why it's wrong:**
- Keys are readable by anyone who installs the extension
- Extraction possible via Chrome DevTools
- Attackers can use the key maliciously, billing you for their usage
- Common vulnerability in 2025 Chrome extensions
- Chrome Web Store immediate rejection

**Do this instead:**

```typescript
// WRONG ❌
// content-script.ts
const apiKey = 'sk-proj-abc123def456...';
fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ messages: [...] })
});

// RIGHT ✅
// service-worker.ts (calls only YOUR backend)
fetch('https://backend.example.com/api/simplify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, preferences })
  // Backend never exposes API key to client
});

// backend/handlers/simplifyText.ts
app.post('/api/simplify', async (req, res) => {
  // API key retrieved from environment (set via CI/CD)
  const apiKey = process.env.OPENAI_API_KEY;
  // User never sees this key
});
```

### Anti-Pattern 2: Storing Full Text Content in chrome.storage

**What people do:** Persist original text, rewritten text, or full conversation history to chrome.storage for "history" feature.

**Why it's wrong:**
- Violates privacy-first positioning
- Creates recovery surface for sensitive deleted content
- Increases attack surface (local storage can be inspected/hacked)
- Unnecessary; users can screenshot or copy-paste if they need to save

**Do this instead:**

```typescript
// WRONG ❌
// service-worker.ts
const history = { originalText: '...', rewrittenText: '...' };
await chrome.storage.local.set({ history });

// RIGHT ✅
// service-worker.ts - store only metadata
const history = {
  timestamp: Date.now(),
  inputLengthBin: 234, // Quantized, not exact
  tone: 'casual',      // Settings used, not content
  responseTimeMs: 1200, // Performance metric
  liked: true          // User satisfaction (no content)
};
await chrome.storage.local.set({ recentRequests: [...history] });
// User's text never persisted. If they need it, they can copy from webpage.
```

### Anti-Pattern 3: Making API Calls from Content Script

**What people do:** Content script directly calls OpenAI API with credentials or tries to reach backend directly.

**Why it's wrong:**
- Content script is "less trustworthy than the extension service worker" (official Chrome docs)
- Credentials exposed to webpage's JavaScript (if injected)
- Malicious website could intercept/reroute requests
- Content security policy violations
- Harder to enforce rate limiting

**Do this instead:**

```typescript
// WRONG ❌
// content-script.ts
const backendUrl = 'https://api.openai.com/v1/chat/completions';
fetch(backendUrl, {
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ text, preferences })
});

// RIGHT ✅
// content-script.ts - always route through service worker
chrome.runtime.sendMessage({
  type: 'SIMPLIFY_TEXT',
  payload: { text: selectedText }
});

// service-worker.ts - only place with network permissions
const backendUrl = 'https://backend.example.com/api/simplify';
const response = await fetch(backendUrl, {
  method: 'POST',
  body: JSON.stringify({ text, preferences })
});
```

### Anti-Pattern 4: Blocking Service Worker with Synchronous Operations

**What people do:** Perform time-consuming operations (API calls) in the message handler, expecting service worker to stay alive.

**Why it's wrong:**
- Service workers terminate after 5 minutes of inactivity
- A 10-second API request might complete after service worker is terminated
- Response never reaches content script; request silently fails

**Do this instead:**

```typescript
// WRONG ❌
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const result = fetchBackendAPI(message.text); // Synchronous
  sendResponse(result); // Might fail if worker terminates
});

// RIGHT ✅
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      const result = await fetchBackendAPI(message.text); // Async
      sendResponse({ success: true, data: result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true; // Signal: response will be asynchronous
});
```

### Anti-Pattern 5: No Rate Limiting (Resource Exhaustion Risk)

**What people do:** Allow unlimited requests to backend without checking limits.

**Why it's wrong:**
- Cost explosion: 1 request = ~$0.03. 1k requests = $30. 100k requests = $3000.
- Malicious user could loop requests and bill you
- Malicious website could intercept and spam requests
- No protection against bugs (infinite loop)

**Do this instead:**

```typescript
// Implement two-layer rate limiting

// Layer 1: Soft limit in extension (user-friendly)
const checkRateLimit = async () => {
  const { rateLimitState } = await chrome.storage.local.get('rateLimitState');

  if (rateLimitState.requestCount >= 50) {
    showToast('You have 50 requests/hour. Come back later!');
    return false;
  }

  rateLimitState.requestCount++;
  await chrome.storage.local.set({ rateLimitState });
  return true;
};

// Layer 2: Hard limit on backend (security)
app.use((req, res, next) => {
  const clientId = req.headers['x-client-id'];
  redis.incr(`ratelimit:${clientId}`, (count) => {
    if (count > 100) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    next();
  });
});
```

### Anti-Pattern 6: Complex State Management Too Early

**What people do:** Use Redux, MobX, or other heavy state libraries before MVP.

**Why it's wrong:**
- Extension state is simple: 5-10 values (preferences, usage count, onboarding status)
- Redux adds 40KB+ bundle bloat
- Chrome extension messaging patterns are already complex; Redux adds another layer
- Over-engineering delays launch

**Do this instead:**

```typescript
// SIMPLE: Use browser's built-in APIs

// For preferences: chrome.storage.sync/local
// For UI state: React Context + useReducer
// For async: async/await

// Only if state grows to 20+ values, consider:
// - Zustand (2KB, minimal)
// - jotai (5KB)

// Avoid:
// - Redux (40KB)
// - MobX (15KB)
// - Recoil (30KB)
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **OpenAI API** | Backend calls via SDK, API key stored server-side in environment variables only, never in extension code | Implement request batching and caching to reduce costs. Use streaming (SSE) for better UX. Monitor daily spend. |
| **Anthropic Claude API** | Same pattern: backend calls with server-side API key, never expose to client | Consider for cost optimization (Claude Haiku cheaper than GPT-4o-mini for simple rewrites). |
| **Analytics Backend** | Extension sends anonymous events (tone used, depth used, requestCount) via HTTPS. Never send content, preferences, or user identity. | Only send aggregated metrics. Hash user IDs. Make it impossible to re-identify individuals. |
| **Chrome Web Store** | Extension published via store, auto-updates. Ensure manifest.json complies with store policies. No CORS needed (extension bypasses origin policy). | Review takes 2-7 days for first submission. Privacy policy required. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Content Script ↔ Service Worker** | `chrome.runtime.sendMessage()` for one-time requests. `chrome.runtime.connect()` for long-lived ports (streaming). | Never trust messages from content script (could be spoofed by webpage). Validate all input in service worker. |
| **Service Worker ↔ Backend API** | Fetch API over HTTPS. No XHR (blocked in service worker). Proper async/await for long operations. | Service worker can terminate; use promises. Timeout requests (30 seconds recommended). Retry with exponential backoff on failure. |
| **Service Worker ↔ UI (Popup/Side Panel)** | `chrome.runtime.sendMessage()` for two-way communication. UI sends preference changes; service worker sends status updates. | Popup/Side Panel has full extension permissions. Can read chrome.storage directly. |
| **Storage ↔ All Components** | `chrome.storage.local.get/set()` and `chrome.storage.sync.get/set()`. Async APIs (use Promises). | Local storage persists per browser. Sync storage syncs across user's Chrome browsers. Always validate data format on read. |

## Sources

- [Chrome for Developers: Extensions / Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3) - Architecture patterns, security best practices
- [Chrome for Developers: Handle events with service workers](https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events) - Service worker responsibilities and lifecycle
- [Chrome for Developers: Message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging) - Messaging APIs, request/response patterns
- [Chrome for Developers: Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) - DOM access, isolation boundaries
- [Chrome for Developers: Create a side panel](https://developer.chrome.com/docs/extensions/develop/ui/create-a-side-panel) - UI patterns, persistent interface
- [Chrome for Developers: chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage) - State persistence across contexts
- [AI Chrome Extension: What It Is & How to Architect an Agent](https://www.gptbots.ai/blog/ai-chrome-extension) - Streaming patterns, security architecture
- [Streaming AI Responses with WebSockets, SSE, and gRPC](https://medium.com/@pranavprakash4777/streaming-ai-responses-with-websockets-sse-and-grpc-a481cab403d3) - SSE vs WebSocket tradeoffs
- [Guide to Implementing Streamed Text Generation Based on SSE Technology](https://www.oreateai.com/blog/guide-to-implementing-streamed-text-generation-based-on-sse-technology-creating-ai-interaction-experience-in-the-browser) - SSE implementation for streaming
- [Secure API Keys in a Chrome Extension](https://rustyzone.substack.com/p/secure-api-keys-in-a-chrome-extension) - Secret management patterns
- [Victor On Software: Message passing in Chrome extension (2024)](https://victoronsoftware.com/posts/message-passing-in-chrome-extension/) - Current messaging patterns
- [Service Worker in Browser Extensions - WhatFix Engineering Blog](https://medium.com/whatfix-techblog/service-worker-in-browser-extensions-a3727cd9117a) - Service worker best practices
- [HTTP Interceptors for API Rate Limiting and Throttling](https://requestly.com/blog/http-interceptors-for-api-rate-limiting-and-throttling/) - Rate limiting patterns

---
*Architecture research for: Chrome extension with backend AI proxy*
*Project: Twelveify*
*Researched: 2026-02-20*
*Confidence: HIGH — All patterns from official documentation, verified community standards*
