# Phase 1: Foundation & Text Selection - Research

**Researched:** 2026-02-22
**Domain:** Chrome Extension architecture (Manifest V3), service worker state management, content script text selection, floating UI
**Confidence:** HIGH

## Summary

Phase 1 lays the foundational architecture for Twelveify using Manifest V3 (the current Chrome Extension standard). The core challenge is managing ephemeral service worker state, which terminates after 30 seconds of inactivity, requiring all state to persist to `chrome.storage` rather than global variables. Text selection across diverse DOM structures is straightforward using the Selection API in content scripts, but shadow DOM text is inaccessible (deferred to Phase 4). The Popover API (Chrome 114+, now cross-browser stable as of 2025) eliminates z-index fighting for floating UI. Modern frameworks like WXT with React provide excellent developer experience for extension development.

**Primary recommendation:** Use WXT + React + Zustand for state management (in Phase 2), build content script with Selection API for text capture, persist all state to `chrome.storage.local`, and use Popover API for the floating simplify button. Validate CSP configuration with `host_permissions` for backend domain access.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXTF-01 | Chrome Extension uses Manifest V3 with proper CSP configuration | CSP is mandatory; minimum policy enforced; host_permissions declares backend domain access |
| EXTF-02 | Service worker manages state via chrome.storage (not global variables) | Service workers terminate after 30s inactivity; chrome.storage.local is the standard persistence layer |
| EXTF-03 | Content script properly handles text selection across diverse page structures | Selection API works across standard DOM; shadow DOM requires workarounds (Phase 4) |
| EXTF-04 | Extension follows Chrome Web Store policies and is submittable | 2-step verification, testing requirements, single purpose clarity, meaningful support documented |
| SIMP-01 | User can highlight text on any webpage and see a floating action icon appear | Popover API provides z-index-free floating UI; Mutation Observer detects text selection events |
| DISP-03 | User sees a loading indicator while the AI processes their text | UI state managed in chrome.storage.local; streaming response handling deferred to Phase 2 |

</phase_requirements>

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|--------|---------|---------|--------------|
| WXT | Latest (v0.20+) | Extension framework with Vite, MV3 support, HMR | Industry-leading framework for modern extension development; multi-framework support; fastest iteration |
| Chrome Manifest V3 | Current (2025) | Extension configuration and security model | Mandatory standard; MV2 deprecated; all production extensions use MV3 |
| React | 18+ | UI component framework | Industry standard; excellent component composition; WXT has first-class support |
| TypeScript | 5.0+ | Type-safe JavaScript | Extension complexity requires type safety; WXT defaults to TS |
| Zustand | 4.0+ | Lightweight state management (Phase 2) | Smaller than Redux; works well with WXT; easy persistence with middleware |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 3.0+ | Utility-first CSS | Phase 3+ for UI polish; not critical for Phase 1 |
| Popover API | Native (Chrome 114+) | Floating UI z-index elimination | Floating simplify button; stable cross-browser as of 2025 |
| Selection API | Native | Text selection capture | Content script text detection; standard DOM only |
| chrome.storage API | MV3 standard | State persistence | All data must use this; `local` for ephemeral, `sync` for persistent |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| WXT | Plasmo | Plasmo is mature but WXT has faster HMR and better DX; WXT is 2025 recommendation |
| WXT | CRXJS | CRXJS lacks framework support; requires more manual configuration |
| React | Vue/Svelte | Either works with WXT; React has larger ecosystem for extension components |
| Zustand | Redux | Redux is overkill for phase 1; Zustand scales with project |
| Popover API | Custom z-index stacking | Popover API is standard; custom solution maintains z-index debt (known pitfall) |

**Installation:**
```bash
npm create wxt@latest twelvify -- --template react
# Installs WXT with React 18, TypeScript, and MV3 template
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entrypoints/
│   ├── content.ts          # Runs on every webpage (text selection detection)
│   ├── background.ts       # Service worker (message router, state manager)
│   └── popup/
│       ├── index.html
│       └── App.tsx         # Future: options UI
├── components/
│   └── FloatingButton.tsx   # Popover-based UI (injected into content)
├── storage/
│   ├── useStorage.ts       # chrome.storage hooks
│   └── types.ts
├── messaging/
│   ├── messages.ts         # Type-safe message definitions
│   └── handlers.ts         # Message listeners in background
├── utils/
│   ├── textSelection.ts    # Selection API helpers
│   └── logging.ts
└── public/
    └── manifest.json       # MV3 manifest
```

### Pattern 1: Service Worker State Persistence

**What:** All application state lives in `chrome.storage.local`, not global variables. Service workers terminate after 30 seconds of inactivity, making global state unreliable.

**When to use:** Always for extension state (user preferences, request history, etc.)

**Example:**
```typescript
// CORRECT: Use chrome.storage
chrome.storage.local.set({
  simplifyCount: 5,
  lastSimplified: Date.now()
});

// WRONG: Global variables disappear when service worker reloads
let globalSimplifyCount = 0; // Lost after 30s inactivity!
```

Source: [Chrome service worker lifecycle docs](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)

### Pattern 2: Content Script → Service Worker Messaging

**What:** Content scripts detect text selection and send messages to the service worker, which handles business logic and persistence.

**When to use:** Always when content scripts need to trigger background work

**Example:**
```typescript
// content.ts: Detect text selection, send to background
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString();
  if (selectedText?.length > 3) {
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: selectedText
    });
  }
});

// background.ts: Handle message, update state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEXT_SELECTED') {
    chrome.storage.local.set({
      pendingText: message.text,
      isVisible: true
    });
  }
});
```

Source: [Chrome messaging API docs](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)

### Pattern 3: Top-Level Event Listeners

**What:** All `chrome.runtime.onMessage` and `chrome.alarms.onAlarm` listeners MUST be registered at the top level of background.ts, not inside async functions.

**When to use:** Always in service workers; async listeners are not guaranteed to fire

**Example:**
```typescript
// background.ts
// ✓ CORRECT: Top level
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message);
});

// ✗ WRONG: Inside async function
async function initBackground() {
  chrome.runtime.onMessage.addListener(...); // May not register!
}
initBackground();
```

Source: [Chrome service worker lifecycle docs](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)

### Pattern 4: Popover API for Floating Button (Phase 1)

**What:** Use the native Popover API instead of custom z-index stacking. Popovers automatically layer above page content without z-index fights.

**When to use:** All floating UI in extensions; eliminates z-index wars entirely

**Example:**
```typescript
// FloatingButton.tsx: Inject into page
export function FloatingButton() {
  return (
    <>
      <button
        popovertarget="simplify-popover"
        className="fixed bottom-4 right-4"
      >
        Simplify
      </button>
      <div id="simplify-popover" popover="auto">
        <p>Click to simplify this text</p>
      </div>
    </>
  );
}

// content.ts: Inject component
const root = createRoot(document.createElement('div'));
root.render(<FloatingButton />);
```

Source: [Popover API docs](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap), [Popover API RFC](https://developer.chrome.com/docs/web-platform/popover-api/)

### Anti-Patterns to Avoid
- **Using global variables for state:** Service worker will be terminated and variables lost. Always use `chrome.storage`.
- **Async event listener registration:** Listeners registered inside promises/async functions won't fire reliably. Register at top level.
- **Custom z-index stacking for floating UI:** Use Popover API instead; eliminates entire class of bugs.
- **Accessing `<textarea>` selection via `getSelection()`:** Use `HTMLInputElement.selectionStart/End` for form fields instead.
- **Attempting to access shadow DOM text selection:** Not possible; defer to Phase 4 with injected script workaround.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence across service worker restarts | Custom IndexedDB layer | `chrome.storage.local` | Built-in, simpler API, guaranteed compatibility |
| Floating UI z-index management | Custom stacking context | Popover API (native) | Solves entire class of bugs; native and cross-browser stable (2025) |
| Text selection on page | Custom selection watcher | `window.getSelection()` + `selectionchange` event | Standard API, works everywhere except shadow DOM |
| Extension build/bundling | webpack/rollup config | WXT | Handles MV3 requirements, hot reload, zip generation automatically |
| State management | Custom message routing | Zustand + localStorage middleware | Proven patterns; Zustand is lightweight |

**Key insight:** Manifest V3 enforces constraints (service worker termination, CSP) that look like you need custom solutions but actually have standard answers. The ecosystem has converged on these patterns.

## Common Pitfalls

### Pitfall 1: Service Worker State Volatility

**What goes wrong:** Developer writes global variables in background.ts, assuming they persist. After 30 seconds of inactivity, the service worker terminates. Page sends a message, service worker reinitializes, and global state is lost. User sees broken behavior.

**Why it happens:** Background.ts looks like a normal script file; developers unfamiliar with web workers expect global state to persist.

**How to avoid:**
- Treat service workers as stateless functions
- Always read/write state via `chrome.storage` APIs
- Use Zustand in Phase 2 with a storage middleware for automatic persistence

**Warning signs:**
- State variables declared at module scope in background.ts
- No `chrome.storage` usage in background script
- Flaky behavior that depends on user activity timing

**Validation:** In Phase 1 planning, verify every state variable is stored via `chrome.storage.local` with explicit set/get patterns.

### Pitfall 2: Z-Index Wars with Floating Button

**What goes wrong:** Floating button appears behind page content on high z-index sites (Gmail, Figma, Twitter). Custom CSS stacking context fails because page CSS overrides it. User can't interact with button.

**Why it happens:** Regular DOM elements layer based on z-index; without a special rendering layer, page content can bury the button. Developers try to outbid z-index (99999) but always lose to determined page authors.

**How to avoid:**
- Use Popover API exclusively for floating UI (Chrome 114+, now stable cross-browser)
- Popover renders in a top layer above all page content
- No z-index competition possible

**Warning signs:**
- Custom z-index values in floating button CSS
- Reports of button hidden on certain sites
- Attempts to use `!important` to force z-index

**Validation:** Verify floating button uses Popover API exclusively; zero custom z-index in Phase 1.

### Pitfall 3: CSP Blocks Backend Calls (Phase 2 Risk)

**What goes wrong:** Service worker tries to fetch from backend URL; CSP silently fails because backend domain not in manifest. No error shown; request never reaches backend. User sees "no response" error.

**Why it happens:** CSP for extension pages is strict by default. `connect-src` directive must explicitly list allowed domains. Missing configuration = silent failure.

**How to avoid:**
- Declare backend domain in `host_permissions` in manifest.json
- Test fetch from service worker in DevTools before shipping
- Verify backend domain is production URL, not localhost (if testing locally, add both)

**Warning signs:**
- Network tab shows request never leaves browser
- No console error (CSP violations are silent for fetch)
- Works in DevTools but fails in production

**Validation:** In Phase 1 manifest, include `host_permissions` with placeholder backend URL (e.g., `https://simplify.example.com/*`). Phase 2 will replace with actual domain.

### Pitfall 4: Content Script Timing Issues

**What goes wrong:** Content script tries to query for selected text immediately on page load. No text is selected yet, so floating button never appears. User highlights text but nothing happens.

**Why it happens:** Content script runs at `document_start` or `document_idle` (depending on config), but page DOM might load later. Selection events need active listeners that survive page navigation.

**How to avoid:**
- Use `selectionchange` event listener (not just `mouseup`)
- Register listener at top of content script (before any async work)
- Test across diverse sites: news sites, blogs, Twitter, GitHub, forums
- Handle dynamic DOM (MutationObserver may be needed for SPAs)

**Warning signs:**
- Floating button doesn't appear on first selection
- Works on some sites but not others
- Works after manual refresh but not on back-button navigation

**Validation:** Phase 1 success criteria requires testing on 5+ diverse page structures (news, blog, social, forum, technical docs).

### Pitfall 5: Manifest V3 Resource Access

**What goes wrong:** Developer tries to use `<script src="path/to/lib.js"></script>` in injected UI. CSP blocks inline scripts. UI doesn't load.

**Why it happens:** MV3 CSP forbids inline scripts and external script loading. Only option is bundled JavaScript. Developers unfamiliar with MV3 try old MV2 patterns.

**How to avoid:**
- Use WXT to automatically handle bundling and injection
- All scripts must be bundled/transpiled by build step
- No inline scripts in HTML; use React components instead

**Warning signs:**
- Hardcoded `<script>` tags in HTML
- Errors about "script violates CSP"
- Works in development but fails in packaged extension

**Validation:** Ensure zero inline `<script>` tags in any HTML files; all UI delivered via React components.

## Code Examples

Verified patterns from official sources:

### Text Selection Detection in Content Script
```typescript
// content.ts
// Source: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

document.addEventListener('selectionchange', () => {
  const selectedText = window.getSelection()?.toString().trim();

  // Only show button for selections > 3 chars
  if (selectedText && selectedText.length > 3) {
    // Send to background worker
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: selectedText,
      timestamp: Date.now()
    });
  }
});

// Also listen for mouseup to catch rapid selections
document.addEventListener('mouseup', () => {
  const text = window.getSelection()?.toString().trim();
  if (text?.length > 3) {
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      text: text,
      timestamp: Date.now()
    });
  }
});
```

### Service Worker Message Handler with State Persistence
```typescript
// background.ts
// Source: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle

// CRITICAL: Register listener at top level (not in async function)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEXT_SELECTED') {
    // Persist selection to storage
    chrome.storage.local.set({
      selectedText: message.text,
      selectedAt: message.timestamp,
      isLoading: true
    }, () => {
      // Notify content script that message was received
      sendResponse({ status: 'received' });
    });
  }

  // Return true to indicate async response
  return true;
});

// Later: clear loading state when done
function markSimplificationComplete() {
  chrome.storage.local.set({ isLoading: false });
}
```

### Storage Hook for React Components
```typescript
// storage/useStorage.ts
// Pattern for reading/writing chrome.storage in React

export function useStorageValue<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key]);
      }
    });
  }, [key]);

  const updateValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.local.set({ [key]: newValue });
  };

  return [value, updateValue];
}

// Usage in component:
export function FloatingButton() {
  const [selectedText, setSelectedText] = useStorageValue<string>(
    'selectedText',
    ''
  );

  return <button>{selectedText ? 'Simplify' : 'Select text...'}</button>;
}
```

### Manifest V3 with Host Permissions
```json
{
  "manifest_version": 3,
  "name": "Twelveify",
  "description": "Simplify any text on the web",
  "version": "1.0.0",

  "permissions": [
    "storage",
    "runtime"
  ],

  "host_permissions": [
    "https://api.simplify.example.com/*"
  ],

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],

  "background": {
    "service_worker": "background.js"
  },

  "action": {
    "default_title": "Twelveify"
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manifest V2 background pages | Manifest V3 service workers | 2023 (MV2 sunset began) | Service workers terminate after 30s; all state must persist to storage |
| Global variables in background | `chrome.storage.local/sync` | MV3 standard | State survives service worker restarts |
| Custom z-index stacking | Popover API | 2024-2025 (cross-browser stable) | Floating UI no longer requires z-index management |
| CRXJS/Plasmo as primary frameworks | WXT as industry standard | 2024-2025 | WXT's faster HMR and framework support now dominant recommendation |
| IndexedDB for extension storage | `chrome.storage` API | MV3 standard | Simpler API, automatic sync, extension-specific |

**Deprecated/outdated:**
- **Manifest V2:** Sunset by Google; all new extensions must use MV3
- **Background pages:** Replaced by service workers; persistent background pages not allowed in MV3
- **Inline scripts in extension pages:** CSP forbids them; must use bundled/transpiled code
- **Manual z-index management:** Popover API handles it natively

## Open Questions

1. **Exact backend domain for Phase 2**
   - What we know: Backend will be Cloudflare Workers (from PROJECT STATE)
   - What's unclear: Specific domain URL (staging vs production)
   - Recommendation: Use placeholder URL in Phase 1 manifest (`https://api.simplify.example.com/*`); Phase 2 planning will confirm production domain. Add localhost for development if needed.

2. **Shadow DOM text selection scope**
   - What we know: Content script cannot access text in shadow DOM (security boundary)
   - What's unclear: How many target sites use shadow DOM for main content?
   - Recommendation: Test Phase 1 on common sites (news, blogs, Twitter, GitHub). If shadow DOM becomes issue, defer solution to Phase 4 using injected script + postMessage workaround.

3. **Floating button positioning strategy**
   - What we know: Popover API handles z-index automatically
   - What's unclear: Should button appear at cursor location, text location, or fixed position?
   - Recommendation: Phase 1 can use fixed position (right-bottom corner). Phase 3 can add smart positioning. This keeps Phase 1 scope tight.

4. **Loading indicator UI location**
   - What we know: Need to show loading while Phase 2 AI processing happens
   - What's unclear: Should loading appear in floating button, replace button, or new overlay?
   - Recommendation: Phase 1 can prepare state (`isLoading` flag in chrome.storage). Phase 2 will add visible loading UI. This aligns with incremental delivery.

5. **Chrome version support for Popover API**
   - What we know: Popover API stable in Chrome 114+ (released early 2024)
   - What's unclear: What's minimum Chrome version for Twelveify? (affects feature detection)
   - Recommendation: Assume Chrome 114+. If supporting earlier versions, add feature detection fallback: if (!HTMLElement.prototype.popover) { use alternative } for Phase 1. Phase 2 can require Chrome 114+.

## Sources

### Primary (HIGH confidence)
- [Chrome service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle) — Service worker termination, state persistence, event listener registration
- [Chrome messaging API](https://developer.chrome.com/docs/extensions/develop/concepts/messaging) — Content script to service worker communication patterns
- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) — Text selection via Selection API, DOM access
- [Chrome CSP for extensions](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy) — CSP configuration, minimum enforced policy
- [Chrome host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) — Backend domain declaration
- [Selection API spec](https://w3c.github.io/selection-api/) — Standard for text selection across DOM
- [Popover API](https://developer.chrome.com/docs/web-platform/popover-api/) — Native floating UI without z-index

### Secondary (MEDIUM confidence, verified with official sources)
- [WXT Extension Framework](https://wxt.dev/) — 2025 industry-standard framework for MV3 extensions with React support
- [State of Browser Extension Frameworks 2025](https://redreamality.com/blog/the-2025-state-of-browser-extension-development) — Analysis comparing WXT, Plasmo, CRXJS
- [Chrome Web Store policies (2025)](https://developer.chrome.com/docs/webstore/program-policies/policies) — Submission requirements, 2-step verification, single purpose clarity

### Tertiary (MEDIUM confidence, ecosystem-wide consensus)
- [Popover API cross-browser status (April 2025)](https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap) — Reached Baseline Widely Available across all major browsers
- [Shadow DOM text selection limitations](https://blog.railwaymen.org/chrome-extensions-shadow-dom) — Security boundary prevents content script text access; documented workarounds

## Metadata

**Confidence breakdown:**
- **Standard stack (WXT/React/TS/Zustand):** HIGH — Verified with 2025 framework comparisons, official WXT docs, and ecosystem consensus
- **Service worker state management (chrome.storage):** HIGH — Official Chrome docs clearly specify 30s termination and storage requirement
- **Text selection detection (Selection API):** HIGH — Official Chrome docs + W3C spec + verified working patterns
- **Popover API for floating UI:** HIGH — Official Chrome docs confirm cross-browser stable (April 2025), eliminates z-index concerns entirely
- **Manifest V3 CSP/permissions:** HIGH — Official Chrome docs with current 2025 policy updates
- **Message passing patterns:** HIGH — Official Chrome docs with verified async patterns
- **Common pitfalls (state volatility, z-index, CSP):** MEDIUM-HIGH — Multiple authoritative sources confirm patterns; Phase 1 validation will confirm

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days; standard stack stable, no major API changes expected)
**Updated:** Research reflects Chrome 133+ (released Feb 2025), Manifest V3 current state, Popover API cross-browser status (April 2025 Baseline)
