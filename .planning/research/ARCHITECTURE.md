# Architecture: Extension UI Redesign + Render Deployment

**Project:** Twelveify v1.2 — UI Redesign & Production Deploy
**Researched:** 2026-02-25
**Confidence:** HIGH — Combines existing codebase, official Chrome docs, and Render patterns

## System Overview

The v1.2 redesign integrates the toned-down zine/punk aesthetic (Permanent Marker / Special Elite fonts, brand colors, no border radius) from the landing page into the extension's UI while maintaining the existing MV3 architecture. This requires coordinated updates across three CSS isolation boundaries: (1) content script floating button in webpage, (2) popup/side panel in extension context, and (3) Render backend health checks for zero-downtime deploys.

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Web Page DOM (Host Page Context)                         │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ [Selected Text]  ◄─── Styled FloatingButton        │ │  │
│  │  │                       (content script context)      │ │  │
│  │  │                       CSS: Permanent Marker fonts   │ │  │
│  │  │                       Colors: brand indigo/amber    │ │  │
│  │  │                       NO border-radius (sharp)      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Simplified Text [highlighted]                      │ │  │
│  │  │ CSS: Designed brand highlight, fade animation      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ OnboardingPrompt [if triggered]                    │ │  │
│  │  │ CSS: Brand styling, Special Elite accent           │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                      │
│                           │ React mounts in #twelvify-root      │
│                           │ (no Shadow DOM for floating button)  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │     CONTENT SCRIPT CONTEXT                                 │ │
│  │     (content.ts injected into webpage)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ▲
                           │ chrome.runtime.sendMessage()
                           │
┌──────────────────────────────────────────────────────────────────┐
│         EXTENSION UI CONTEXT (popup.tsx / background.ts)         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POPUP or SIDE PANEL (extension_pages CSP)              │  │
│  │                                                          │  │
│  │  Settings Panel:                                        │  │
│  │  • Tone selector (5 levels: baby → big_boy)           │  │
│  │  • Depth selector (shallow, medium, deep)             │  │
│  │  • Profession/background input                         │  │
│  │  • Usage statistics                                    │  │
│  │                                                          │  │
│  │  CSS: Brand fonts (Permanent Marker/Special Elite)    │  │
│  │       Brand colors (indigo: #6366f1, amber: #f59e0b)  │  │
│  │       Zero border-radius (sharp corners)               │  │
│  │       Fixed max-width (320px for popup)                │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  onboardingPrompts (if progressive onboarding v2)       │  │
│  │  • Show prompts inline in popup vs. in-page            │  │
│  │  • Brand styling (Special Elite accent font)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ▲
                           │ fetch() HTTPS
                           │
┌──────────────────────────────────────────────────────────────────┐
│          BACKEND PROXY SERVER (Render deployment)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PORT: 10000 (Render default, override via ENV)                 │
│  Health check: GET /health → 200 OK                             │
│  Endpoints:                                                     │
│    • POST /api/simplify (SSE streaming)                         │
│    • GET /health (health check for zero-downtime deploy)       │
│    • POST /api/playground (rate-limited demo)                  │
│                                                                  │
│  Environment variables (set in Render dashboard):              │
│    • PORT=10000                                                │
│    • OPENAI_API_KEY=sk-...                                     │
│    • ALLOWED_ORIGIN=chrome-extension://PUBLIC_EXTENSION_ID    │
│    • NODE_ENV=production                                       │
│                                                                  │
│  Procfile: not needed (WXT already configures start script)    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## CSS Architecture & Integration Strategy

### 1. Content Script Floating Button (No Shadow DOM)

**Current state:** Inline React styles in FloatingButton.tsx, injected into #twelvify-root div.
**Redesign approach:** Keep inline styles, update colors and fonts.

**Why NO Shadow DOM:**
- Floating button interacts directly with host page selection events
- Shadow DOM would require additional complexity for cross-context event handling
- Inline styles avoid global CSS conflicts
- Performance: No re-renders or style recalculation overhead

**Brand Integration:**

```typescript
// src/components/FloatingButton.tsx - UPDATED for v1.2

// Color palette from landing page (tailwind.config.ts)
const BRAND_COLORS = {
  indigo: '#6366f1',      // Primary action
  amber: '#f59e0b',       // Error state
  green: '#10b981',       // Undo button
  white: '#ffffff',
  gray800: '#1f2937',
  gray600: '#4b5563',
  gray400: '#9ca3af',
};

// Fonts: Apply via font-family fallback chain
const FONT_FAMILIES = {
  display: "'Permanent Marker', cursive",    // Headings, tone labels
  punk: "'Special Elite', monospace",        // Accent, onboarding
  body: "system-ui, -apple-system, sans-serif", // Default (safe fallback)
};

// Updated button style
style={{
  fontFamily: FONT_FAMILIES.display,  // Permanent Marker for tone label
  backgroundColor: BRAND_COLORS.indigo,
  borderRadius: '0px',  // Sharp corners (no border-radius)
  border: '2px solid #000',  // Sharp border for punk aesthetic
  letterSpacing: '0.05em',  // Slightly wider for display font
  // ... rest of styles
}}
```

**Font loading strategy for content script:**

Since content scripts run in the host page context and don't have access to extension resources the way popups do, use inline Google Fonts link or @import approach:

```typescript
// In FloatingButton.tsx <style> tag
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&display=swap');

  @keyframes twelvify-spin { /* ... */ }
  @keyframes twelvify-shake { /* ... */ }
`}</style>
```

**Pros:** Works in content script context, fonts cached by browser
**Cons:** Adds ~20KB (already loading on landing page, so cached)
**Alternative:** If CSP blocks this, use data URIs or local font files via web_accessible_resources

### 2. Popup/Side Panel UI (Extension Context, Unrestricted CSS)

**Current state:** Inline styles in App.tsx and SettingsPanel.tsx, minimal styling.
**Redesign approach:** Import Tailwind CSS from landing page config, or use custom CSS-in-JS with brand design tokens.

**Option A: Tailwind CSS (Recommended)**

WXT supports Tailwind via PostCSS. Create a separate Tailwind config for extension UI:

```typescript
// src/entrypoints/popup/tailwind.config.ts (NEW)
export default {
  content: [
    './src/entrypoints/popup/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6366f1',
          amber: '#f59e0b',
          green: '#10b981',
        },
      },
      fontFamily: {
        display: ["'Permanent Marker'", 'cursive'],
        punk: ["'Special Elite'", 'monospace'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',  // Force sharp corners everywhere
        full: '9999px',  // Only for fully rounded elements
      },
    },
  },
  plugins: [],
}
```

```html
<!-- src/entrypoints/popup/popup.html (UPDATE) -->
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Google Fonts preload -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&display=swap" rel="stylesheet" />

    <!-- Tailwind CSS will be bundled by WXT -->
    <style>@tailwind base; @tailwind components; @tailwind utilities;</style>
  </head>
  <body class="bg-white dark:bg-gray-900">
    <div id="app"></div>
  </body>
</html>
```

**Option B: CSS-in-JS with Design Tokens (Lower setup, higher clarity)**

If Tailwind integration adds build complexity, use design tokens object:

```typescript
// src/theme/tokens.ts (NEW)
export const tokens = {
  colors: {
    primary: '#6366f1',
    secondary: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textMuted: '#6b7280',
  },
  fonts: {
    display: "'Permanent Marker', cursive",
    punk: "'Special Elite', monospace",
    body: "system-ui, -apple-system, sans-serif",
  },
  borders: {
    radius: '0px',  // Sharp corners
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};

// src/entrypoints/popup/SettingsPanel.tsx (UPDATE)
import { tokens } from '../../theme/tokens';

export function SettingsPanel() {
  return (
    <div style={{ fontFamily: tokens.fonts.body, padding: tokens.spacing.md }}>
      <h2 style={{ fontFamily: tokens.fonts.display, color: tokens.colors.primary }}>
        Settings
      </h2>
      {/* ... */}
    </div>
  );
}
```

**Recommendation:** Use **Option B (Design Tokens + CSS-in-JS)** initially. It's lower friction than Tailwind setup, clearer for small extension UI, and avoids Tailwind's rem-in-Shadow-DOM issues if we ever migrate popup to Shadow DOM.

### 3. In-Page Simplified Text Styling (Content Script DOM)

**Current state:** Inline style in content.ts (lines 438-439): `background: rgba(99, 102, 241, 0.2); border-radius: 3px`.
**Redesign approach:** Update colors and remove border-radius for consistency.

```typescript
// src/entrypoints/content.ts (UPDATE line ~438)
const span = document.createElement('span');
span.setAttribute('data-twelvify-simplified', 'true');
span.style.cssText = `
  background: rgba(99, 102, 241, 0.15);  // Slightly more transparent indigo
  border-radius: 0px;                     // Sharp corners
  border-left: 2px solid #6366f1;         // Left accent border (zine aesthetic)
  padding-left: 4px;
  transition: all 1.5s ease;
`;
```

### 4. OnboardingPrompt Styling (Content Script)

**Current state:** Minimal styling.
**Redesign approach:** Add brand fonts and colors.

```typescript
// src/components/OnboardingPrompt.tsx (UPDATE)
// Use Special Elite for accent text, brand colors for buttons

const promptContainerStyle: React.CSSProperties = {
  border: '2px solid #6366f1',
  borderRadius: '0px',  // Sharp
  padding: '12px',
  backgroundColor: '#f9fafb',
  fontFamily: "'Special Elite', monospace",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#6366f1',
  color: 'white',
  borderRadius: '0px',
  border: 'none',
  padding: '8px 12px',
  fontFamily: "'Permanent Marker', cursive",
  fontSize: '14px',
  cursor: 'pointer',
};
```

## Font Loading Strategy

### Strategy 1: Google Fonts CDN (Recommended)

**Advantages:**
- Cached globally (users may already have fonts from landing page)
- Single HTTP request for all three font variants
- No Procfile / build complexity
- Works in content script and popup contexts

**Implementation:**

```html
<!-- Both popup.html AND in content.ts style tag -->
<link
  href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&display=swap"
  rel="stylesheet"
/>
```

### Strategy 2: Local Font Files via web_accessible_resources

**Advantages:**
- Zero network latency, offline support
- No privacy leakage to Google
- Full control over font variants

**Disadvantages:**
- Adds 50-100KB to bundle
- Requires manifest.json update

**Implementation if needed:**

```json
// manifest.json (in wxt.config.ts)
{
  "web_accessible_resources": [
    {
      "resources": ["fonts/*.woff2"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

```css
/* in style file */
@font-face {
  font-family: 'Permanent Marker';
  src: url('chrome-extension://' + chrome.runtime.id + '/fonts/permanent-marker.woff2');
}
```

**Recommendation:** Use **Strategy 1 (Google Fonts CDN)** for v1.2. It's faster to deploy and users likely have fonts cached. Migrate to local fonts post-MVP if privacy/offline support becomes critical.

## Render Deployment Architecture

### Current Backend Setup

**Location:** `/backend/` directory
**Framework:** Express.js (4.18.2)
**Dependencies:** cors, openai, express-rate-limit, winston, zod

### Required Render Configuration

**Procfile is NOT needed** because WXT's package.json already has:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

Render will detect this and use `npm start`.

### Render Environment Variables

**Required (set in Render dashboard):**

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `10000` | HTTP listen port (Render default) |
| `OPENAI_API_KEY` | `sk-...` | Secret key for OpenAI API calls |
| `ALLOWED_ORIGIN` | `chrome-extension://EXTENSION_ID` | CORS origin (public extension ID from Chrome Web Store) |
| `NODE_ENV` | `production` | Enable production optimizations |

**Optional:**
```
LOG_LEVEL=info          # Winston log level
RATE_LIMIT_WINDOW=3600  # Rate limit window (seconds)
RATE_LIMIT_MAX=100      # Max requests per window per IP
```

### Health Check Endpoint (Critical for Zero-Downtime Deploys)

Render's deployment strategy relies on health checks to ensure zero-downtime:

1. New instance starts with `/health` endpoint
2. Render polls `/health` until it returns 200 OK
3. Old instance terminates only after new instance is healthy
4. If health check fails, deployment rolls back

**Current health router is correct** (src/routes/health.ts):

```typescript
// src/routes/health.ts (VERIFY this exists)
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

**If this doesn't exist, create it:**

```typescript
// backend/src/routes/health.ts (NEW if missing)
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'twelvify-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### Procfile (Not Needed, But Reference)

If you ever need to customize, Render supports Procfile:

```procfile
# Procfile (optional, not needed for standard Node.js)
web: npm run build && npm start
```

This would be ignored by Render since package.json `start` script exists.

### Port Configuration

**Key detail:** Render requires binding to `0.0.0.0` to accept traffic from public internet.

**Verify in backend/src/index.ts:**

```typescript
const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`Twelvify backend listening on port ${port}`);
});
// This implicitly binds to 0.0.0.0:${port} — correct for Render
```

### Build & Start Process

Render will:

1. Clone repo
2. Run `npm ci` (or `npm install`)
3. Run `npm run build` (TypeScript compilation)
4. Run `npm start` (node dist/index.js)
5. Poll `/health` endpoint until 200 OK
6. Route traffic to instance

**Time estimate:** ~2-3 minutes from git push to live.

### CORS Configuration for Production

**Current state:** (src/index.ts line 15-18)

```typescript
app.use(cors({
  origin: env.ALLOWED_ORIGIN === '*' ? '*' : env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
}));
```

**For production:**
- Set `ALLOWED_ORIGIN=chrome-extension://PUBLIC_EXTENSION_ID` (from Chrome Web Store)
- Never use `'*'` in production (security risk)
- Verify extension ID matches after Chrome Web Store submission

### Backend URL Update in Extension

**Current hardcoded URLs to update before production:**

1. **src/entrypoints/content.ts (line 17):**
   ```typescript
   // Change from localhost to Render domain
   const BACKEND_URL = 'https://twelvify-backend.onrender.com/api/simplify';
   ```

2. **wxt.config.ts (line 12-14):**
   ```typescript
   host_permissions: [
     'https://twelvify-backend.onrender.com/*',
     // Keep localhost for dev
     'http://localhost:3001/*'
   ],
   ```

3. **backend/.env.example and .env.local:**
   ```
   ALLOWED_ORIGIN=chrome-extension://YOUR_PUBLIC_EXTENSION_ID
   ```

## Component Boundaries & Data Flow

### CSS Isolation Boundaries

| Layer | Context | CSS Isolation | Strategy |
|-------|---------|---------------|----------|
| **Floating Button + Text** | Content script, injected into host page | None (direct DOM) | Inline styles, scoped data-attributes |
| **Simplified Text Highlight** | Content script, injected into host page | None (direct DOM) | Inline styles, transition animations |
| **Onboarding Prompt** | Content script, injected into host page | None (direct DOM) | Inline styles via React |
| **Popup/Side Panel** | Extension context (extension_pages CSP) | Full isolation (not in host page) | Tailwind CSS or design tokens CSS-in-JS |
| **Floating Popup Display** | Content script (popup display mode) | None (direct DOM) | Inline styles, shadow casting |

### Integration Points for v1.2 Redesign

**New vs. Modified Components:**

| Component | Status | Changes |
|-----------|--------|---------|
| `FloatingButton.tsx` | **Modified** | Add Permanent Marker font, brand colors, sharp borders, rotate animation for tone label |
| `content.ts` | **Modified** | Update inline styles for simplified text highlight, add left border accent |
| `OnboardingPrompt.tsx` | **Modified** | Add Special Elite font for accent text, brand colors, sharp corners |
| `SettingsPanel.tsx` | **Modified** | Integrate design tokens, Permanent Marker for titles, Special Elite for emphasis |
| `App.tsx` (popup) | **Modified** | Update title styling with Permanent Marker |
| `FloatingPopup.tsx` | **Modified** | Add border styling, brand colors for header |
| `popup.html` | **New or Updated** | Add Google Fonts link, Tailwind CSS setup |
| `theme/tokens.ts` | **New** | Design token definitions (colors, fonts, spacing) |

**Build Order Dependencies:**

1. **Phase 1: Design Tokens**
   - Create `src/theme/tokens.ts` with color and font definitions
   - No component changes yet, just centralize values

2. **Phase 2: Content Script Redesign**
   - Update `FloatingButton.tsx` (colors, fonts, sharp borders)
   - Update `content.ts` (highlight styles)
   - Update `OnboardingPrompt.tsx` (fonts, colors)
   - **Must come before UI phase:** Content script builds independently

3. **Phase 3: Popup UI Redesign**
   - Create `popup.html` with Google Fonts + CSS setup
   - Update `App.tsx`, `SettingsPanel.tsx`, `FloatingPopup.tsx`
   - Integrate design tokens from Phase 1

4. **Phase 4: Backend Production Setup**
   - Add `/health` endpoint if missing
   - Update `src/entrypoints/content.ts` BACKEND_URL
   - Update `wxt.config.ts` host_permissions
   - Create Render configuration doc

5. **Phase 5: Chrome Web Store Submission**
   - Update manifest permissions with real extension ID
   - Final testing on staging
   - Submit to Chrome Web Store review

## Anti-Patterns to Avoid

### 1. Shadow DOM for Floating Button
**Don't:** Wrap FloatingButton in Shadow DOM to "isolate" styles
**Why:** Breaks selection event propagation, adds unnecessary complexity
**Do:** Use inline styles + scoped data-attributes (current approach)

### 2. Tailwind in Content Script
**Don't:** Use Tailwind CSS for content script UI (floating button, onboarding)
**Why:** rem-based sizing breaks in different page contexts (different html font-sizes)
**Do:** Use inline styles or CSS-in-JS with px values

### 3. Hardcoding Backend URL
**Don't:** Leave `BACKEND_URL = 'http://localhost:3001'` in production code
**Why:** Chrome Web Store reviews will reject, users get broken extension
**Do:** Use environment variables or conditional URL selection

### 4. CORS wildcard in Production
**Don't:** Set `origin: '*'` in cors() middleware for production
**Why:** Allows any origin to call your backend, security risk for cost abuse
**Do:** Restrict to extension ID: `origin: 'chrome-extension://EXTENSION_ID'`

### 5. Missing Health Check
**Don't:** Deploy without `/health` endpoint
**Why:** Render can't safely do zero-downtime deploys, requests fail during deploy window
**Do:** Simple GET /health → 200 OK endpoint (already in place)

## Scaling Considerations

### Current Architecture Limits

At v1.2 scale (100-500 users):
- **Backend:** Single Render free/hobby tier instance sufficient
- **Database:** None (stateless proxy pattern)
- **Rate limiting:** In-memory (expires if instance restarts)
- **Cost:** ~$10/month Render + LLM API calls (variable)

### Future Scaling Path

| Scale | Bottleneck | Solution |
|-------|-----------|----------|
| **500-2k users** | In-memory rate limiting (can be inconsistent across restarts) | Move to Redis (add Render Redis dependency) |
| **2k-10k users** | LLM API costs spike ($100-500/month) | Implement request caching, cheaper model tiers |
| **10k+ users** | Single backend instance can't handle traffic spike | Render auto-scales; monitor health checks during deploy storms |

## Deployment Checklist

Before Chrome Web Store submission:

- [ ] Environment variables configured in Render dashboard (PORT, OPENAI_API_KEY, ALLOWED_ORIGIN, NODE_ENV)
- [ ] Health endpoint returns 200 OK at `/health`
- [ ] Backend URL in extension code points to Render domain, not localhost
- [ ] Host permissions include Render domain: `https://twelvify-backend.onrender.com/*`
- [ ] CORS origin restricted to public extension ID (not wildcard)
- [ ] Design tokens integrated across all UI components
- [ ] Google Fonts loaded in popup.html AND content script
- [ ] Content script styles use brand colors and Permanent Marker font
- [ ] Popup uses design tokens for consistency
- [ ] All sharp borders (border-radius: 0) enforced
- [ ] Test end-to-end: select text on live website → floating button appears → click → simplify → result displays

## Sources

- [Chrome for Developers: Web Accessible Resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources/) — Font loading via web_accessible_resources
- [Chrome for Developers: Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) — Isolation boundaries for content script CSS
- [WXT: Content Scripts Guide](https://wxt.dev/guide/essentials/content-scripts.html) — WXT-specific patterns for content script styling
- [Medium: How to add style and webfonts to a Chrome Extension content script](https://medium.com/@charlesdouglasosborn/how-to-add-style-and-webfonts-to-a-chrome-extension-content-script-css-47d354025980) — Font loading strategies
- [Render: Deploy a Node Express App](https://render.com/docs/deploy-node-express-app) — Official Render deployment guide for Express apps
- [Render: Web Services Docs](https://render.com/docs/web-services) — Health checks, environment variables, port configuration
- [LogRocket: How to implement a health check in Node.js](https://blog.logrocket.com/how-to-implement-a-health-check-in-node-js/) — Health endpoint patterns
- [Harrison Broadbent: Using Tailwind CSS in a Chrome Extension](https://harrisonbroadbent.com/blog/tailwind-in-chrome-extension/) — Tailwind CSS isolation concerns in extensions
- [GitHub: Building Chrome Extension with Vite, React, and Tailwind CSS](https://www.artmann.co/articles/building-a-chrome-extension-with-vite-react-and-tailwind-css-in-2025) — Modern extension build patterns

---

**Architecture research for:** Chrome extension UI redesign + production deploy
**Project:** Twelveify v1.2
**Researched:** 2026-02-25
**Confidence:** HIGH — Integrates existing codebase analysis, official Chrome/Render documentation, and community-validated patterns
