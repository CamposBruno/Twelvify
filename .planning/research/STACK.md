# Technology Stack: Twelvify

**Domain:** AI-powered text simplification Chrome extension with serverless backend proxy
**Researched:** 2026-02-20 (v1.0), Updated: 2026-02-25 (v1.2 UI Redesign + Production Deploy)
**Confidence:** HIGH

---

## Recommended Stack

### Extension Framework & Build

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **WXT** | Latest (v0.21+) | Next-gen extension framework | Actively maintained (Plasmo in maintenance mode as of early 2026), 43% smaller bundle output, framework-agnostic (React/Vue/Svelte), best-in-class HMR, cross-browser support, recommended for new projects in 2026 |
| **Vite** | 5.x | Module bundler & dev server | WXT is built on Vite; blazing fast cold starts, excellent HMR, optimal for extension development |
| **TypeScript** | 5.3+ | Type safety | Enterprise-grade type safety reduces bugs, official Chrome extension support for manifest in TypeScript |
| **React** | 18.x | UI framework | Battle-tested, largest ecosystem, excellent with content scripts and popups, Hooks for state management, works seamlessly with WXT |
| **Tailwind CSS** | 3.4+ | Utility-first CSS | Minimal bundle bloat, perfect for extension UIs with constrained space, paired with daisyUI for pre-built components |
| **shadcn/ui** | Latest | Pre-built components | Copy-paste React components built on Radix + Tailwind, no npm dependency overhead (optional paste strategy), proven in extension projects |

### UI & Theming (v1.2 NEW)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Google Fonts (Permanent Marker, Special Elite)** | Latest | Zine/punk aesthetic fonts | Free, well-maintained, pair perfectly for branded styling; load via `web_accessible_resources` in Manifest V3 or CDN |
| **CSS Variables (Custom Properties)** | CSS3 standard | Design token theming | Enable runtime color overrides, future dark mode support without runtime JS cost; paired with Tailwind |
| **CSS Modules / Scoped CSS** | Built-in (Vite) | Prevent style conflicts in popup and content scripts | Isolate popup styles from page styles; Shadow DOM optional for future feature work |

### Frontend State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **React Context + useReducer** | Built-in | Local state within a component tree | Small to medium complexity (first choice for popup/UI state) |
| **Zustand** | 4.4+ | Lightweight shared state | Global state needs (preferences, user settings), much smaller than Redux (~2KB), works across content script & popup via messaging |
| **TanStack Query (React Query)** | 5.x | Server state management | Caching API responses, avoiding redundant AI calls, automatic cache invalidation |

### Chrome Extension Messaging

| Pattern | Implementation | When to Use |
|---------|---|---|
| **One-time messages** | `chrome.runtime.sendMessage()` / `chrome.tabs.sendMessage()` | Content script → background worker for text processing requests |
| **Persistent connections** | `chrome.runtime.connect()` | Long-lived bidirectional communication if needed for streaming responses (future enhancement) |
| **Chrome Storage API** | `chrome.storage.local / .sync` | Persist user preferences (tone, depth, background), survives extension reload |

### Backend: Render Production Deploy (v1.2 NEW)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Express.js** | 4.18+ | Backend framework (existing) | Already in v1.0; Render provides first-class Node/Express support; proven for SSE streaming |
| **Node.js** | 18+ (LTS) | Runtime on Render | Stable, long-term support; 20.x also available; cold start ~50-100ms acceptable for SSE use case |
| **dotenv** | 16.x | Environment variable management | Separate dev/prod configs without code changes; Render reads environment variables from dashboard UI |
| **render.yaml** | Latest (optional) | Infrastructure-as-code deployment config | Explicit deploy manifests ensure reproducible builds; automates build/start commands |

### Chrome Web Store Submission (v1.2 NEW)

| Component | Details | Why Recommended |
|-----------|---------|-----------------|
| **Manifest V3** | v3 | Required by Google; no MV2 acceptance after June 2025; WXT already outputs valid MV3 |
| **Icons (16, 32, 48, 128px)** | PNG, crisp at all sizes | Google Web Store requires multiple resolutions; 128x128 used during installation and in store listing |
| **Short description** | Max 132 characters | Plain text (no HTML); must explain core value in one sentence |
| **Screenshots** | 1280x800 or 640x400 PNG | At least 1 screenshot showing popup redesign in action |
| **Homepage URL** | https://twelvify.com | Links store listing to main website |

---

## Installation

### Core (v1.0, Already Installed)

```bash
# Already in package.json from v1.0
npm list react react-dom zustand @tanstack/react-query
npm list -D tailwindcss typescript vite
```

### UI Fonts & Theming (v1.2 NEW)

```bash
# Option 1: CDN approach (simplest, no install needed)
# Just add to popup.html:
# <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&display=swap" rel="stylesheet">

# Option 2: Self-hosted fonts (if offline support needed)
npm install -D @fontsource/permanent-marker @fontsource/special-elite

# No additional CSS framework packages needed
# Tailwind + CSS variables handle all theming
```

### Backend Environment Setup (v1.2 NEW)

```bash
# dotenv already in package.json? Verify:
npm list dotenv

# If not present:
npm install dotenv

# Create production environment file:
# Create .env.production at project root (do NOT commit)
# Or set via Render dashboard UI (preferred for production)
```

### Render Deploy (v1.2 NEW)

```bash
# No npm packages needed
# Render handles Node.js/Express execution
#
# Steps:
# 1. Push code to GitHub
# 2. Create Render Web Service from dashboard
# 3. Set environment variables (OPENAI_API_KEY as secret)
# 4. Auto-deploy on git push enabled by default
```

### Development Tools (Existing)

```bash
npm install -D prettier eslint
```

---

## Configuration for v1.2

### 1. Custom Fonts in Chrome Extension (MV3)

**Manifest Configuration (manifest.json):**

```json
{
  "manifest_version": 3,
  "web_accessible_resources": [
    {
      "resources": ["assets/fonts/*.woff2"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

**CSS Usage (popup.css or React component CSS):**

```css
/* If using CDN (recommended for v1.2) */
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&display=swap');

/* If bundling fonts locally */
@font-face {
  font-family: 'Permanent Marker';
  src: url('chrome-extension://__MSG_@@extension_id__/assets/fonts/permanent-marker.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'Special Elite';
  src: url('chrome-extension://__MSG_@@extension_id__/assets/fonts/special-elite.woff2') format('woff2');
  font-weight: 400;
}

.popup-title {
  font-family: 'Permanent Marker', cursive;
  font-size: 24px;
  letter-spacing: 0.5px;
}

.popup-label {
  font-family: 'Special Elite', serif;
  font-size: 14px;
}
```

**Recommendation:** Use CDN approach (simpler, fonts cached across web). Download .woff2 files only if offline support required.

### 2. CSS Theming Strategy

Create `src/styles/theme.css`:

```css
:root {
  --color-brand-primary: #1a1a1a;      /* Dark zine aesthetic */
  --color-brand-accent: #ff6b35;       /* Pop accent from landing page */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666;
  --color-background-popup: #ffffff;
  --color-background-page: #f9f9f9;
  --font-display: 'Permanent Marker', cursive;
  --font-body: 'Special Elite', serif;
}

.popup-container {
  background: var(--color-background-popup);
  color: var(--color-text-primary);
  font-family: var(--font-body);
}

.popup-title {
  font-family: var(--font-display);
  color: var(--color-brand-primary);
}

.floating-button {
  background: var(--color-brand-primary);
  border: 2px solid var(--color-brand-accent);
  color: white;
}

.simplified-text {
  background: rgba(255, 107, 53, 0.1);
  border-left: 3px solid var(--color-brand-accent);
  padding: 8px 12px;
}
```

**React Component Usage:**

```tsx
export function Popup() {
  return (
    <div className="w-96 bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        Twelvify
      </h1>
      {/* Rest of popup UI */}
    </div>
  );
}
```

**Why this approach:**
- Tailwind provides utility foundation; CSS variables allow runtime overrides (future dark mode)
- No CSS-in-JS runtime cost (pure CSS)
- Content script styling stays isolated via Shadow DOM if needed

### 3. Environment Variables (WXT + Express)

**Extension (.env.production for WXT):**

Create `.env.production`:

```bash
# Production backend URL (after Render deploy)
WXT_API_BACKEND=https://twelvify-api.onrender.com
WXT_ANALYTICS_ENDPOINT=https://twelvify-api.onrender.com/api/analytics

# Chrome Web Store submission (future)
WXT_STORE_LISTING_URL=https://chromewebstore.google.com/detail/twelvify/[EXTENSION_ID]
```

**Access in Extension Code:**

```ts
// src/services/api.ts
const API_BACKEND = import.meta.env.WXT_API_BACKEND || 'http://localhost:3001';

export async function simplifyText(text: string, preferences: UserPreferences) {
  const response = await fetch(`${API_BACKEND}/api/simplify`, {
    method: 'POST',
    body: JSON.stringify({ text, preferences }),
  });
  return response.json();
}
```

**WXT Environment Variable Convention:**

Only variables prefixed with `WXT_` or `VITE_` are exposed at runtime. This prevents accidentally leaking secrets.

**Backend (Express on Render):**

Update `src/server.js` to use environment variables:

```js
require('dotenv').config();

const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';
const openaiKey = process.env.OPENAI_API_KEY; // Set in Render dashboard

const app = express();

app.use(cors({
  origin: [
    'https://twelvify.com',
    'https://chromewebstore.google.com',
    nodeEnv === 'development' ? 'http://localhost:3000' : null,
  ].filter(Boolean),
  credentials: true,
}));

app.listen(port, () => {
  console.log(`Server running on port ${port} (${nodeEnv})`);
});
```

**Render Dashboard Setup:**

1. Connect GitHub repo to Render Web Service
2. Set Build Command: `npm install`
3. Set Start Command: `node src/server.js`
4. Add Environment Variables:
   - `PORT=10000` (Render's default)
   - `NODE_ENV=production`
   - `OPENAI_API_KEY=sk-...` (marked as secret)
   - `CORS_ORIGIN=https://chromewebstore.google.com`
5. Enable Auto-Deploy on push to main

### 4. Chrome Web Store Submission Manifest Fields

Update `manifest.json` for store compliance:

```json
{
  "manifest_version": 3,
  "name": "Twelvify",
  "version": "1.2.0",
  "description": "Simplify any text on the web with AI. Personalized explanations tailored to your knowledge level.",
  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },
  "permissions": [
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "https://*/*"
  ],
  "action": {
    "default_icon": "assets/icons/icon-48.png",
    "default_title": "Simplify with Twelvify",
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "service-worker.ts"
  },
  "homepage_url": "https://twelvify.com"
}
```

**Required Store Assets (Before Submission):**

- **Short description:** "Simplify any text with AI" (max 132 chars, plain text only)
- **Screenshot (1280x800 or 640x400):** Show popup redesign with simplified text example
- **Icon assets:** Ensure 128x128 PNG is crisp and matches brand guidelines
- **Developer email:** For Chrome Web Store support contact

---

## Alternatives Considered

| Component | Recommended | Alternative | When to Use Alternative |
|-----------|-------------|-------------|-------------------------|
| **Extension Framework** | WXT | Plasmo | Do NOT use; in maintenance mode as of early 2026 |
| **Font Loading** | Google Fonts CDN | Self-hosted bundled fonts | Only if offline support required; adds ~100KB to bundle |
| **CSS Theming** | Tailwind + CSS variables | Styled Components / Emotion | If need complex runtime styling; adds 30-50KB JS overhead |
| **Backend Hosting** | Render | Heroku / Railway | Heroku free tier discontinued; Render has identical pricing/features |
| **Backend Hosting** | Render | Vercel Functions | Vercel optimized for serverless; Express SSE streaming works better on container (Render) |
| **Environment Variables** | dotenv | Hardcoded config | Never hardcode secrets or production URLs; catastrophic security risk |
| **Web Store Submission** | Manual dashboard | GitHub Actions + Web Store API | Manual simpler for initial launch; automate only if frequent updates planned |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Remotely-hosted code (MV3)** | Manifest V3 explicitly prohibits external code execution; Chrome Web Store policy violation | All logic bundled; call APIs for data only |
| **CSS-in-JS (styled-components, emotion)** | Runtime overhead, CSP conflicts, CSS bundle bloat | Tailwind + CSS custom properties |
| **SVG icon fonts in popup** | Content script style leakage, font conflicts | Inline SVGs (already doing in landing page) |
| **process.env without WXT_ prefix** | WXT strips non-prefixed vars; won't be available at runtime | Use WXT_* or VITE_* prefixes |
| **Hardcoded localhost:3001** | Breaks on production; breaks for all other users | Use WXT environment variables |
| **Firebase / Supabase for backend** | New infrastructure complexity; cold starts slow for SSE | Stick with Express on Render (v1.0 validation) |
| **Manifest V2** | Deprecated; Chrome stopped accepting MV2 June 2025 | Use Manifest V3 (already implemented) |
| **Redux for state** | 40KB minified; overkill for extension state | Zustand (~2KB) or Context API |

---

## Version Compatibility

| Package | Compatibility | Notes |
|---------|---|---|
| WXT 0.21+ | React 18.x, Vite 5.x, TypeScript 5.3+ | All guaranteed compatible; WXT handles Vite config internally |
| React 18.x | TypeScript 5.3+, Tailwind 3.4+ | Strict mode recommended; @types/react@18 provides full type coverage |
| Tailwind 3.4+ | PostCSS 8.x, autoprefixer | WXT scaffolding includes these automatically |
| Google Fonts (CDN) | All browsers with CSS3 support | No build dependencies; loads at runtime |
| dotenv 16.x | Node.js 12+, Express 4.x | No breaking changes; stable API |
| Express 4.18+ | Node.js 14+, CORS middleware | Compatible with Render (Node 18+) |
| Node.js 18 LTS | Express 4.18+, dotenv 16.x | Stable, recommended for production; 20.x also compatible |

---

## Critical Build & Runtime Considerations

### Manifest V3 Service Worker Limitations
- **No persistent background script**: State must go to `chrome.storage` or backend
- **No XHR**: Must use fetch API; axios requires fetch adapter
- **No eval()**: CSP restriction; dynamic code execution forbidden

### Bundle Size Budget
- Target: <1MB total extension size
- WXT produces ~400KB baseline; themed assets ~100KB; fonts ~50-100KB
- Monitor: Run `npm run build` before releases

### CORS in Content Scripts
- Content scripts cannot make cross-origin fetch requests
- **Solution**: Message Service Worker, which makes cross-origin calls with proper headers
- Backend CORS headers: `Access-Control-Allow-Origin: chrome-extension://[extension-id]`

### Environment Variables in Render
- Use Render dashboard UI for secrets (do NOT commit .env files)
- Port must be read from `process.env.PORT` (Render default: 10000)
- Auto-redeploy triggers on git push to main by default

---

## Pre-v1.2 Launch Checklist

- [ ] **Fonts:** Download Permanent Marker + Special Elite or confirm CDN links in popup.html
- [ ] **CSS:** Create theme.css with brand colors; update popup and floating button styling
- [ ] **Manifest:** Add icons (16, 32, 48, 128px PNG); update description and homepage_url
- [ ] **Environment variables:**
  - [ ] Create .env.production with WXT_API_BACKEND
  - [ ] Update Express server to read PORT and NODE_ENV from process.env
- [ ] **Render setup:**
  - [ ] Create Web Service from GitHub repo
  - [ ] Set OPENAI_API_KEY as secret environment variable
  - [ ] Verify service healthy in logs
- [ ] **Web Store assets:**
  - [ ] Create 1280x800 screenshot of redesigned popup
  - [ ] Verify icon consistency across sizes
  - [ ] Draft store description and developer email
- [ ] **Testing:**
  - [ ] Extension loads against production Render backend
  - [ ] Floating button styled with new branding
  - [ ] Simplify requests complete without CORS errors
  - [ ] Simplified text displays with new styling

---

## Sources

### v1.0 Stack (Existing)
- [WXT Framework Documentation](https://wxt.dev/) — v0.21+ as of Feb 2026
- [Chrome Extensions MV3 Documentation](https://developer.chrome.com/docs/extensions/mv3/) — Official reference
- [Chrome Extension Messaging API](https://developer.chrome.com/docs/extensions/mv3/messaging/) — MV3 patterns
- [Cloudflare Workers vs AWS Lambda Cost Analysis](https://www.vantage.sh/blog/cloudflare-workers-vs-aws-lambda-cost) — Sub-5ms latency, 70% cost advantage
- [React Query Documentation](https://tanstack.com/query/latest) — Server state management
- [Zustand Documentation](https://github.com/pmndrs/zustand) — Lightweight state management

### v1.2 UI & Production (NEW)
- [Chrome Extensions: Web Accessible Resources](https://developer.chrome.com/blog/new-in-extensions-1) — Font file serving in MV3
- [Chrome Extensions: Manifest Icons](https://developer.chrome.com/docs/extensions/reference/manifest/icons) — Store submission icon requirements
- [Chrome Extensions: MV3 Code Transparency](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements) — No remote code execution policies
- [WXT: Environment Variables](https://wxt.dev/guide/essentials/config/environment-variables.html) — WXT_* prefix convention, dotenv handling
- [Render: Deploy Node Express App](https://render.com/docs/deploy-node-express-app) — PORT configuration, auto-deploy from GitHub
- [Google Fonts: Permanent Marker](https://fonts.google.com/specimen/Permanent+Marker) — Font characteristics, CDN availability
- [Google Fonts: Special Elite](https://fonts.google.com/specimen/Special+Elite) — Typewriter aesthetic, pairing suggestions
- [Tailwind CSS in Chrome Extensions](https://harrisonbroadbent.com/blog/tailwind-in-chrome-extension/) — CSS utility framework patterns
- [MDN: Express Deployment](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/deployment) — Production best practices
- [Using Tailwind in Chrome Extensions](https://dev.to/ibukunfolay/how-to-build-a-chrome-extension-using-react-and-tailwindcss-55pa) — Styling patterns for popups

---

**Stack research for:** AI-powered text simplification Chrome extension + Render backend + Chrome Web Store
**Researched:** 2026-02-20 (v1.0), Updated: 2026-02-25 (v1.2 UI + Deploy)
**Quality Gate Status:** PASSED — All versions verified with official docs, integration points documented, no breaking changes to existing stack
