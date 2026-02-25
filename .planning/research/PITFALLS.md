# Pitfalls Research: Chrome Extension UI Redesign + Production Deploy + Web Store Submission

**Domain:** UI redesign + Render backend deployment + Chrome Web Store submission for Chrome extension
**Researched:** 2026-02-25
**Confidence:** HIGH (official Chrome docs, Render documentation, Web Store policies verified; industry practice patterns confirmed across multiple sources)

---

## Critical Pitfalls for v1.2 Redesign + Ship

### Pitfall 1: Content Script CSS Leaking Into or Being Overridden by Host Page Styles

**What goes wrong:**
The extension redesigns the UI with custom fonts (Permanent Marker, Special Elite) and brand colors. The popup styling ships to production. But when the extension is used on certain websites with aggressive CSS resets or high-specificity styles, the extension's fonts fail to load, colors get overridden, or the layout breaks entirely. On Twitter, Gmail, or news sites with their own design systems, the simplified text styling becomes unreadable or invisible.

**Why it happens:**
CSS specificity battles: the page's stylesheet loads before or after the content script injects styles, and one wins unpredictably. Font-face declarations use `@@extension_id` URLs that may fail if CSP blocks them. The developer tested on clean, simple websites (news articles) but not on complex SPA sites with shadow DOM and CSS-in-JS libraries. Global CSS classes used in the extension (e.g., `.simplified-text`, `.underline`) collide with page classes.

**How to avoid:**
- **Namespace all CSS:** Use highly specific class names prefixed with your extension ID:
  ```css
  .twelvify-simplified-text { /* not .simplified-text */ }
  .twelvify-styled-font { /* not .font */ }
  ```
- **Use Shadow DOM for complete isolation:**
  ```javascript
  const shadowRoot = document.createElement('div');
  shadowRoot.attachShadow({ mode: 'open' });
  // Inject styles and content into shadowRoot, not document.body
  ```
  This creates a new CSS scope where page styles cannot bleed in or be overridden.

- **For inline replacements (not shadow DOM), use inline styles with !important sparingly:**
  ```javascript
  element.style.cssText = `
    font-family: 'Special Elite', serif !important;
    color: #your-brand-color !important;
  `;
  ```
  Only use `!important` if the page is known to have high-specificity competing styles.

- **Load custom fonts from extension package, not external CDN:**
  ```css
  @font-face {
    font-family: 'Permanent Marker';
    src: url('chrome-extension://__MSG_@@extension_id__/fonts/permanent-marker.ttf');
  }
  ```
  Declare fonts as `web_accessible_resources` in manifest.json to avoid CSP blocking.

- **Test on high-CSS-complexity sites:**
  - Gmail (heavy CSS-in-JS, shadow DOM)
  - Twitter/X (complex DOM, TailwindCSS)
  - GitHub (dark mode, CSS modules)
  - Google Docs (contenteditable with complex styling)

  Verify that:
  - Fonts actually load (check DevTools Network tab)
  - Colors match your design on light AND dark mode
  - Text remains readable with page's own styles active
  - No FOUC (flash of unstyled content)

**Warning signs:**
- Font-face fails to load in DevTools (404 or CSP error)
- On certain websites, simplified text is invisible or unreadable
- Users report styles work on some sites but not others (e.g., "works on Medium but not LinkedIn")
- Text color or font family changes unpredictably after page reflows or SPA navigation
- Dark mode sites show unreadable light text if you only tested light mode

**Phase to address:**
Phase 1 (UI Redesign) — must test CSS isolation before shipping redesign to Web Store.

---

### Pitfall 2: Custom Fonts Fail to Load Due to CSP or Missing web_accessible_resources

**What goes wrong:**
The extension redesign includes custom fonts (Permanent Marker, Special Elite) embedded as .ttf or .woff files in the extension package. The developer adds `@font-face` declarations but forgets to list the font files in `web_accessible_resources` in the manifest. When users install the extension, the fonts fail to load silently—no error message, just fallback system fonts. The design doesn't match the mockups.

Alternatively, the manifest CSP is too restrictive and blocks font requests. Or the font file paths are incorrect in the CSS, and the browser can't find them.

**Why it happens:**
Manifest V3 requires explicit declaration of resources that are accessible to content scripts and the page. Developers assume all files in the extension package are accessible by default (true in MV2, not in MV3). They don't check the Network tab in DevTools to verify the font loaded, so the bug isn't caught during development.

**How to avoid:**
- In `manifest.json`, add fonts to `web_accessible_resources`:
  ```json
  "web_accessible_resources": [
    {
      "resources": [
        "fonts/permanent-marker.ttf",
        "fonts/special-elite.woff2"
      ],
      "matches": ["<all_urls>"]
    }
  ]
  ```
  (Scoping to `<all_urls>` is safe because fonts are not sensitive data; they're CSS resources.)

- In content script CSS, use absolute paths:
  ```css
  @font-face {
    font-family: 'Permanent Marker';
    src: url(chrome-extension://__MSG_@@extension_id__/fonts/permanent-marker.ttf);
  }
  ```

- Alternatively, base64-encode small fonts directly in CSS (works for all browsers):
  ```css
  @font-face {
    font-family: 'Permanent Marker';
    src: url(data:font/ttf;base64,AAABDQEAEA...);
  }
  ```
  (Use a tool like `woff2base64` to generate.)

- Verify fonts load:
  1. Open extension in DevTools
  2. Inject content script with font styles
  3. Check Network tab for font requests (should be 200, not 404 or CSP block)
  4. On a real website, check Computed Styles to confirm font-family is applied
  5. Test on multiple sites; fonts should load consistently

- Document font licensing:
  - Permanent Marker and Special Elite are Google Fonts (open source, CC0 license)
  - Include license attribution in your extension description or privacy policy if required

**Warning signs:**
- Fonts don't appear in DevTools Network tab (likely not in `web_accessible_resources`)
- Network tab shows 404 for font URLs
- CSP error in DevTools console: "Refused to load font because it violates Content Security Policy"
- Font displays correctly in development (when running unpacked) but fails after Chrome Web Store install
- Users report text is always in default serif/sans-serif, never the custom font

**Phase to address:**
Phase 1 (UI Redesign) — verify fonts in `web_accessible_resources` and load correctly before submitting to Web Store.

---

### Pitfall 3: Render Free Tier Spins Down After 15 Minutes, Breaking SSE Connections Mid-Simplification

**What goes wrong:**
The backend is deployed to Render free tier to save costs. Users start a simplification request, and if the response takes more than 15 minutes to arrive (unlikely but possible during high load or slow API responses), OR if the user's browser is left idle for >15 minutes and tries to make a new request, the Render service is spinning down due to inactivity, and a fresh request triggers a cold start. The cold start adds 5-30 seconds of latency.

More critically: If an SSE stream has been open for >15 minutes without activity (no new events sent), Render may close the connection, dropping the client mid-stream. The user sees a spinner forever, then an error.

**Why it happens:**
Render's free tier automatically suspends services after 15 minutes of no incoming requests to conserve resources. When a request arrives, the service wakes up (cold start). SSE connections are long-lived (intentionally kept open for streaming data), so they naturally go idle between events. Render treats a silent SSE stream as "inactive" and closes the connection or the entire service instance.

The developer didn't realize that "no activity" doesn't mean "no requests"—it means no *new* requests. A single long-lived SSE stream counts as one request, and if no *new* request arrives, the service is eligible for shutdown.

**How to avoid:**

**For production backend use Render Starter plan ($7/mo) or Standard plan:**
- Render Standard plans never spin down
- Starter plans have a slightly longer inactivity timeout but are reliable for moderate traffic
- Cost is justified; free tier is not production-ready for stateful services like SSE

**If free tier must be used (for development/testing):**
1. Implement keep-alive mechanism on the SSE stream:
   ```javascript
   // Backend (Express)
   app.get('/api/simplify', (req, res) => {
     res.setHeader('Content-Type', 'text/event-stream');
     res.setHeader('Cache-Control', 'no-cache');
     res.setHeader('Connection', 'keep-alive');

     // Send a keep-alive comment every 30 seconds
     const keepAliveInterval = setInterval(() => {
       res.write(': keep-alive\n\n');
     }, 30000);

     // Actual simplification logic...
     // After stream ends, clear interval
     req.on('close', () => clearInterval(keepAliveInterval));
   });
   ```

2. Configure Node.js keep-alive timeouts:
   ```javascript
   const server = app.listen(3000);
   server.keepAliveTimeout = 60000; // 60 seconds
   server.headersTimeout = 65000; // 65 seconds, slightly longer than keepAliveTimeout
   ```

3. On the client (extension), set a timeout per request:
   ```javascript
   const timeoutMs = 120000; // 2 minute max per simplification
   const timeoutHandle = setTimeout(() => {
     abortController.abort();
     showError('Simplification took too long. Try again.');
   }, timeoutMs);
   ```

4. For backend warm-up (keeping it alive), use:
   - **Uptime Robot** (free plan: ping every 5 minutes)
   - **GitHub Actions** cron job (free for public repos)
   - **EasyCron** (free tier available)

   These send a dummy request every 5 minutes to keep the service warm.

**Decision:** For v1.2 production deploy, recommend Starter plan ($7/mo) instead of free. The cost is negligible, and reliability is guaranteed.

**Warning signs:**
- Users report that simplification "hangs" sometimes, especially after app sits idle
- Render Metrics tab shows "Cold Start Duration" spikes of 5-30+ seconds
- SSE connections close unexpectedly after 10-15 minutes of inactivity
- Users see spinner for 30+ seconds before simplification arrives
- Error logs show requests arriving after a gap of >15 minutes always fail the first time

**Phase to address:**
Phase 2 (Backend Production Deploy) — configure Render plan and keep-alive before production launch. This is critical.

---

### Pitfall 4: WebSocket/SSE Keep-Alive Timeout Kills Long Simplifications Mid-Stream

**What goes wrong:**
A user selects a large block of text (e.g., a full article, 5000+ words). The simplification request is sent to the backend. The Express server opens an SSE stream and starts writing the simplified text word-by-word. Midway through (say, after 40 seconds), the connection times out because:
1. The intermediate proxy/firewall on the user's network has a 60-second idle timeout
2. Express's default keep-alive timeout is 5 seconds
3. The client's fetch request times out at 30 seconds

The simplified text stops arriving, the stream closes abruptly, and the user sees an incomplete result.

**Why it happens:**
SSE is a long-lived HTTP connection that stays open while the server sends data. If the server doesn't send data frequently enough, intermediary proxies, firewalls, or the operating system assume the connection is dead and close it. By default, Express's `keepAliveTimeout` is 5 seconds, so any SSE stream that pauses for >5 seconds triggers a disconnect.

The developer didn't configure keep-alive parameters or test with large text selections that take >30 seconds to simplify.

**How to avoid:**
- Configure Node.js/Express keep-alive explicitly:
  ```javascript
  const server = app.listen(3000);

  // Increase keep-alive from default 5s to 120s (2 minutes)
  server.keepAliveTimeout = 120000;

  // Set headersTimeout to slightly longer than keepAliveTimeout
  // This prevents "Timeout awaiting 'headers'" errors
  server.headersTimeout = 125000;
  ```

- Implement a keep-alive comment in SSE streams:
  ```javascript
  app.get('/api/simplify-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send keep-alive comment every 20 seconds if no data is being sent
    let keepAliveTimer;
    const resetKeepAlive = () => {
      clearTimeout(keepAliveTimer);
      keepAliveTimer = setTimeout(() => {
        res.write(': keep-alive\n\n');
        resetKeepAlive(); // Reset timer
      }, 20000);
    };

    // Start keep-alive timer
    resetKeepAlive();

    // When data is sent, reset the timer
    const sendEvent = (eventName, data) => {
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
      resetKeepAlive();
    };

    // Example: stream simplified text
    (async () => {
      const stream = await openaiStream(text); // Pseudo-code
      for await (const chunk of stream) {
        sendEvent('chunk', { text: chunk });
      }
      sendEvent('done', {});
      clearTimeout(keepAliveTimer);
      res.end();
    })();
  });
  ```

- On the client, set realistic timeouts:
  ```javascript
  const maxSimplifyTimeoutMs = 120000; // 2 minute max for very large text
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), maxSimplifyTimeoutMs);

  try {
    const response = await fetch(backendUrl, {
      signal: controller.signal,
      // ...
    });
    // Handle SSE stream
  } catch (e) {
    if (e.name === 'AbortError') {
      showError('Simplification took too long.');
    }
  } finally {
    clearTimeout(timeoutId);
  }
  ```

- Set a max text length to prevent excessively long simplifications:
  ```javascript
  const MAX_TEXT_LENGTH = 10000; // Reasonable limit
  if (text.length > MAX_TEXT_LENGTH) {
    showError(`Text is too long (${text.length} chars). Please select up to ${MAX_TEXT_LENGTH} characters.`);
    return;
  }
  ```

- Test with realistic latency:
  - Simulate 50ms, 200ms, 500ms, 1000ms latencies
  - Test with large text selections (5KB, 10KB)
  - Verify stream doesn't disconnect mid-transmission
  - Monitor keep-alive comments in browser DevTools Network tab

**Warning signs:**
- Simplification "hangs" when text is large (>2000 words)
- Users see partial simplified text, then connection drops
- "Timeout" errors in console after 30-60 seconds for large requests
- Browser shows RST (reset) packets in Network tab for SSE stream
- Keep-alive comments never appear in SSE stream (keep-alive not configured)

**Phase to address:**
Phase 2 (Backend Production Deploy) — test with realistic text sizes and latencies; configure keep-alive before production.

---

### Pitfall 5: Localhost URLs Still in Production Build, Causing Web Store Rejection

**What goes wrong:**
During development, the extension's manifest or service worker hardcodes the backend URL as `http://localhost:3001/api`. The developer updates this to the production Render URL in some places but misses others. The extension is submitted to the Chrome Web Store with a mix of localhost and production URLs. Or, the manifest has a conditional that still references localhost:

```javascript
// In service worker
const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001'
  : 'https://backend.render.com';
```

But `process.env.NODE_ENV` is never set in the production build, so it defaults to `development` and tries to hit localhost. Google's automated review catches the localhost URL in the manifest and rejects the submission.

**Why it happens:**
The developer didn't do a final build verification. They assume build tools (Vite, WXT) will correctly inject the production URL via environment variables. Or they have multiple build targets (dev, staging, prod) but forgot to test the actual production build before submission. The manifest.json is never manually reviewed before Web Store submission.

**How to avoid:**
- **Set environment variables in build config:**
  ```javascript
  // vite.config.ts or wxt.config.ts
  export default defineConfig({
    define: {
      __API_URL__: JSON.stringify(
        process.env.API_URL || 'https://backend.render.com'
      ),
    },
  });
  ```

- **Use the injected variable in code (not hardcoded):**
  ```javascript
  const API_URL = __API_URL__; // From build-time injection
  ```

- **Before Web Store submission, verify the production build:**
  ```bash
  # Build for production
  API_URL=https://backend.render.com npm run build

  # Unpack the built extension and inspect manifest.json
  unzip dist/extension.zip
  cat manifest.json | grep localhost
  # Should output nothing (no localhost references)

  # Check CSP connect-src to verify backend domain is allowed
  grep "connect-src" manifest.json
  # Should include the production backend domain, not localhost
  ```

- **In manifest.json, explicitly declare the backend domain in CSP:**
  ```json
  "content_security_policy": {
    "extension_pages": "default-src 'self'; connect-src 'self' https://your-render-backend.com;"
  }
  ```

- **Document the build process clearly:**
  ```markdown
  ## Building for Production

  1. Set API_URL environment variable:
     ```bash
     export API_URL=https://twelveify-backend.onrender.com
     ```

  2. Build:
     ```bash
     npm run build
     ```

  3. Verify:
     ```bash
     grep -r "localhost" dist/
     # Should output nothing
     ```

  4. Create production zip and test locally
  5. Submit to Chrome Web Store
  ```

- **Use a CI/CD check before allowing Web Store submission:**
  ```yaml
  # .github/workflows/web-store-check.yml
  - name: Verify no localhost in build
    run: |
      npm run build
      if grep -r "localhost" dist/; then
        echo "ERROR: localhost found in production build"
        exit 1
      fi
  ```

**Warning signs:**
- Web Store rejection: "Extension contains references to localhost or other development URLs"
- Manifest review shows `http://localhost:3001` in any field
- CSP `connect-src` includes `localhost` or `127.0.0.1`
- After install, extension tries to connect to localhost and fails silently
- Build output contains multiple manifest.json files with different URLs

**Phase to address:**
Phase 3 (Web Store Submission) — add a pre-submission build verification step to catch this.

---

### Pitfall 6: Missing or Incorrect Privacy Policy Causes Web Store Rejection

**What goes wrong:**
The extension collects user data (selected text, personalization preferences) and processes it via the backend. The developer provides a privacy policy URL in the Chrome Web Store form, but:
1. The URL is incorrect or returns 404
2. The privacy policy doesn't actually describe what data is collected (it's generic boilerplate)
3. No privacy policy is provided at all; developer assumed it's optional
4. The privacy policy is provided in the description field instead of the dedicated "Privacy Policy" field

Google's automated review rejects the submission with: "Privacy Policy Required" or "Privacy Policy Does Not Match Extension Functionality."

**Why it happens:**
The privacy policy is not considered a "fun" part of shipping—it's a legal/compliance requirement. Developers prioritize feature work and leave it for the end, then rush it or skip it. They don't realize that Google's review is strict about privacy policies, especially for extensions that interact with user-provided content.

**How to avoid:**
- Create a clear, specific privacy policy before submitting to Web Store:
  ```markdown
  # Privacy Policy - Twelveify

  ## Data Collection

  Twelveify does **not** store, log, or retain user text on any server. Here's what happens:

  1. User selects text on a webpage
  2. Text is sent to our backend (Render) via HTTPS
  3. Backend sends text to OpenAI API for simplification
  4. Simplified result is returned to extension
  5. **Text is NOT logged, stored, or used for any other purpose**

  ## Data NOT Collected

  - We do **not** log the original text
  - We do **not** log the simplified result
  - We do **not** store browsing history
  - We do **not** track which websites you visit (beyond connection logs)

  ## Data We DO Collect (Anonymously)

  - **Usage counts**: How many simplifications per user (hashed user ID, no personal info)
  - **Feature adoption**: Which preferences users select (to improve UI)
  - **Error rates**: HTTP status codes and error types (no user content)
  - **Performance metrics**: Simplification latency, success rate

  All data is:
  - Anonymous (no email, username, or identifying info)
  - Aggregated (no per-user logs)
  - Retained for 30 days maximum, then deleted
  - Never shared with third parties

  ## Permissions Justification

  - **activeTab**: Required to access selected text on the current page
  - **storage**: Required to save user preferences (tone, depth) locally
  - **scripting**: Required to inject the simplification button and styled result

  ## Contact

  For privacy questions, email: privacy@twelveify.com
  ```

- In Chrome Web Store submission form:
  - Use the **"Privacy Policy"** field (not the description field)
  - Ensure the URL is live and returns the actual policy (not 404 or a generic landing page)
  - Policy must be public-facing and specific to the extension
  - Include the privacy policy text on your website (e.g., twelvify.com/privacy)

- Make the privacy policy match your actual implementation:
  - If you're using Plausible Analytics on your website, mention it in the privacy policy
  - If you're not logging text, say so explicitly
  - If you're using OpenAI's API, disclose it:
    ```markdown
    ## Third-Party Services

    Twelveify uses OpenAI's API to simplify text. Text sent to OpenAI is subject to OpenAI's privacy policy: https://openai.com/privacy
    ```

- Have legal/compliance review the policy before submitting (especially for data handling claims)

- Include the policy link in your extension description and the landing page footer

**Warning signs:**
- Web Store rejection: "Privacy Policy Required"
- Web Store rejection: "The privacy policy you provided does not match the extension's actual data practices"
- Users can't find the privacy policy URL (404, timeout, or generic page)
- Privacy policy doesn't mention what data is collected, how it's used, or how long it's retained
- No mention of third-party services (OpenAI) or their privacy implications

**Phase to address:**
Phase 3 (Web Store Submission) — finalize privacy policy and test URL before submission. Required for approval.

---

### Pitfall 7: Over-Permissive Permissions Trigger Web Store Rejection (Exceeding Least Privilege)

**What goes wrong:**
The extension's manifest.json includes:
```json
"permissions": ["<all_urls>", "storage", "scripting"],
"host_permissions": ["<all_urls>"]
```

The developer assumed these broad permissions are necessary to "access any website." But Google's review policy explicitly rejects extensions with overly broad permissions. The extension only needs to simplify text on the *current* page the user is viewing, not all pages universally.

Google rejects with: "Extension requests excessive permissions. Scope narrowed to specific domains or use activeTab permission."

**Why it happens:**
Manifest V3 documentation shows `<all_urls>` as an example, and developers use it as a template without understanding the least-privilege principle. They don't realize that `activeTab` (which grants access only to the *currently active* tab) is the modern, preferred approach. Or they assumed `<all_urls>` was necessary for the extension to work on any website.

**How to avoid:**
- Use `activeTab` permission instead of `<all_urls>`:
  ```json
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": []  // Empty; activeTab is sufficient
  ```

  This grants access to content scripts on the currently active tab only—exactly what the extension needs.

- If you must specify certain domains (e.g., for backend API calls), list them explicitly:
  ```json
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": [
    "https://backend.render.com/*"  // Only the backend domain
  ]
  ```

- Avoid requesting permissions you don't use:
  - Remove `"tabs"` if you're not reading tab metadata
  - Remove `"history"` if you're not accessing browsing history
  - Remove `"webRequest"` or `"declarativeNetRequest"` unless you're filtering network requests
  - Remove `"clipboardWrite"` unless you're copying to clipboard

- In manifest.json, document why each permission is needed:
  ```json
  "permissions": [
    "activeTab",       // Access selected text on current page
    "scripting",       // Inject content script and styled result
    "storage"          // Save user preferences locally
  ]
  ```

- Before Web Store submission, audit permissions:
  ```bash
  # Extract permissions from manifest
  jq '.permissions, .host_permissions' manifest.json

  # Verify each permission is actually used in code
  grep -r "activeTab\|scripting\|storage" src/

  # Check for unused permissions (grep returns nothing)
  jq '.permissions[]' manifest.json | \
    while read perm; do
      grep -q "$perm" src/ || echo "Potentially unused: $perm"
    done
  ```

- Test with minimal permissions:
  - Build and install unpacked extension with just `activeTab`
  - Verify text simplification works on various websites
  - If it fails, identify the missing permission and add only that one

**Warning signs:**
- Web Store rejection: "Extension requests excessive or unnecessary permissions"
- Manifest includes `"<all_urls>"` or wildcard host permissions
- `host_permissions` array is non-empty and very broad
- Users see an "access your data on all websites" warning when installing (privacy red flag)
- Permissions list includes items that aren't used in the code

**Phase to address:**
Phase 3 (Web Store Submission) — audit and minimize permissions before submission. This is a common rejection reason.

---

### Pitfall 8: Missing or Invalid Chrome Web Store Metadata (Screenshots, Description, Icons)

**What goes wrong:**
The developer submits the extension to the Chrome Web Store but forgets or provides invalid metadata:
- **Screenshots:** Only 1 screenshot provided; Google requires at least 1, recommends 2-4. Or screenshot shows development UI with "localhost" visible.
- **Description:** Empty or too short (<10 characters). Or description is misleading (e.g., "Ad blocker" when it's a text simplifier).
- **Icon:** Missing or incorrect size (should be 128x128 for primary icon; also provide 16x16 and 48x48 versions).
- **Category:** Not selected or incorrect category chosen.

Google's automated review rejects with: "Missing or invalid extension metadata."

**Why it happens:**
Developers focus on code and features, treating Chrome Web Store metadata as secondary. They upload the extension quickly without filling out all fields carefully. Or they use placeholder screenshots from development that include localhost URLs or WIP UI.

**How to avoid:**
- Prepare metadata BEFORE uploading to Web Store:
  - **Icon (128x128):** The extension's branded icon (with zine/punk aesthetic). Test that it's recognizable at small sizes.
  - **Screenshots (1280x800 min):**
    1. Show the floating button on a real website
    2. Show the popup panel with personalization options
    3. Show before/after simplification (original text + simplified text)
    4. Use clean, production URLs (no localhost)
    5. Highlight the key value: "Select text → Click → Get instant simplification"
  - **Short description (35-character max):** e.g., "Simplify any text on any page"
  - **Full description (4000-character max):**
    ```
    Turn confusing text into plain language instantly.

    Twelveify rewrites complex or technical text into clear, easy-to-understand explanations tailored to you.

    How it works:
    1. Select any text on a webpage
    2. Click the floating icon
    3. See a clear, personalized rewrite in seconds

    Features:
    - Instant simplification (powered by AI)
    - Customizable tone (from casual to formal)
    - Explanation depth control (brief to detailed)
    - One-click undo to see original text
    - Works on any website
    - Zero account needed—start simplifying immediately

    Privacy First:
    - No text is stored on any server
    - No browsing history tracking
    - Anonymous usage data only

    Perfect for students, professionals, and anyone who encounters confusing text.

    [Rate us and let us know what to build next!]
    ```
  - **Category:** "Productivity" or "Utilities" (not "Ad Blocker" or unrelated category)
  - **Language:** English (US) or appropriate regional variant

- Test metadata before submission:
  ```bash
  # Ensure icon files exist and are correct size
  identify extension/icons/icon-128.png
  # Output: extension/icons/icon-128.png PNG 128x128 ...

  # Check description length
  wc -c <<< "Your description"
  # Should be <4000 characters
  ```

- Have someone outside the dev team review the screenshots and description
  - Do they understand what the extension does?
  - Are the screenshots clear and professional?
  - Is the description compelling and honest?

- Include a screenshot showing the extension icon location (where users will find it)

**Warning signs:**
- Web Store submission form shows empty fields or validation errors
- Screenshots contain development UI, localhost URLs, or placeholder text
- Description doesn't clearly explain what the extension does
- Icon is blurry, cut off, or poorly sized at 16x16
- Web Store rejection: "Missing or incomplete store listing"

**Phase to address:**
Phase 3 (Web Store Submission) — prepare all metadata 1-2 weeks before submission; get feedback before uploading.

---

### Pitfall 9: CSP Mismatch Between Manifest and Production Backend Domain

**What goes wrong:**
The manifest.json has the correct CSP:
```json
"content_security_policy": {
  "extension_pages": "default-src 'self'; connect-src 'self' https://backend.render.com;"
}
```

But during development, the developer tested with `localhost:3001`. When the build is finalized, the backend URL is changed to `https://twelveify-backend.onrender.com` in the code, but the CSP is not updated to match. The extension builds and installs, but all requests to the backend are silently blocked by CSP.

The user highlights text, clicks the button, sees a spinner, and it times out. No error message. The service worker console shows CSP violations.

**Why it happens:**
The CSP is set once during development and then forgotten. The code references the backend URL in multiple places, and when the URL changes, the developer updates the code but forgets to update the manifest. Or the build process doesn't inject the backend domain into the CSP dynamically.

**How to avoid:**
- Document where the backend domain needs to appear:
  1. **manifest.json CSP:** `connect-src 'self' https://your-backend.com;`
  2. **Backend URL in code:** `const API_URL = 'https://your-backend.com';`
  3. **Environment variable at build time:** `API_URL=https://your-backend.com npm run build`

- If the backend domain is dynamic, inject it at build time:
  ```javascript
  // vite.config.ts
  export default defineConfig({
    define: {
      __API_DOMAIN__: JSON.stringify(process.env.API_URL || 'https://backend.render.com'),
    },
  });
  ```

- Then, in the manifest.json template (if using a template), interpolate the domain:
  ```json
  {
    "content_security_policy": {
      "extension_pages": "default-src 'self'; connect-src 'self' __API_DOMAIN__;"
    }
  }
  ```

  But *simpler*: Just hardcode the production domain and never change it:
  ```json
  "content_security_policy": {
    "extension_pages": "default-src 'self'; connect-src 'self' https://twelveify-backend.onrender.com;"
  }
  ```

- Before submitting to Web Store, verify CSP:
  ```bash
  # Extract CSP from manifest
  jq '.content_security_policy' manifest.json

  # Ensure your production backend domain is present
  # Should output:
  # {
  #   "extension_pages": "default-src 'self'; connect-src 'self' https://twelveify-backend.onrender.com;"
  # }
  ```

- Test CSP by intentionally making a request to a blocked domain:
  ```javascript
  // In service worker console
  fetch('https://example.com/blocked')
    .catch(e => console.log('Expected failure:', e));
  // Should show CSP error: "refused to connect"

  // Then test to allowed domain
  fetch('https://twelveify-backend.onrender.com/api/health')
    .then(r => console.log('Success:', r.status))
    .catch(e => console.log('Unexpected error:', e));
  // Should succeed (HTTP 200 or similar)
  ```

**Warning signs:**
- All simplification requests timeout
- Service worker console shows CSP violations: "Refused to connect to [backend-domain] because it does not appear in connect-src"
- Backend logs show zero requests from extension, but the extension claims to have sent requests
- After building for production, the extension still tries to connect to localhost:3001 (CSP mismatch + stale backend URL)
- Users report "the extension doesn't work" but no clear error message

**Phase to address:**
Phase 2 (Backend Production Deploy) → Phase 3 (Web Store Submission).

---

### Pitfall 10: Manifest V3 Remote Code Execution (Eval, Dynamic Script Tags)

**What goes wrong:**
The developer adds a "debug mode" to the extension that runs user-provided code to test the simplification logic. They use `eval()` or create a dynamic `<script>` tag:

```javascript
// BAD: eval is forbidden in MV3
const userCode = getUserInput();
eval(userCode); // Chrome Web Store automatic review catches this and rejects
```

Or, during onboarding, the developer fetches a configuration script from a remote server:
```javascript
// BAD: Remote code
const script = document.createElement('script');
script.src = 'https://backend.com/config.js'; // Downloaded dynamically
script.onload = () => { /* use config */ };
document.head.appendChild(script);
```

Google's automated review detects `eval`, `Function()`, or remotely-fetched scripts in the extension code and automatically rejects with: "Extension violates remote code execution policy (Manifest V3 requirement)."

**Why it happens:**
The developer doesn't realize that Manifest V3 has a strict no-eval policy to prevent code injection attacks. They add debug utilities or dynamic config loading without thinking about security implications. Or they copy code from a pre-MV3 extension that used `eval()`.

**How to avoid:**
- **Never use `eval()` or `new Function()` in extension code:**
  ```javascript
  // BAD
  eval('const result = ' + jsonString);

  // GOOD: Use JSON.parse instead
  const result = JSON.parse(jsonString);
  ```

- **Never dynamically fetch and execute scripts:**
  ```javascript
  // BAD
  fetch('/config.js').then(r => r.text()).then(code => eval(code));

  // GOOD: Fetch data, not code
  fetch('/config.json').then(r => r.json()).then(config => {
    applyConfig(config); // applyConfig is a static function
  });
  ```

- **For dynamic behavior, use a message dispatch pattern:**
  ```javascript
  // Instead of eval, use a message handler
  const handlers = {
    'simplify': (text) => simplifyText(text),
    'revert': () => revertChanges(),
    'update-preferences': (prefs) => updatePrefs(prefs),
  };

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const handler = handlers[msg.action];
    if (handler) {
      sendResponse(handler(msg.data));
    }
  });
  ```

- **For configuration, use a static JSON config file or chrome.storage:**
  ```json
  // config.json (shipped in extension package)
  {
    "defaultTone": "casual",
    "maxChars": 10000,
    "apiEndpoint": "https://backend.render.com"
  }
  ```

  Then load at startup:
  ```javascript
  const config = await fetch('config.json').then(r => r.json());
  // Use config, never execute it
  ```

- **If you must support user-provided expressions, use a safe sandbox:**
  - Use a Web Worker in a restricted context
  - Or use a library like `expr-eval` that parses and evaluates mathematical expressions safely (no arbitrary code execution)
  - Or avoid entirely; users don't need to write code in an extension

- **Audit your code for forbidden patterns before submission:**
  ```bash
  # Search for dangerous functions
  grep -r "eval(" src/
  grep -r "new Function" src/
  grep -r "innerHTML" src/  # Can lead to XSS if not careful
  grep -r "dangerouslySetInnerHTML" src/  # React version of innerHTML

  # Search for dynamic script loading
  grep -r "createElement.*script" src/
  grep -r "appendChild.*script" src/
  grep -r "<script.*src=" src/  # Dynamic script tags in templates

  # All of these should return empty (no matches)
  ```

**Warning signs:**
- Web Store rejection: "Extension violates Manifest V3 remote code execution policy"
- Code audit finds `eval()` or `Function()` constructor
- Extension dynamically fetches and executes JavaScript
- Debug features use `eval()` to run arbitrary code
- Anyone can inject arbitrary code into the extension (security vulnerability)

**Phase to address:**
Phase 1 (Core Architecture) → Phase 3 (Web Store Submission). Verify no forbidden patterns before submitting.

---

## Integration Pitfalls Specific to Redesign + Deploy + Ship

| Integration | Pitfall | Impact | Prevention |
|-------------|---------|--------|-----------|
| **UI Redesign + Content Script Injection** | Custom fonts fail to load or are overridden by page styles | Users see broken design; brand colors/fonts don't match | Use Shadow DOM or highly-namespaced CSS; verify fonts in `web_accessible_resources`; test on 5+ high-CSS sites |
| **Backend URL + Manifest CSP** | CSP doesn't include production backend domain; all API calls blocked | Extension appears broken after install; requests timeout silently | Ensure production domain in both code and CSP before building; audit manifest after build |
| **Environment Variables + Build Process** | Localhost URL leaks into production build | Web Store rejects; users can't use extension after install | Set `API_URL` env var at build time; grep build output for localhost; add CI/CD verification step |
| **Privacy Policy + Web Store Submission** | Policy URL returns 404 or is generic boilerplate | Automatic rejection; delays approval; trust erosion | Create specific policy before submission; test URL works; include privacy policy link on landing page |
| **Permissions + Least Privilege** | Manifest includes `<all_urls>` instead of `activeTab` | Web Store rejects; users see privacy warning | Replace `<all_urls>` with `activeTab`; audit each permission against code usage |
| **Render Backend + Stateful SSE** | Free tier spins down during idle; SSE connection closes mid-stream | User sees spinner forever; incomplete simplification; trust lost | Upgrade to Starter plan ($7/mo); implement keep-alive if free tier used; test long streams |
| **Express Server + Keep-Alive Timeouts** | Default 5s keep-alive timeout kills long simplifications (>30s) | Large text selections fail; user frustration | Configure `server.keepAliveTimeout` to 120s; implement keep-alive comments every 20s |
| **Metadata + Screenshots** | Screenshots show localhost URLs; description is empty or misleading | Web Store rejects; poor user first impression if approved | Prepare metadata 1-2 week before; use production URLs in screenshots; get external review |
| **Remote Code Execution + Manifest V3** | Code includes `eval()` or dynamic script loading | Automatic Web Store rejection; security vulnerability | Audit code for eval/Function/dynamic scripts; use static config and message handlers |
| **CSP + Font Loading** | @font-face uses localhost or unregistered domain in production | Fonts don't load; design breaks | Declare fonts in web_accessible_resources; use extension:// URLs or base64; test font load on install |

---

## Phase-Specific Deployment Checklist

### Phase 1: UI Redesign
- [ ] All custom fonts declared in `web_accessible_resources`
- [ ] Font file paths verified (no 404s in production build)
- [ ] CSS namespaced with extension ID prefix (e.g., `.twelvify-*`)
- [ ] Tested on: Gmail, Twitter, GitHub, Medium, LinkedIn, Google Docs (ensure fonts load, colors visible)
- [ ] Dark mode verified (fonts and colors work on both light and dark)
- [ ] No CSS conflicts with page styles (shadow DOM or specificity tested)

### Phase 2: Backend Production Deploy
- [ ] Render plan chosen (Starter plan $7/mo minimum; free tier NOT production-ready)
- [ ] Backend domain hardcoded in manifest CSP
- [ ] Backend domain hardcoded in code (not localhost)
- [ ] Keep-alive timeout configured in Express: `server.keepAliveTimeout = 120000`
- [ ] Keep-alive comments implemented in SSE streams (every 20s)
- [ ] CSP allows production backend domain (grep manifest for domain verification)
- [ ] Max text length enforced (e.g., 10,000 chars) to prevent excessively long requests
- [ ] Timeout per request set to 120s (2 minutes) maximum
- [ ] Backend health endpoint created and tested (`/api/health`)
- [ ] Tested with realistic latency: 50ms, 200ms, 500ms, 1000ms
- [ ] Tested with large text: 1KB, 5KB, 10KB selections
- [ ] Error handling for backend timeout, 429 (rate limit), 500 (server error)
- [ ] Render logs monitored for "Cold Start" events (should be none after first request)

### Phase 3: Web Store Submission
- [ ] No localhost URLs in production build (grep build output)
- [ ] Privacy policy written, URL tested (should load, not 404)
- [ ] Permissions minimized: `activeTab` instead of `<all_urls>`
- [ ] Unused permissions removed
- [ ] Screenshots prepared (2-4 images, production URLs, no localhost)
- [ ] Description written (clear, compelling, honest, <4000 chars)
- [ ] Icon provided (128x128, 48x48, 16x16; recognizable at small sizes)
- [ ] Category selected ("Productivity" or "Utilities")
- [ ] No `eval()`, `Function()`, or remote code execution patterns
- [ ] Manifest.json audited (no development URLs, no overly broad permissions)
- [ ] Extension tested post-install (uninstall, install from Web Store, verify works)
- [ ] Changelog updated with v1.2 features
- [ ] Security review: XSS, CSRF, CSP bypass, localStorage inspection checked
- [ ] Final build test: `API_URL=https://[backend] npm run build` then grep for localhost
- [ ] Web Store submission form filled out completely (no empty fields)

---

## Recovery Strategies for Production Issues

| Scenario | Recovery Steps | Timeline |
|----------|---|----------|
| **Fonts not loading in production** | 1) Verify fonts in `web_accessible_resources`. 2) Check CSP for font loading blocks. 3) Test font paths in extension context. 4) Push hotfix with corrected paths. 5) Monitor Render logs for font request patterns. | 2-4 hours |
| **Backend domain missing from CSP** | 1) Identify correct production domain. 2) Update manifest CSP. 3) Rebuild extension. 4) Push emergency update to Web Store. 5) Test post-update on real website. 6) Monitor for restored backend connectivity. | 1-2 hours (if Chrome auto-updates; users may need manual update) |
| **SSE connections timeout mid-stream** | 1) Increase `server.keepAliveTimeout` to 120s. 2) Implement keep-alive comments. 3) Deploy backend hotfix. 4) Test with large text selections (>5KB). 5) Monitor error logs for timeout patterns. 6) Optional: Push extension update with longer client-side timeout. | 1-2 hours (backend only); 4-24 hours (extension with auto-update) |
| **Render free tier spins down, users see errors** | 1) If critical: immediately upgrade to Starter plan ($7/mo). 2) Configure keep-alive and warm-up pings as interim. 3) Communicate to users: "We've improved backend reliability." 4) Monitor Render Metrics for cold start events (should drop to zero). | Immediate (upgrade) to 1-2 hours (reconfiguration) |
| **Web Store rejection for localhost URLs** | 1) Audit build output: `grep -r "localhost" dist/`. 2) Identify source of localhost in code or manifest. 3) Fix at source (environment variables, hardcoded URLs). 4) Rebuild with `API_URL=` set correctly. 5) Retest build output. 6) Resubmit to Web Store. 7) Update Web Store listing with version notes. | 1-3 hours (fix and resubmit) |
| **Web Store rejection for missing privacy policy** | 1) Write specific privacy policy (not boilerplate). 2) Host on public URL (e.g., twelvify.com/privacy). 3) Verify URL loads and is readable. 4) Update Web Store submission form with correct URL. 5) Resubmit. 6) Cite policy in extension store listing. | 2-4 hours |
| **CSS styles conflict with page, fonts override** | 1) Identify conflicting site (e.g., Twitter, Gmail). 2) Inspect page CSS and find competing selectors. 3) Increase CSS specificity or switch to Shadow DOM. 4) Test on the problem site. 5) Push update. 6) Note the site in known issues / WAD (working as designed) if unfixable. | 4-8 hours (debug + fix) |

---

## Pre-Submission Quality Checklist

**Redesign (Phase 1):**
- [ ] Fonts load on real websites (not just local test)
- [ ] Colors match design mockups on light AND dark mode
- [ ] No FOUC (flash of unstyled content)
- [ ] Text is readable in all color contexts (dark page, light page)
- [ ] Icon is recognizable at 16x16 (DevTools toolbar size)
- [ ] Popup dimensions are appropriate (not too tall, not too narrow)

**Backend Deploy (Phase 2):**
- [ ] Production backend URL hardcoded (no environment-dependent logic)
- [ ] Keep-alive configured (120s timeout, 20s comments)
- [ ] Rate limiting active (100 requests/hour per user, documented)
- [ ] Error responses tested (500, 429, 503) and handled gracefully
- [ ] Large text handling tested (>5KB selections don't crash backend)
- [ ] SSE stream tested with realistic latency and large payloads
- [ ] Health endpoint working (`GET /api/health` returns 200)

**Web Store Submission (Phase 3):**
- [ ] Privacy policy URL tested (loads, is public, is readable)
- [ ] Screenshots show production UI (no localhost, no WIP elements)
- [ ] Description is clear and compelling
- [ ] No `eval()`, `Function()`, or dynamic remote code execution
- [ ] Permissions minimized and justified
- [ ] Manifest CSP includes production backend domain
- [ ] Build output verified free of localhost references
- [ ] Extension installed post-build and tested end-to-end
- [ ] Legal/Privacy review completed (optional but recommended)

---

## Sources

**Chrome Extension + Manifest V3:**
- [Chrome Extensions: Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome Extensions: Content Security Policy](https://developer.chrome.com/docs/extensions/develop/concepts/content-security-policy)
- [Chrome Extensions: Troubleshooting Chrome Web Store violations](https://developer.chrome.com/docs/webstore/troubleshooting)
- [Chrome Extensions: Chrome Web Store review process](https://developer.chrome.com/docs/webstore/review-process)
- [Chrome Extensions: Permissions list](https://developer.chrome.com/docs/extensions/reference/permissions-list)
- [Chrome Extensions: Remote Code Execution policy (Manifest V3)](https://developer.chrome.com/docs/webstore/program-policies)

**Content Scripts + CSS Isolation + Fonts:**
- [How to add style and webfonts to a Chrome Extension content script (CSS)](https://medium.com/@charlesdouglasosborn/how-to-add-style-and-webfonts-to-a-chrome-extension-content-script-css-47d354025980)
- [Using @font-face in a Content Script for a Chrome Extension: A Guide](https://copyprogramming.com/howto/how-to-use-font-face-on-a-chrome-extension-in-a-content-script)
- [Using the Shadow DOM for CSS Isolation](https://www.chrisfarber.net/posts/2023/css-isolation)
- [CSS Shadow DOM Pitfalls: Styling Web Components Correctly](https://blog.pixelfreestudio.com/css-shadow-dom-pitfalls-styling-web-components-correctly)
- [Encapsulating Style and Structure with Shadow DOM](https://css-tricks.com/encapsulating-style-and-structure-with-shadow-dom)

**Render Platform + Backend Deployment:**
- [Render Docs: WebSockets](https://render.com/docs/websocket)
- [Building real-time applications with WebSockets](https://render.com/articles/building-real-time-applications-with-websockets)
- [Understanding Latency in Free Backend Hosting on Render.com](https://medium.com/@python-javascript-php-html-css/understanding-latency-in-free-backend-hosting-on-render-com-d1ce9c2571de)
- [Keep Your Render Free Apps Alive 24/7](https://medium.com/@prajju.18gryphon/keep-your-render-free-apps-alive-24-7-41aa85d71256)
- [Keeping Your Node.js Server Awake on Render's Free Tier](https://medium.com/@itsandreas/keeping-your-node-js-server-awake-on-renders-free-tie-5c7effa23330)

**Express + Node.js + Keep-Alive / SSE:**
- [Check your server.keepAliveTimeout](https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout)
- [Tuning HTTP Keep-Alive in Node.js](https://connectreport.com/blog/tuning-http-keep-alive-in-node-js)
- [Http connections aborted after 5s / keepAliveTimeout](https://github.com/nodejs/node/issues/13391)
- [Server-Sent Events (SSE) — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

**Chrome Web Store Policies:**
- [Chrome Web Store Rejection Codes. Introduction](https://medium.com/@bajajdilip48/chrome-web-store-rejection-codes-b71f817ceaea)
- [Top 5 Reasons Your Extension Could Get Rejected by Google](https://dev.to/spooja151/top-5-reasons-your-extension-could-get-rejected-by-google-1nf2)
- [Why Chrome Extensions Get Rejected (15 Reasons + How to Fix Each One)](https://www.extensionradar.com/blog/chrome-extension-rejected)
- [Chrome Web Store Rejection Codes: Meaning & Fixes](https://www.coditude.com/insights/chrome-web-store-rejection-codes/)

---

*Pitfalls research for: Twelveify v1.2 — Chrome extension UI redesign + Render production backend + Chrome Web Store submission*
*Researched: 2026-02-25*
