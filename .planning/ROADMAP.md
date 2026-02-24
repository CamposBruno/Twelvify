# Roadmap: Twelveify

**Project:** Twelveify (AI-powered text simplification Chrome extension)

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-02-24)
- 🚧 **v1.1 Landing Page** — Phases 4-7 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-02-24</summary>

- [x] Phase 1: Foundation & Text Selection (4/4 plans) — completed 2026-02-23
- [x] Phase 2: Backend Integration & AI Simplification (4/4 plans) — completed 2026-02-24
- [x] Phase 3: Personalization & UX Polish (6/6 plans) — completed 2026-02-24

</details>

### 🚧 v1.1 Landing Page (In Progress)

**Milestone Goal:** Implement the existing HTML/Tailwind landing page design as a React app and deploy to Netlify/Vercel to drive Chrome Web Store installs.

- [x] **Phase 4: Foundation** - React app with design system, fonts, and Tailwind config **[2 plans]** (completed 2026-02-24)
- [x] **Phase 5: Static Sections** - All page sections (nav, hero, how-it-works, features, CTA, footer), responsive layout, and SEO **[4 plans]** (completed 2026-02-24)
- [ ] **Phase 6: Playground & Interactivity** - Live AI demo section, backend endpoint, and all interactive behaviors **[3 plans]**
- [ ] **Phase 7: Launch** - Analytics, performance optimization, and production deployment

## Phase Details

### Phase 4: Foundation
**Goal**: The React app shell exists with the full design system — correct fonts, colors, and zine/punk visual style applied globally
**Depends on**: Nothing (first v1.1 phase)
**Requirements**: SETUP-01, SETUP-02, DSGN-01, DSGN-03, PERF-02
**Success Criteria** (what must be TRUE):
  1. React app renders in browser with Permanent Marker, Special Elite, and Inter fonts loaded from Google Fonts
  2. Custom Tailwind config applies #f56060 primary color, 0px border-radius, and paper-texture / shadow variables
  3. Sharp borders, box shadows, and rotation transforms render correctly on sample elements
  4. Fonts load with preconnect and font-display swap — no layout shift on reload
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Bootstrap Vite React app + Tailwind config + zine/punk base styles
- [ ] 04-02-PLAN.md — Font loading (preconnect + display=swap) + design system demo + visual verification

### Phase 5: Static Sections
**Goal**: The full landing page is visible and navigable — every section renders with correct content, responsive layout, and accessible semantics
**Depends on**: Phase 4
**Requirements**: LAYOUT-01, LAYOUT-02, SECT-01, SECT-02, SECT-04, SECT-05, SECT-06, INTX-02, INTX-03, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. Sticky nav bar shows logo, section links, and "Add to Chrome" CTA — clicking section links smooth-scrolls to the correct anchor
  2. Hero, How-it-works, Features, CTA, and Footer sections all render with correct copy, images, and layout on both mobile and desktop
  3. "Add to Chrome" and install CTAs link to the Chrome Web Store extension URL
  4. Hover effects on cards and buttons match the design (rotation resets, shadow transitions, color transitions)
  5. Page title, description, canonical, Open Graph, and Twitter Card meta tags are set; heading hierarchy is semantically correct
**Plans**: 4 plans

Plans:
- [ ] 05-01-PLAN.md — App shell + Nav component + Chrome Store URL constant + SEO meta tags
- [ ] 05-02-PLAN.md — Hero section + How-it-works section components
- [ ] 05-03-PLAN.md — Features + CTA + Footer section components
- [ ] 05-04-PLAN.md — Wire all sections into App.tsx + smooth scroll + visual verification

### Phase 6: Playground & Interactivity
**Goal**: The live playground demo works end-to-end — a visitor can click "Fix This Mess" and see the hardcoded sample text simplified via AI in real time
**Depends on**: Phase 5
**Requirements**: SECT-03, INTX-01, INTX-04, INTX-05, API-01, API-02
**Success Criteria** (what must be TRUE):
  1. Playground section renders with sample text and a "Fix This Mess" button
  2. Clicking the button calls `/api/playground` and streams the simplified text into the page character-by-character with a typing animation
  3. The button becomes disabled after one successful simplification (one-shot demo, no repeat)
  4. When the playground rate limit is hit, a friendly error message appears instead of a broken state
  5. Backend `/api/playground` endpoint enforces 60 req/min per client and only processes the hardcoded sample — no arbitrary user input accepted
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — Backend /api/playground route with hardcoded sample text and 60 req/min rate limiter
- [ ] 06-02-PLAN.md — Playground React component with typing animation, one-shot disable, and error toast
- [ ] 06-03-PLAN.md — Wire Playground into App.tsx + end-to-end human verification

### Phase 7: Launch
**Goal**: The landing page is live at a public URL, loads fast, and tracks visits and CTA clicks
**Depends on**: Phase 6
**Requirements**: ANALYTICS-01, PERF-01, DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. Landing page is accessible at a custom domain via Netlify or Vercel, deploying automatically on git push
  2. Lighthouse performance score is 90+ — images are optimized, assets are hashed and minified
  3. Page views and "Add to Chrome" CTA click events are captured in an analytics dashboard
**Plans**: TBD

## Progress

**Execution Order:** 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Text Selection | v1.0 | 4/4 | Complete | 2026-02-23 |
| 2. Backend Integration & AI Simplification | v1.0 | 4/4 | Complete | 2026-02-24 |
| 3. Personalization & UX Polish | v1.0 | 6/6 | Complete | 2026-02-24 |
| 4. Foundation | 2/2 | Complete    | 2026-02-24 | - |
| 5. Static Sections | 4/4 | Complete    | 2026-02-24 | - |
| 6. Playground & Interactivity | v1.1 | 0/? | Not started | - |
| 7. Launch | v1.1 | 0/? | Not started | - |

---

*Roadmap created: 2026-02-20*
*v1.0 MVP shipped: 2026-02-24*
*v1.1 phases added: 2026-02-24*

Full v1.0 details: `milestones/v1.0-ROADMAP.md`
