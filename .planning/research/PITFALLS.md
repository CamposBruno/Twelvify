# Pitfalls Research: AI-Powered Chrome Extension (Text Simplification)

**Domain:** AI-backed text simplification Chrome extension (Manifest V3)
**Researched:** 2026-02-20
**Confidence:** HIGH (Chrome MV3 patterns verified via official docs; AI integration pitfalls cross-validated with multiple sources; text handling edge cases documented in community forums and official Chrome docs)

---

## Critical Pitfalls

### Pitfall 1: Service Worker Lifetime Termination Eating Global State

**What goes wrong:**
Service workers are ephemeral — they terminate when idle (often after ~30 seconds) to conserve memory. Developers rely on global variables to store preferences, pending requests, or user state, only to discover those variables are lost when the service worker restarts. On the next user action, the extension has no memory of what happened before, causing unpredictable behavior or lost context.

**Why it happens:**
Developers migrating from Manifest V2 (persistent background pages) unconsciously assume a persistent runtime. Service workers feel like they have the same lifetime guarantees. Without explicit state management, global variables appear to work during initial testing but fail when the service worker cycle is interrupted.

**How to avoid:**
- Never rely on global variables for state that must persist across service worker lifecycle boundaries
- Treat `chrome.storage.local` as the single source of truth for all application state (user preferences, pending simplification requests, feature adoption analytics)
- Implement a state initialization function that runs at service worker startup and loads from `chrome.storage.local`
- For time-sensitive data (e.g., "is a simplification currently in progress?"), use storage with a TTL pattern (store a timestamp, check if stale on load)
- Test by manually terminating the service worker in DevTools (Service Workers pane) and verifying that restarting the extension re-initializes correctly

**Warning signs:**
- State appears to work during development but breaks after the extension sits unused
- Behavior is inconsistent when switching between tabs
- User preferences revert unexpectedly
- Analytics data sporadic or missing entirely

**Phase to address:**
Phase 1 (Core Extension Architecture) — must establish correct storage architecture before any feature development.

---

### Pitfall 2: Event Listener Registration Inside Async Code Never Fires

**What goes wrong:**
Developers register event listeners inside promise `.then()` blocks or `async` function bodies, expecting them to be available when events fire. When the service worker restarts (which happens _after_ an event fires), those conditionally-registered listeners don't exist yet, so the event is missed. The extension becomes unresponsive to user interactions.

**Why it happens:**
Developers assume all code runs synchronously at startup. They write defensive code like:
```javascript
chrome.runtime.onMessage.addListener(async (msg) => {
  const config = await chrome.storage.local.get('userPrefs');
  // handle message with config
});
```
This works until the service worker restarts — then on the next message, no listener exists because the code after `await` never runs.

**How to avoid:**
- Register ALL event listeners at the top level of your service worker script, before any async operations
- Move initialization logic into a separate async function that doesn't block listener registration
- Pattern: Register listeners first, then call an async init function that populates state:
```javascript
// At top level
chrome.runtime.onMessage.addListener(handleMessage);
chrome.action.onClicked.addListener(handleIconClick);

// Then async init runs after listeners are registered
initExtension();

async function initExtension() {
  const config = await chrome.storage.local.get('userPrefs');
  // Store in storage, not global variables
}
```
- For the content script messaging the backend, ensure the content script doesn't assume the service worker has state from previous messages — each message should be self-contained or reference stored state

**Warning signs:**
- Extension works fine during normal use but stops responding after a few minutes of inactivity
- Second or third invocation of the extension fails silently
- DevTools shows no errors, but the extension doesn't react to user clicks
- Message passing between content script and service worker becomes unreliable

**Phase to address:**
Phase 1 (Core Extension Architecture) — establish the listener registration pattern early.

---

### Pitfall 3: setTimeout/setInterval Silently Cancelled on Service Worker Termination

**What goes wrong:**
A developer uses `setTimeout()` to debounce multiple text simplification requests or retry a failed API call after 5 seconds. When the service worker terminates (which happens unpredictably), the timer is cancelled without warning. The retry never happens; the debounce stops working.

**Why it happens:**
Developers expect timers to behave like they do in persistent background pages or regular JavaScript. Service workers terminate timers when they shut down to prevent memory leaks. No error is thrown — the callback just never fires.

**How to avoid:**
- Never use `setTimeout()` or `setInterval()` in the service worker for operations that must survive termination
- Replace with Chrome's Alarms API (`chrome.alarms`), which persists across service worker restarts
- Example: Instead of `setTimeout(() => retryRequest(), 5000)`, use:
```javascript
chrome.alarms.create('retrySimplification', { delayInMinutes: 0.083 }); // ~5 seconds
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'retrySimplification') {
    retryRequest();
  }
});
```
- Register alarm listeners at the top level, alongside message listeners
- For debouncing user actions, consider debouncing on the content script side instead (before sending the message to the service worker)

**Warning signs:**
- Retry logic never triggers
- Debounced requests occasionally get sent multiple times unexpectedly
- Delayed operations (like marking analytics as sent) sometimes don't complete
- Rate limiting mitigation timers fail, causing request storms

**Phase to address:**
Phase 1 (Core Extension Architecture) → Phase 2 (Error Handling & Resilience).

---

### Pitfall 4: CSP Blocks Fetch to Backend, or Incorrect CSP Breaks the Extension

**What goes wrong:**
A developer writes the fetch request to the backend API but forgets to add the API domain to the CSP's `connect-src` directive (or `default-src`). Every fetch silently fails because CSP blocks it. The extension appears broken — no errors in the service worker console, but the simplification never returns.

Alternatively, a developer over-permits CSP to debug issues (`connect-src *`) and ships it to production, passing security review by accident, then someone exploits an XSS vulnerability to make unauthorized API calls.

**Why it happens:**
CSP is strict in Manifest V3 and requires explicit allowlisting of every external domain. Developers don't realize CSP rejection is silent when using `fetch()` — it fails with no console warning. The habit from Manifest V2 of using looser CSP carries over.

**How to avoid:**
- In `manifest.json`, explicitly list the backend API domain in CSP:
```json
"content_security_policy": {
  "extension_pages": "default-src 'self'; connect-src 'self' https://your-backend.com; script-src 'self';"
}
```
- For any external domain the service worker fetches from, add to `connect-src`
- Never use `connect-src *` or `default-src *` in production
- Test CSP violations by intentionally making a fetch to an unlisted domain and verifying it fails with a CSP error in the service worker console
- Use `fetch()` with an explicit error handler to catch network failures:
```javascript
try {
  const response = await fetch(backendUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
} catch (e) {
  console.error('Backend fetch failed:', e);
  // Return graceful fallback or error state
}
```

**Warning signs:**
- Extension loads but simplification always fails
- Network tab shows no requests to the backend
- Service worker console has no fetch errors, but the API call never completes
- CSP errors visible in the extension console (chrome://extensions > Service Worker)

**Phase to address:**
Phase 1 (Core Extension Architecture) → Phase 2 (Backend Integration).

---

### Pitfall 5: Uncontrolled API Costs Spiraling Due to No Rate Limiting

**What goes wrong:**
An extension is published to users. A single user highlights large blocks of text repeatedly, or a bug causes the extension to retry failed requests in an exponential loop. Within hours, the backend receives 100K API calls instead of the expected 1K, consuming months of budget. The backend becomes an uncontrolled financial liability.

**Why it happens:**
Free beta mindset: developers assume usage will be light and defer cost controls as a "later problem." No per-request token budgets, no user-level rate limits, no circuit breaker to stop calling the API when it's failing. The API provider's rate limit becomes the only brake, and by then, significant charges have accumulated.

**How to avoid:**
- Implement hard and soft budget limits on the backend immediately, before publishing:
  - Soft limit (80%): Log warning, notify ops
  - Hard limit (100%): Return HTTP 429 (Too Many Requests) and stop processing, or switch to free fallback behavior
- Set per-user rate limits (e.g., max 5 simplifications per minute, max 50 per day for free users)
- Implement exponential backoff with a maximum retry count (e.g., max 3 retries, each backoff doubles, max 2 min delay)
- On the client, cache the simplified text for identical selections (same text + same preferences = same result) to avoid redundant API calls
- Add a "cancel in-flight request" mechanism so users can stop a slow simplification instead of it timing out and retrying
- Monitor API costs daily in the backend dashboard; set up alerts if daily cost exceeds a threshold (e.g., 10x expected daily cost)
- In the content script, implement a simple debounce so rapid selections don't trigger multiple simultaneous requests

**Warning signs:**
- API provider sends unexpectedly high usage alerts
- Backend logs show requests from same user with identical text within seconds
- Cost per user is wildly inconsistent (some users 10x more expensive than others)
- Failed requests are retried indefinitely instead of failing fast

**Phase to address:**
Phase 2 (Backend Integration) — must be in place before MVP launch.

---

### Pitfall 6: Text Selection Edge Cases Break Content Script

**What goes wrong:**
The extension works fine when selecting plain text in paragraphs. But when a user selects text inside a form field (`<input>`, `<textarea>`, `contenteditable`), or text split across multiple shadow DOM boundaries, or hidden text revealed by CSS, the content script fails to extract the selection correctly. Sometimes it gets an empty string, sometimes malformed text, sometimes the selection is lost entirely.

**Why it happens:**
`window.getSelection()` and `document.execCommand()` have complex behavior across different element types. Text inside shadow DOM roots is not directly accessible to the page's JavaScript. Form fields have their own selection API (`input.selectionStart/End`). The extension's naïve selection handler doesn't account for these variations.

**How to avoid:**
- Handle selection extraction for multiple element types:
```javascript
function getSelectedText() {
  const selection = window.getSelection();

  // Case 1: Normal text selection
  if (selection.toString().length > 0) {
    return selection.toString();
  }

  // Case 2: Form field selection (input, textarea)
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    return activeElement.value.substring(start, end);
  }

  // Case 3: Contenteditable selection
  if (activeElement && activeElement.contentEditable === 'true') {
    return selection.toString();
  }

  return null;
}
```
- For shadow DOM: the content script cannot directly access text inside shadow roots (security boundary). Workaround: Inject a tiny script into the page (not the extension context) that extracts selection from shadow DOM and posts it back via `window.postMessage()`
- Test selection behavior on: `<input>`, `<textarea>`, `<div contenteditable>`, text inside iframes, text inside shadow DOM (e.g., YouTube comments), selected text that spans multiple elements
- When replacing text, be aware that replacing inside form fields requires setting `element.value` and triggering a change event, not using `document.execCommand('insertText')`

**Warning signs:**
- Extension works on news articles but fails on LinkedIn/Twitter (which use complex DOM)
- Form fields can't be simplified because selection is empty or malformed
- User reports that contenteditable areas (e.g., Google Docs, email compose) don't work
- Selected text appears truncated or corrupted

**Phase to address:**
Phase 2 (Text Selection & Replacement) → Phase 3 (Advanced DOM Handling) for shadow DOM support.

---

### Pitfall 7: MutationObserver Performance Degradation or Missed DOM Updates

**What goes wrong:**
The extension uses a `MutationObserver` to watch for newly injected content (e.g., on a single-page application where paragraphs load dynamically). The observer is set to watch too many elements or with settings that trigger on every character typed. The observer callback runs constantly, consuming CPU and making the page sluggish. Or, the observer is missing key mutations because the developer didn't enable the right mutation flags (`childList`, `characterData`, etc.), so new content appears without being observed.

**Why it happens:**
Developers copy paste a broad `MutationObserver` configuration without understanding which flags trigger callbacks. They observe the entire document body with `subtree: true`, or they forget to call `disconnect()` when the observer is no longer needed.

**How to avoid:**
- Be specific about what mutations to observe:
```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      // Handle newly added DOM nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if this is new text content worth observing
          handleNewContent(node);
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,    // Observe child nodes being added/removed
  subtree: true,      // Observe all descendants
  characterData: false, // Don't observe text changes (too noisy)
  characterDataOldValue: false,
  attributes: false   // Don't observe attribute changes
});
```
- Throttle or debounce the mutation callback to avoid running expensive operations on every mutation:
```javascript
let mutationTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(mutationTimeout);
  mutationTimeout = setTimeout(() => {
    // Process mutations every 250ms instead of on every change
    processPendingMutations();
  }, 250);
});
```
- Call `observer.disconnect()` when the page unloads or the extension is disabled
- In the callback, iterate over mutations and process only the ones you care about (e.g., only text nodes, not attribute changes)
- Test on a real single-page application (LinkedIn, Twitter, Gmail) to ensure the observer keeps up with DOM changes

**Warning signs:**
- Page becomes noticeably slower after the extension is enabled
- DevTools shows the mutation observer callback running hundreds of times per second
- New content loads on an SPA but the extension doesn't detect it
- The extension's simplification requests never trigger for dynamically-added text

**Phase to address:**
Phase 2 (Text Selection & Replacement) → Phase 3 (SPA Support).

---

### Pitfall 8: Backend Timeout or Failure With No Graceful Fallback

**What goes wrong:**
The user highlights text, clicks the simplify icon, and nothing happens. The request to the backend times out after 30 seconds or fails silently. The extension shows no error message, no spinner, no explanation. The user thinks the extension is broken and uninstalls it.

**Why it happens:**
The content script sends a message to the service worker, which fetches from the backend, and if the fetch fails, the error is logged to the service worker console (which the user never sees). There's no timeout handling, no retry logic, and no UI feedback mechanism to tell the user what's happening.

**How to avoid:**
- Implement timeout and retry at the content script level:
```javascript
async function simplifyText(text, preferences) {
  const maxRetries = 2;
  const timeoutMs = 10000; // 10 second timeout per attempt

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use Promise.race to enforce timeout
      const result = await Promise.race([
        chrome.runtime.sendMessage({
          action: 'simplify',
          text,
          preferences
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);

      return result;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Last attempt failed, return error
        return { error: 'Failed to simplify. Try again later.' };
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
```
- Update the UI to show the user what's happening:
  - Show a spinner while waiting for the backend
  - Display an error message if the request fails
  - Offer a "retry" button
- Set a reasonable timeout (10–30 seconds depending on expected latency), not indefinite
- Log failures and errors for monitoring (anonymous, no content data), so the team can detect if the backend is having issues
- Implement a fallback behavior: if the backend is down, show a friendly message like "Our service is temporarily unavailable. Try again in a few minutes." rather than silently failing

**Warning signs:**
- Users report the extension "doesn't work" but no errors appear
- Backend logs show timeouts but the content script doesn't know
- Support requests pile up without a clear technical cause
- No visibility into whether failures are user-side, network, or backend

**Phase to address:**
Phase 2 (Backend Integration) → Phase 3 (Error Handling & UX).

---

### Pitfall 9: Privacy Violations — Content Logged on Backend

**What goes wrong:**
To debug issues, the backend logs all incoming requests, including the text being simplified. This text is sensitive: it could include medical notes, financial information, or personal secrets. The backend stores logs in an unsafe location, or logs are accidentally committed to version control. An attacker accesses the logs and harvests private user data.

**Why it happens:**
Developers enable debug logging to troubleshoot issues, forgetting that this is production user data. The privacy-first promise (made in PROJECT.md) becomes a liability if the backend doesn't enforce it. Logs aren't explicitly excluded from backups or encrypted.

**How to avoid:**
- Establish an explicit logging policy: never log content, only metadata
  - Allowed: request ID, timestamp, user ID hash, response time, error code, feature flag state
  - Forbidden: the text being simplified, user preferences, request payloads, response content
- If debugging requires seeing sample content, hash it or truncate it so it's not reversible:
```javascript
// Backend logging
const contentHash = require('crypto').createHash('sha256').update(text).digest('hex');
logger.info({
  requestId,
  timestamp,
  contentHash, // Only the hash, not the original text
  contentLength: text.length,
  responseTime,
  succeeded: true
});
```
- Ensure logs are:
  - Stored in a restricted location with access controls (not world-readable)
  - Encrypted at rest
  - Automatically deleted after 7–30 days (retention policy)
  - Never committed to version control (use `.gitignore` for log directories)
- During code review, explicitly check that logging code doesn't accidentally include content
- Document the privacy policy on the extension homepage and in the Chrome Web Store listing, specifically stating what data is and isn't collected

**Warning signs:**
- Debug logs in production contain user text
- Logs are stored in unencrypted text files with world-readable permissions
- The team doesn't have a clear policy on what's safe to log
- Users ask "what data do you store?" and there's no clear answer

**Phase to address:**
Phase 1 (Core Extension Architecture) — establish logging policy early.

---

### Pitfall 10: Floating Icon UI Breaks Due to Z-Index Wars and Positioning Conflicts

**What goes wrong:**
The extension renders a floating icon/button to trigger the simplification. On some websites (especially those using high z-index values), the icon appears behind other content and is unusable. On other sites, the icon positions itself incorrectly, overlapping text or button it's supposed to follow. Mobile-friendly sites reflow the icon off-screen.

**Why it happens:**
Simple z-index values (e.g., `z-index: 9999`) are not enough — they only work within their own stacking context. If the page has an element with a stacking context and a lower z-index, all children of that element will sit behind the floating icon, even with a z-index of millions. The developer didn't account for shadow DOM isolation or absolute vs. fixed positioning across different viewport states.

**How to avoid:**
- Use the Popover API (Chrome 114+) or CSS Anchor Positioning (Chrome 125+) instead of manual z-index management:
```javascript
// Modern approach: Popover API
const icon = document.createElement('div');
icon.popover = 'auto'; // Automatically stays on top layer
document.body.appendChild(icon);
```
- If using Popover is not viable, use the CSS `top-layer` concept:
  - Create a modal/dialog and render the icon inside it
  - The browser manages z-index for you
- If manual positioning is necessary:
  - Inject the icon into a new shadow DOM root at `document.body` level (not nested inside page elements)
  - Set `position: fixed` so it stays relative to the viewport
  - Use a reasonable z-index (e.g., `2147483647`, the max safe integer) as a backstop
- Test positioning on:
  - High z-index websites (e.g., Google Workspace, Figma, Slack)
  - Content inside iframes
  - Mobile viewport and responsive design
  - Dark mode and light mode if the icon has colored backgrounds
- Consider a "configurable position" setting so users can move the icon if it conflicts with a specific site's UI

**Warning signs:**
- Icon is invisible or unusable on certain sites (e.g., Twitter, Gmail)
- Icon position shifts unexpectedly when scrolling
- Icon overlaps clickable elements on the page and blocks interaction
- Users report the extension doesn't work on their most-used sites

**Phase to address:**
Phase 2 (UI & Text Selection) → Phase 3 (Advanced UI) if high z-index site support is needed.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Logging all request payloads for debugging | Quick visibility into failures | Privacy violation, data breach risk, GDPR issues | Never. Use hashed content or metadata only. |
| Synchronous fetch to backend on user action | Simple code, feels responsive | Blocks the UI if backend is slow, timeouts kill user trust | Only in MVP if backend latency is confirmed <1s; add async timeout immediately after. |
| Storing API key in extension code or localStorage | Simplest way to authenticate with backend | Key exposed to any XSS or compromised content script, financial liability | Never. Use backend-to-backend auth; extension is unauthenticated. |
| Using `<all_urls>` permission instead of host_permissions | Single permission covers all sites | Privacy red flag, unnecessary permission scope, Chrome Web Store review rejection | Never. Use `activeTab` or specific host_permissions. |
| No rate limiting on backend, trusting users to behave | Faster to launch | Uncontrolled costs, vulnerability to abuse, financial disaster | Only in alpha with known users. Add rate limits before beta/public launch. |
| Storing user preferences in global variables | Simplest state management | Lost when service worker terminates, user frustration | Never. Preferences must persist; use `chrome.storage.local`. |
| Single retry with no exponential backoff | Fewer moving parts | Retry storms when backend is struggling, user-facing cascade failures | Only if timeout is <2s and backend is highly reliable. Add backoff if >2s latency. |
| No error handling in message passing | Less code to write initially | Silent failures, impossible to debug, poor user experience | Never. Every message should have a timeout and fallback. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Content script to service worker messaging** | Assume the service worker has state from previous messages or is still running. | Each message should be self-contained or reference stable storage (`chrome.storage.local`). Never assume the service worker remembers context. |
| **Backend API calls** | Hardcode the API URL in the extension code; no way to switch backends. | Store the backend URL in `chrome.storage.local` (configurable) or inject it via a manifest `host_permissions` rule. Use environment variables at build time to set the default. |
| **User preferences personalization** | Store preferences only in memory (global variables). | Always persist to `chrome.storage.local` on every change. Load on service worker startup. |
| **Error reporting from content script** | Send raw error messages to logging backend without rate limiting. | Batch errors, deduplicate by error type, never send user content. Rate limit to 1 error report per minute per error type. |
| **Text replacement in the page** | Use `innerHTML` to replace content, risking XSS. | Use `textContent` for text-only replacement, or safely set `innerText`. Sanitize any HTML carefully. |
| **Managing the floating icon lifecycle** | Create the icon on every page load without removing the old one. | Create once per page, store a reference, remove on unload or when extension is disabled. Use a flag to check if already initialized. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| **Polling for configuration changes** | Background service worker constantly checks storage or makes API calls every second. | Use `chrome.storage.onChanged` listener (event-driven) instead of periodic polling. | At 1K+ active users; the constant polling becomes noticeable CPU drain per user. |
| **Broad MutationObserver watching entire document** | Page becomes visibly slower after extension loads; JavaScript execution jank. | Observe only the container where new content appears; disconnect when not needed; use specific mutation flags (`childList` only, not `characterData`). | At >1000 DOM mutations per minute; observer callback overhead becomes visible. |
| **Fetching large content for simplification** | Backend receives 50KB+ requests and timeouts trying to call the LLM. | Implement a max input length (e.g., 5KB) and truncate or show a warning if user selects more. | At >10K+ character selections; API latency and costs explode. |
| **Caching simplified text without expiry** | Extension's memory grows unbounded; old cached results persist forever. | Implement a simple LRU cache with max size (e.g., 50 entries) or TTL (1 hour). | At 100+ unique text selections; memory usage becomes noticeable on lower-end devices. |
| **Retrying failed requests without backoff** | Backend receives thundering herd of retries during outage, causing cascading failure. | Implement exponential backoff; add jitter to prevent synchronized retries. | At >10 simultaneous users; coordinated retry storms crash the backend. |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| **Storing API keys in extension code or `chrome.storage.local`** | API key exposed to page scripts (XSS) or reverse-engineered from extension code. Attacker can drain quota or bill your account. | Never store API keys in the extension. Use a backend proxy; the extension talks to your backend, your backend talks to the API provider. Your backend uses server-side API keys. |
| **Not validating incoming messages from content script** | Malicious website injects crafted messages to manipulate the extension or trigger expensive API calls. | Always validate the sender and the message structure. Use `chrome.runtime.getURL()` to verify messages come from your extension. Type-check message payloads. |
| **Logging user content to console or analytics** | User's private data (medical notes, passwords, financial info) leaked in logs or analytics dashboards. | Never log content; only log hashed content, metadata, or anonymized summaries. Establish a strict logging policy at the start. |
| **Over-permissive CSP (`connect-src *`)** | An XSS vulnerability in the extension allows an attacker to fetch from any domain, exfiltrating data or attacking other services. | Explicitly list only the domains the extension needs (your backend, maybe one API provider). Use `default-src 'self'` as the base. Review CSP in security tests. |
| **Using `eval()` or `Function()` constructor** | Classic code injection attack; user input can be executed as code. | Never use `eval()`. Avoid `Function()` constructor. Use safe DOM manipulation APIs (`textContent`, `innerText`). If you must dynamically generate code, use Web Workers in a sandboxed context. |
| **Iframe communication without message verification** | A malicious iframe can send crafted messages to your content script and trick it into performing unintended actions. | Always verify the origin of postMessage events. Use `event.origin === expectedOrigin` check. Never blindly execute messages from cross-origin iframes. |
| **Hardcoding credentials or secrets** | Credentials committed to version control are exposed to anyone with repo access (including attackers who fork the repo). | Use environment variables or a secrets manager; never commit `.env` files or API keys. Rotate API keys regularly. Use backend-to-backend authentication. |
| **Not checking chrome.runtime.lastError after async chrome APIs** | API calls silently fail with no indication (e.g., message passing when service worker is terminated). Extension behavior becomes unpredictable. | After every async Chrome API call, check `chrome.runtime.lastError` and handle the error: `if (chrome.runtime.lastError) { console.error(chrome.runtime.lastError.message); }`. |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| **No feedback while waiting for backend** | User highlights text, clicks icon, nothing happens for 5 seconds, then suddenly the text changes. User thinks the extension is broken and clicks again, triggering duplicate requests. | Show a spinner immediately when the user clicks the icon. Update the UI with the simplified text as soon as it arrives. Show a "Simplifying..." label. Disable the icon during the request to prevent double-clicks. |
| **Error messages with no recovery option** | Backend times out, extension shows "Error" and the text reverts. User has no idea what happened or how to fix it. | Show a specific error (e.g., "Our service is temporarily unavailable") and offer an "Undo" button or "Try again" button. Log the error for the team to investigate. |
| **Personalization preferences never stick** | User sets tone to "casual" on the first day, then the next day the extension reverts to "default" tone. User feels the extension doesn't remember preferences. | Save preferences to `chrome.storage.local` on every change. Load preferences when the service worker starts. Show a confirmation when preferences are saved ("Preferences saved"). |
| **Floating icon is jumpy or repositions unexpectedly** | User highlights text, clicks the icon, but as they move the mouse toward it, the icon jumps to a new position. User frustration, accidental clicks on wrong elements. | Use fixed positioning or Popover API to keep the icon stable relative to the screen. Test that the icon doesn't move when the page scrolls or the viewport resizes. Provide a "hide" option if the icon interferes with the page. |
| **Keyboard accessibility not considered** | User tries to use Tab to navigate to the icon and trigger it, but the extension doesn't respond. Accessibility fail. | Make the floating icon keyboard-accessible. Add a keyboard shortcut (e.g., Ctrl+Shift+S) to trigger simplification of the selected text. Support Tab navigation and Enter to activate. |
| **No indication of which text was simplified** | User clicks the icon to simplify a selection, the text is replaced, but 30 seconds later the user forgets which text changed. If simplification is wrong, they don't know what the original was. | Highlight the replaced text briefly (e.g., yellow background for 2 seconds) so the user knows what changed. Provide an "Undo" button that reverts to the original text. |
| **Overwhelming onboarding** | Extension shows a 5-step onboarding wizard on first use. User skips it and doesn't know what the extension does. | Use progressive onboarding: ask for one preference on first use (e.g., "What tone do you prefer?"), ask for another on the second use (e.g., "Explanation depth?"). By the 5th use, the user has naturally configured preferences without feeling overwhelmed. |

---

## "Looks Done But Isn't" Checklist

- [ ] **Text Simplification:** Works on plain paragraphs but hasn't been tested on: form fields, contenteditable areas, shadow DOM, text inside iframes, selected text that spans multiple elements. Verify each before marking done.
- [ ] **Backend Integration:** API calls work when backend is responsive but haven't been tested with: 10+ second latency, network timeout, HTTP 500 errors, rate limit responses (HTTP 429), request cancellation. Add tests for each before shipping.
- [ ] **Floating Icon:** Icon displays correctly on developer's test sites but hasn't been tested on: high z-index sites (Gmail, Figma, Slack), mobile viewport, dark mode, RTL languages. Test on at least 5 real sites.
- [ ] **Service Worker State:** Extension appears to work during development but hasn't been tested with: service worker manually terminated (DevTools), extension disabled and re-enabled, user inactive for >1 minute (service worker termination), multiple browser profiles. Simulate each.
- [ ] **Error Handling:** Happy path works but hasn't been tested with: backend down, user offline, rate limit hit, malformed backend response. Add error UI for each case.
- [ ] **Performance:** Extension works but hasn't been tested with: 100+ DOM mutations per second (SPA), 50KB+ text selections, multiple simplification requests in parallel, browser with limited memory. Profile on realistic data.
- [ ] **Privacy & Security:** Code reviewed but hasn't been tested for: XSS (inject malicious HTML in selected text), CSRF (crafted message from malicious site), CSP bypass, localStorage inspection, API key exposure. Run a security checklist.
- [ ] **User Preferences:** Preferences are saved but haven't been tested with: extension re-enable, switching Chrome profiles, clearing extension data, browser update. Verify persistence in each scenario.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| **Logged sensitive content in backend logs** | MEDIUM | 1) Immediately stop logging content in production. 2) Purge all existing logs containing user content. 3) Audit who accessed logs in the past 30 days. 4) Notify affected users if content was exposed. 5) File a security advisory if needed. 6) Implement automated log scanning to prevent recurrence. |
| **API key exposed in extension code** | HIGH | 1) Immediately revoke the exposed key. 2) Generate a new key. 3) Push an emergency update to all users (auto-update via Chrome Web Store). 4) Monitor old key for unauthorized use for 30 days. 5) Audit API logs for suspicious activity. 6) Consider refunding users if charges occurred. |
| **Service worker lifetime bug causes lost user state** | LOW | 1) Migrate state from global variables to `chrome.storage.local`. 2) Push a manual fix (version bump, auto-update). 3) Users won't need to do anything; state will be restored on next launch. 4) Consider adding a "restore preferences" one-time prompt if users have preferences set before the fix. |
| **Backend timeout handling missing, causing silent failures** | MEDIUM | 1) Add timeout and retry logic to content script. 2) Add error UI to show the user what's happening. 3) Push update. 4) Monitor for a week to ensure failures are now visible and recoverable. |
| **Floating icon conflicts with page UI, making extension unusable** | MEDIUM | 1) Switch to Popover API or CSS Anchor Positioning. 2) Add a keyboard shortcut as an alternative to clicking the icon. 3) Push update. 4) Consider adding a "disable icon on this domain" setting for power users. |
| **Uncontrolled API costs reaching 10x expected budget** | HIGH | 1) Implement hard rate limit immediately (return 429 after threshold). 2) Investigate which users/requests caused the spike (analyze logs). 3) If an external attack, block suspicious IPs/users. 4) Contact API provider to discuss charges and potential credits. 5) Communicate to users that rate limits are now in place. 6) Push updated extension. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification Method |
|---------|------------------|-----------|
| Service Worker Lifetime Termination | Phase 1: Core Architecture | 1) Manually terminate SW in DevTools. 2) Verify extension re-initializes and restores preferences. 3) Test after 1+ min inactivity. |
| Event Listener Registration in Async Code | Phase 1: Core Architecture | 1) Verify all listeners registered at top level. 2) Disable/re-enable service worker. 3) Confirm events still fire. 4) Run extension through inactivity cycle. |
| setTimeout/setInterval Cancellation | Phase 1: Core Architecture | 1) Replace any timers with Alarms API. 2) Verify alarm fires after SW termination. 3) Test retry logic survives inactivity. |
| CSP Blocking Backend Fetch | Phase 2: Backend Integration | 1) Verify backend domain in CSP. 2) Test fetch to unlisted domain fails with CSP error. 3) Test fetch to allowed domain succeeds. 4) Code review CSP policy. |
| Uncontrolled API Costs | Phase 2: Backend Integration | 1) Implement rate limiting on backend. 2) Test hitting rate limit (expect HTTP 429). 3) Monitor cost alerts. 4) Load test with 100+ concurrent requests; verify costs cap. |
| Text Selection Edge Cases | Phase 2: Text Selection & Replacement | 1) Test selection in: input, textarea, contenteditable, plain text, shadow DOM (iframe workaround). 2) Test replacement in each context. 3) Test nested/multi-element selections. |
| MutationObserver Performance | Phase 3: SPA Support | 1) Load an SPA (Reddit, Twitter). 2) Verify new content is observed. 3) Monitor CPU usage before/after enabling observer. 4) Set observer-specific limits (max 1000 mutations/sec). |
| Backend Timeout Without Fallback | Phase 2: Backend Integration → Phase 3: UX | 1) Simulate slow backend (5s latency). 2) Verify spinner shown, timeout after 10s. 3) Retry with exponential backoff. 4) Show error UI if all retries fail. |
| Privacy Violations (Logging Content) | Phase 1: Core Architecture | 1) Code review all logging statements. 2) Verify no content in logs (only hashes). 3) Scan logs for sensitive data monthly. 4) Document logging policy in team wiki. |
| Floating Icon Z-Index/Positioning | Phase 2: UI & Text Selection | 1) Test on high z-index sites (Gmail, Figma, Slack). 2) Verify icon visible and clickable. 3) Test mobile viewport; icon should not be off-screen. 4) Use Popover API or CSS Anchor (Chrome 125+). |

---

## Sources

- [Migrate to Service Workers - Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers)
- [Resolving Content Security Policy Issues in Chrome Extension Manifest V3](https://medium.com/@python-javascript-php-html-css/resolving-content-security-policy-issues-in-chrome-extension-manifest-v3-4ab8ee6b3275)
- [Service Worker Debugging - Chrome Extensions](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/3QAinUhCiPY)
- [Why LLM Rate Limits and Throughput Matter More Than Benchmarks](https://www.codeant.ai/blogs/llm-throughput-rate-limits)
- [API Rate Limiting 2026 | How It Works & Why It Matters](https://www.levo.ai/resources/blogs/api-rate-limiting-guide-2026)
- [Web-Facing Change PSA: Fix text selection on Shadow DOM with delegatesFocus](https://groups.google.com/a/chromium.org/g/blink-dev/c/egWmzZ4MNuU)
- [Chrome Extensions and Shadow DOM](https://blog.railwaymen.org/chrome-extensions-shadow-dom)
- [Detect DOM changes with mutation observers - Chrome for Developers](https://developer.chrome.com/blog/detect-dom-changes-with-mutation-observers)
- [Updated Privacy Policy & Secure Handling Requirements - Chrome Web Store](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Browser Extension Security Vulnerabilities Cheat Sheet - OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Browser_Extension_Vulnerabilities_Cheat_Sheet.html)
- [Retrying requests when back online - Workbox](https://developer.chrome.com/docs/workbox/retrying-requests-when-back-online)
- [Effective Strategies for Handling Browser Timeouts in API Requests](https://medium.com/@nidishllc/effective-strategies-for-handling-browser-timeouts-in-api-requests-fbc774f2e3ed)
- [Meet the top layer: a solution to z-index:10000](https://developer.chrome.com/blog/what-is-the-top-layer)
- [CSS Anchor Positioning: Complete Guide to the New CSS API 2026](https://devtoolbox.dedyn.io/blog/css-anchor-positioning-guide)
- [AI API Pricing Guide 2026: Cost Comparison and How to Optimize Your Spending](https://medium.com/@anyapi.ai/ai-api-pricing-guide-2026-cost-comparison-and-how-to-optimize-your-spending-c74f2254a2a8)
- [Declare Permissions - Chrome Extensions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Grammarly and QuillBot Chrome Extensions Privacy Risks 2026](https://www.helpnetsecurity.com/2026/01/28/incogni-chrome-extensions-privacy-risks-report/)
- [Chrome Extension V3: Mitigate service worker timeout issue](https://medium.com/@bhuvan.gandhi/chrome-extension-v3-mitigate-service-worker-timeout-issue-in-the-easiest-way-fccc01877abd)
- [Using Shadow DOM - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

---

*Pitfalls research for: AI-powered text simplification Chrome extension (Twelveify)*
*Researched: 2026-02-20*
