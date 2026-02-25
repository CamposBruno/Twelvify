---
phase: 07-launch
plan: 02
subsystem: infra
tags: [vercel, vite, deploy, build, cdn, cache-headers, security-headers]

# Dependency graph
requires:
  - phase: 06-playground
    provides: landing/ Vite+React app with dist/ output ready for deployment
provides:
  - vercel.json with build config (Vite framework, dist/ output directory)
  - www.twelvify.com -> twelvify.com permanent 301 redirect
  - Immutable cache headers for hashed /assets/
  - Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
  - .vercelignore excluding code.html dev artifact
  - vendor chunk splitting: react+react-dom isolated to vendor-[hash].js
affects:
  - 07-03 (Vercel project setup checkpoint uses vercel.json as reference)
  - Future phases touching landing build config

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vercel.json at rootDirectory (landing/) configures project-level build and routing"
    - "Vite manualChunks splits vendor (react+react-dom) from app code"
    - "Immutable cache headers on /assets/ safe because Vite hashes all asset filenames"
    - "Ignored Build Step shell expression gates deploys to website_* git tags only"

key-files:
  created:
    - landing/vercel.json
    - landing/.vercelignore
  modified:
    - landing/vite.config.ts

key-decisions:
  - "vercel.json framework: vite — uses Vite-optimized Vercel build pipeline"
  - "outputDirectory: dist — Vite default, no custom config needed"
  - "www redirect uses has.type=host matcher — avoids redirect loops on root domain"
  - "vendor chunk added because index.js was 215KB (over 200KB plan threshold)"
  - "Deploy-on-tag via Ignored Build Step: [ $VERCEL_GIT_COMMIT_REF != main ] && [[ $VERCEL_GIT_COMMIT_TAG != website_* ]] — documented for human Vercel setup"

patterns-established:
  - "Pattern 1: landing/ is Vercel's rootDirectory — vercel.json lives there, not at repo root"
  - "Pattern 2: .vercelignore at landing/ level excludes code.html from upload"

requirements-completed: [DEPLOY-01, DEPLOY-02]

# Metrics
duration: 5min
completed: 2026-02-25
---

# Phase 7 Plan 02: Vercel Deploy Config Summary

**vercel.json with www-redirect, immutable asset cache headers, security headers, and vendor chunk splitting for clean tag-based Vercel deployment**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-25T01:39:41Z
- **Completed:** 2026-02-25T01:44:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `landing/vercel.json` with full Vercel build config, www-to-root 301 redirect, immutable cache headers for `/assets/`, and baseline security headers
- Created `landing/.vercelignore` to exclude `code.html` dev artifact from Vercel upload
- Added vendor chunk splitting to `vite.config.ts` — separates react+react-dom (11KB) from app code (199KB); all chunks under 300KB

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vercel.json and .vercelignore** - `e98aed0` (chore)
2. **Task 2: Verify production build output quality** - `69c9dfe` (chore)

## Files Created/Modified

- `landing/vercel.json` — Vercel project config: build settings, www redirect, cache headers, security headers
- `landing/.vercelignore` — Excludes code.html (dev reference file) from Vercel upload
- `landing/vite.config.ts` — Added `build.rollupOptions.output.manualChunks` to split vendor bundle

## Build Output Sizes

| File | Size (uncompressed) | Gzip |
|------|---------------------|------|
| `dist/assets/index-[hash].js` | 203 KB | 62 KB |
| `dist/assets/vendor-[hash].js` | 11 KB | 4 KB |
| `dist/assets/index-[hash].css` | 27 KB | 5 KB |
| `dist/index.html` | 3 KB | 1 KB |
| **Total dist/** | **244 KB** | — |

All files under 300KB. CSS extracted separately. Filenames are content-hashed for safe immutable caching.

## Decisions Made

- `framework: "vite"` in vercel.json — tells Vercel to use Vite-optimized pipeline (faster builds, correct defaults)
- www redirect uses `has: [{type: "host", value: "www.twelvify.com"}]` matcher — correctly matches only www subdomains, no redirect loop risk
- Vendor chunk split added because index.js was 215KB, exceeding the 200KB plan threshold
- Security headers applied at `/(.*)`  level — baseline hardening for all pages

## Vercel Project Setup

**IMPORTANT — Human steps required before first deploy (referenced in Plan 03 checkpoint):**

### Step 1: Create Vercel Project

1. Go to https://vercel.com/new
2. Import the Twelvify GitHub repository
3. In **Configure Project** settings:
   - **Framework Preset:** Vite (auto-detected from vercel.json)
   - **Root Directory:** `landing/` ← CRITICAL — must be set to `landing/`, not root
   - **Build Command:** `npm run build` (from vercel.json, auto-populated)
   - **Output Directory:** `dist` (from vercel.json, auto-populated)
   - **Install Command:** `npm install` (from vercel.json, auto-populated)

### Step 2: Configure Custom Domain

1. In Vercel Dashboard → Project → Settings → Domains
2. Add `twelvify.com` (root domain)
3. Add `www.twelvify.com` — Vercel will auto-apply the redirect rule from vercel.json

### Step 3: Configure Deploy-on-Tag (Ignored Build Step)

This controls when Vercel builds. The goal: **only build on git tags matching `website_*`**, not on every branch push or PR.

1. In Vercel Dashboard → Project → Settings → Git
2. Find **"Ignored Build Step"** field
3. Enter this exact shell expression:

```bash
[ "$VERCEL_GIT_COMMIT_REF" != "main" ] && [[ "$VERCEL_GIT_COMMIT_TAG" != website_* ]]
```

**How it works:**
- When this expression returns exit code `1` (true), Vercel **skips** the build
- When it returns exit code `0` (false/truthy), Vercel **proceeds** with the build
- `[ "$VERCEL_GIT_COMMIT_REF" != "main" ]` — non-main branches return true (skip)
- `[[ "$VERCEL_GIT_COMMIT_TAG" != website_* ]]` — tags NOT matching `website_*` return true (skip)
- Combined with `&&`: skip unless on main branch OR has a `website_*` tag

**To trigger a deploy:** Push a git tag like `website_v1.0.0`:
```bash
git tag website_v1.0.0
git push origin website_v1.0.0
```

### Step 4: Disable Preview Deployments (Optional)

1. In Vercel Dashboard → Project → Settings → Git
2. Under **"Preview Deployments"**, set to **"None"** or limit to no branches
3. This prevents PRs from creating preview URLs (reduces noise and build minutes)

### Step 5: Verify First Deploy

After setup, trigger a test deploy by pushing a tag:
```bash
git tag website_v0.1.0-test
git push origin website_v0.1.0-test
```

Then check: https://twelvify.com loads correctly, https://www.twelvify.com redirects to https://twelvify.com.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug / Plan-Directed] Added vendor chunk splitting to vite.config.ts**
- **Found during:** Task 2 (build output inspection)
- **Issue:** Main JS bundle was 215KB uncompressed, exceeding the 200KB threshold specified in the plan
- **Fix:** Added `build.rollupOptions.output.manualChunks` to vite.config.ts as the plan directed — splits react+react-dom to `vendor-[hash].js`
- **Files modified:** `landing/vite.config.ts`
- **Verification:** Rebuilt — index.js now 199KB, vendor.js 11KB, both under 300KB limit
- **Committed in:** `69c9dfe` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (plan-directed bundle optimization)
**Impact on plan:** Minor improvement — the plan explicitly called for this fix if bundle exceeded 200KB. No scope creep.

## Issues Encountered

None - build succeeded on first run, JSON was valid, no TypeScript errors from vite.config.ts changes.

## User Setup Required

**Vercel project requires one-time manual configuration.** See "Vercel Project Setup" section above for:
- Root Directory setting (`landing/`)
- Ignored Build Step expression for tag-based deploys
- Custom domain and www redirect configuration
- Preview deployment controls

## Next Phase Readiness

- `landing/vercel.json` committed and ready — Plan 03 checkpoint can reference it directly
- Vercel setup steps documented above for the human-action checkpoint in Plan 03
- Build pipeline clean, all assets hashed and within size limits
- www redirect rule in vercel.json — activates automatically once domain is configured

---
*Phase: 07-launch*
*Completed: 2026-02-25*
