# Phase 7: Launch - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Get the landing page live at a public URL with automated deployment, Lighthouse 90+ performance, and analytics tracking for page views and CTA clicks. The landing page already exists in `landing/` — this phase is about deploying, optimizing, and instrumenting it.

</domain>

<decisions>
## Implementation Decisions

### Hosting & deployment
- Host on **Vercel**
- Vercel root directory set to `landing/` — deploy only the landing folder
- Deploy trigger: **git tags starting with `website_`** (not push-to-main)
- No preview deploys on PRs — production deploys only on tag push
- Custom domain: **root domain** (twelvify.com), redirect www to root
- Domain registrar: **GoDaddy** — DNS configuration needed to point to Vercel
- Standard static site deployment — no special redirects, headers, or environment variables needed

### Performance strategy
- Lighthouse target: **90+** (not aiming for perfect 100)
- Vite build defaults for minification, tree-shaking, and asset hashing
- Claude should audit landing page assets for images and fonts — optimize as needed to hit 90+

### Claude's Discretion
- Build optimization details beyond Vite defaults (critical CSS, preload hints) — do what's needed for 90+
- Image optimization approach (if raster images exist)
- Font loading strategy (if external fonts are used)
- Analytics provider choice and implementation
- CTA click tracking implementation
- Exact Vercel configuration (vercel.json)

</decisions>

<specifics>
## Specific Ideas

- Tag-based deploys (`website_*`) give explicit control over when the landing page goes live
- Landing folder isolation means the Chrome extension codebase doesn't affect deployment

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-launch*
*Context gathered: 2026-02-24*
