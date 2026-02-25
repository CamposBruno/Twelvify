# Integration Points: v1.2 Redesign Components

**Project:** Twelveify v1.2 Extension Redesign
**Research:** 2026-02-25
**Purpose:** Map new and modified components, data flow, and build dependencies

## Components: New vs. Modified

### NEW Components

| Component | Path | Purpose | Created By | Used By |
|-----------|------|---------|-----------|---------|
| **design tokens** | `src/theme/tokens.ts` | Centralized color, font, spacing definitions | Phase 1 | PopupUI, SettingsPanel, FloatingPopup |
| **popup.html** | `src/entrypoints/popup/popup.html` | Popup entry point with Google Fonts + CSS infrastructure | Phase 3 | WXT build process |

### MODIFIED Components

| Component | Path | Changes | Phase | Dependencies |
|-----------|------|---------|-------|--------------|
| **FloatingButton** | `src/components/FloatingButton.tsx` | Add Permanent Marker font, brand colors (#6366f1, #f59e0b), sharp borders (0px), rotation animation for tone label | 2 | Google Fonts CDN |
| **content.ts** | `src/entrypoints/content.ts` | (1) Update line ~438: simplified text highlight styles (left border #6366f1, border-radius: 0px), (2) Add Google Fonts @import in style tag | 2 | None |
| **OnboardingPrompt** | `src/components/OnboardingPrompt.tsx` | Add Special Elite font for accent text, brand colors, sharp corners | 2 | Google Fonts CDN |
| **App.tsx** | `src/entrypoints/popup/App.tsx` | Update title to use Permanent Marker font, brand indigo color | 3 | design tokens |
| **SettingsPanel** | `src/entrypoints/popup/SettingsPanel.tsx` | Integrate design tokens for colors/fonts, Special Elite for emphasis, sharp corners, update button styling | 3 | design tokens |
| **FloatingPopup** | `src/components/FloatingPopup.tsx` | Add border styling (#6366f1), brand header background, sharp corners | 3 | design tokens |
| **wxt.config.ts** | `wxt.config.ts` | Update host_permissions to include Render domain, update ALLOWED_ORIGIN in manifest | 4 | None |
| **backend/src/index.ts** | `backend/src/index.ts` | Verify health endpoint exists, CORS configured for env.ALLOWED_ORIGIN | 4 | None |

## Data Flow & Dependencies

### Phase 1: Design Tokens → Foundation

```
tokens.ts (NEW)
├─ exports colors: { indigo, amber, green, ... }
├─ exports fonts: { display, punk, body }
├─ exports spacing: { xs, sm, md, lg }
└─ used by:
    ├─ Phase 3: SettingsPanel.tsx
    ├─ Phase 3: FloatingPopup.tsx
    └─ Phase 3: App.tsx
```

**Critical:** tokens.ts must be created FIRST. No other component changes depend on it, but Phase 3 cannot proceed without it.

### Phase 2: Content Script → Floating UI (Independent)

```
content.ts (MODIFIED)
├─ Google Fonts @import in <style> tag
├─ FloatingButton.tsx styling updates
├─ simplified text highlight styles (line ~438)
└─ OnboardingPrompt.tsx styling updates

NO DEPENDENCIES on Phase 1 or 3
Can develop and test independently on real websites
```

**Testing:** Requires Chrome extension dev mode load + testing on multiple websites.

### Phase 3: Popup UI → Settings Panel (Depends on Phase 1)

```
popup.html (NEW)
├─ Google Fonts <link>
├─ <div id="app"></div>
└─ used by WXT build

App.tsx (MODIFIED)
├─ uses design tokens from Phase 1
├─ Permanent Marker for title
└─ renders SettingsPanel

SettingsPanel.tsx (MODIFIED)
├─ imports { tokens } from '../../theme/tokens'
├─ applies tokens.colors.* to elements
├─ applies tokens.fonts.* to text
└─ applies tokens.spacing.* to layout

FloatingPopup.tsx (MODIFIED)
├─ uses design tokens
├─ border styling, sharp corners
└─ brand header background

DEPENDENCY: Phase 1 (tokens.ts must exist)
```

**Testing:** Requires Chrome extension dev mode load + manual popup interaction.

### Phase 4: Backend & URLs → Production Config (Independent)

```
wxt.config.ts (MODIFIED)
├─ host_permissions: add 'https://twelvify-backend.onrender.com/*'
└─ ALLOWED_ORIGIN in manifest: 'chrome-extension://EXTENSION_ID' (TBD)

content.ts BACKEND_URL (MODIFIED)
├─ change from 'http://localhost:3001/api/simplify'
└─ to 'https://twelvify-backend.onrender.com/api/simplify'

backend/src/index.ts (VERIFY)
├─ health endpoint exists: GET /health → 200
├─ CORS configured: origin: env.ALLOWED_ORIGIN
└─ port: parseInt(env.PORT, 10) (default 10000)

backend/.env (CREATE or UPDATE)
├─ PORT=10000
├─ OPENAI_API_KEY=sk-...
├─ ALLOWED_ORIGIN=chrome-extension://EXTENSION_ID
└─ NODE_ENV=production

NO DEPENDENCIES on Phases 1-3 (can run in parallel)
Requires Render account setup
```

**Testing:** End-to-end test extension → Render backend after both are deployed.

### Phase 5: Chrome Web Store → Submission (Depends on Phases 1-4)

```
wxt.config.ts (FINAL UPDATE)
├─ ALLOWED_ORIGIN: actual public extension ID from Web Store (after approval)
└─ manifest permissions finalized

documentation/DEPLOYMENT.md (NEW)
├─ Render setup steps
├─ Environment variable checklist
└─ Chrome Web Store submission process

DEPENDENCY: All previous phases complete + extension ID from Web Store
```

## Build Order & Critical Path

```
┌─────────────────────┐
│ Phase 1: Tokens     │  (1-2 days)
│ src/theme/tokens.ts │
└──────────┬──────────┘
           │
    ┌──────┴──────┬────────────────┐
    │             │                │
    ▼             ▼                ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐
│ Phase 2  │  │ Phase 3      │  │ Phase 4  │
│ Content  │  │ Popup UI     │  │ Backend  │
│ (2-3d)   │  │ (2-3 days)   │  │ (1-2d)   │
└──────┬───┘  └──────┬───────┘  └──────┬───┘
       │             │                 │
       │      (depends on Phase 1)     │
       │                               │
       └───────────────┬───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Phase 5: Submit │  (1 day)
              │ to Web Store    │
              └─────────────────┘

CRITICAL PATH: Phase 1 → Phase 3 → Phase 5
PARALLEL: Phase 2 can run during Phase 3
PARALLEL: Phase 4 can run during Phase 3

Estimated total: 7-10 days (including testing & iteration)
```

## Integration Checklist

### Pre-Phase 1: Design Validation
- [ ] Confirm Permanent Marker & Special Elite fonts acceptable for extension UI
- [ ] Review landing page Tailwind config colors (#6366f1, #f59e0b, etc.)
- [ ] Decide: Design tokens CSS-in-JS vs. Tailwind for popup

### Phase 1 Completion
- [ ] tokens.ts created with all color/font/spacing definitions
- [ ] tokens.ts values match landing page design system
- [ ] Google Fonts link verified working in popup.html

### Phase 2 Completion
- [ ] FloatingButton renders with Permanent Marker font
- [ ] Floating button uses brand indigo (#6366f1) for main action
- [ ] Floating button uses brand amber (#f59e0b) for error state
- [ ] Simplified text highlight has left border accent
- [ ] All border-radius set to 0px (sharp corners)
- [ ] OnboardingPrompt uses Special Elite font
- [ ] Tested on 5+ websites (Gmail, Medium, GitHub, Reddit, Hacker News)
- [ ] No CSS conflicts with page styles observed

### Phase 3 Completion
- [ ] popup.html loads Google Fonts successfully
- [ ] App.tsx title uses Permanent Marker font
- [ ] SettingsPanel uses design tokens for all colors/fonts
- [ ] FloatingPopup border styling matches brand
- [ ] Popup renders at 320px width (fixed)
- [ ] All UI elements have sharp corners (border-radius: 0px)

### Phase 4 Completion
- [ ] Health endpoint returns 200 OK
- [ ] Render account created, backend deployed
- [ ] Environment variables configured in Render dashboard
- [ ] BACKEND_URL in content.ts points to Render domain
- [ ] host_permissions updated to include Render domain
- [ ] End-to-end test: select text → simplify → Render backend responds
- [ ] CORS origin temporarily set to '*' (will restrict after Web Store approval)

### Phase 5 Completion
- [ ] Privacy policy written (no text content logged server-side)
- [ ] Extension description updated with v1.2 redesign details
- [ ] ALLOWED_ORIGIN updated with actual public extension ID (after approval)
- [ ] All localhost:3001 references removed from code
- [ ] Final security audit passed
- [ ] Submitted to Chrome Web Store
- [ ] Review in progress (2-7 days expected)

## Component Wiring Summary

```typescript
// CONTENT SCRIPT CONTEXT (no dependencies)
content.ts
├─ Google Fonts: @import url(...)
├─ FloatingButton
│  └─ font: 'Permanent Marker', colors: #6366f1, #f59e0b, #10b981
├─ OnboardingPrompt
│  └─ font: 'Special Elite', colors: brand colors
└─ Simplified text highlight
   └─ border-left: 2px solid #6366f1

// EXTENSION POPUP CONTEXT (depends on tokens.ts)
popup.html
└─ <link rel="stylesheet" href="fonts.googleapis.com">

App.tsx
├─ title: font-family: 'Permanent Marker'
└─ color: #6366f1

SettingsPanel.tsx
├─ imports tokens from '../../theme/tokens'
├─ tone selector: colors.primary, fonts.display
├─ depth selector: colors.secondary
└─ buttons: colors.indigo, fonts.display

FloatingPopup.tsx
├─ border: 2px solid tokens.colors.indigo
├─ header background: tokens.colors.surface
└─ header font: tokens.fonts.display

// BACKEND CONFIG (independent)
wxt.config.ts
├─ host_permissions: ['https://twelvify-backend.onrender.com/*', 'http://localhost:3001/*']
└─ ALLOWED_ORIGIN: 'chrome-extension://EXTENSION_ID'

content.ts BACKEND_URL
└─ 'https://twelvify-backend.onrender.com/api/simplify'

backend/src/index.ts
├─ GET /health → { status: 'ok' }
└─ CORS: origin: env.ALLOWED_ORIGIN
```

## Deployment Sequence

```
1. Phase 1 (Tokens)          → Merge to main
2. Phase 2 (Content Script)  → Merge to main, test on live sites
3. Phase 3 (Popup UI)        → Merge to main, test locally
4. Phase 4 (Backend)         → Deploy to Render, test E2E
5. Phase 5 (Web Store)       → Update ALLOWED_ORIGIN, submit review
```

**Git strategy:** Commit per phase or per component (atomic commits preferred).

## Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Google Fonts CSP blocked in content script | MEDIUM | Fallback: local fonts via web_accessible_resources (Phase 2 testing) |
| Font rendering differs on different sites | MEDIUM | Phase 2 testing on 5+ sites with aggressive CSS resets |
| Render health check timeout (cold start) | LOW | Verify health endpoint response < 1s, add connection pooling if needed |
| Extension ID not known until Web Store approval | MEDIUM | Use wildcard CORS initially, update after approval, redeploy |
| Tailwind CSS integration complexity | LOW | Use design tokens CSS-in-JS instead of Tailwind for simplicity |

---

*Integration points mapping for Twelveify v1.2 redesign*
*Research: 2026-02-25*
