# Roadmap: Twelveify

**Project:** Twelveify (AI-powered text simplification Chrome extension)

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-02-24)
- ✅ **v1.1 Landing Page** — Phases 4-7 (shipped 2026-02-25)
- 🚧 **v1.2 Extension Redesign + Ship** — Phases 8-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-02-24</summary>

- [x] Phase 1: Foundation & Text Selection (4/4 plans) — completed 2026-02-23
- [x] Phase 2: Backend Integration & AI Simplification (4/4 plans) — completed 2026-02-24
- [x] Phase 3: Personalization & UX Polish (6/6 plans) — completed 2026-02-24

</details>

<details>
<summary>✅ v1.1 Landing Page (Phases 4-7) — SHIPPED 2026-02-25</summary>

- [x] Phase 4: Foundation (2/2 plans) — completed 2026-02-24
- [x] Phase 5: Static Sections (4/4 plans) — completed 2026-02-24
- [x] Phase 6: Playground & Interactivity (3/3 plans) — completed 2026-02-24
- [x] Phase 7: Launch (3/3 plans) — completed 2026-02-25

</details>

### 🚧 v1.2 Extension Redesign + Ship (In Progress)

**Milestone Goal:** Redesign the extension's user-facing UI with toned-down zine/punk aesthetic from the landing page, deploy backend to production on Render, and submit to Chrome Web Store.

- [ ] **Phase 8: UI Redesign** - Redesign popup panel and floating button with landing page brand aesthetic; verify CSS isolation on high-complexity websites
  Plans:
  - [ ] 08-01-PLAN.md — Popup brand styling (fonts, colors, grid background, App.tsx + SettingsPanel.tsx)
  - [ ] 08-02-PLAN.md — Floating button brand styling (red, wand icon, sharp corners) + FloatingPopup + ErrorTooltip
  - [ ] 08-03-PLAN.md — Build + human visual verification on 5 complex sites
- [ ] **Phase 9: Backend Production Deploy** - Deploy Express backend to Render with health checks, graceful shutdown, and production CORS configuration
- [ ] **Phase 10: Chrome Web Store Submission** - Publish privacy policy, prepare store assets, and submit extension

## Phase Details

### Phase 8: UI Redesign
**Goal**: Extension UI displays the toned-down zine/punk brand aesthetic from the landing page, with custom fonts and brand colors, reliably across high-complexity websites
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: UIRD-01, UIRD-02, UIRD-03, UIRD-04, UIRD-05, UIRD-06
**Success Criteria** (what must be TRUE):
  1. Popup panel renders Permanent Marker and Special Elite fonts with the indigo accent color palette and sharp borders matching the landing page brand
  2. Floating button displays with the branded icon and styled appearance; it is visible and clickable on Gmail, YouTube, GitHub, Reddit, and Medium without z-index conflicts
  3. Popup panel layout is clean and usable — zine/punk aesthetic applied with toned-down intensity (no heavy rotations or textures)
  4. If custom fonts fail to load, popup and floating button display legibly with system font fallbacks (no broken UI)
**Plans**: 3 plans

### Phase 9: Backend Production Deploy
**Goal**: Express backend runs on Render in production with health monitoring, zero-downtime deploys, and CORS correctly scoped for extension and landing page clients
**Depends on**: Phase 8
**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05, DEPL-06
**Success Criteria** (what must be TRUE):
  1. Backend is live on Render and the `/health` endpoint returns 200 OK (verified via curl or browser)
  2. Extension manifest references the production Render URL with no localhost references in the production build (verified by grep of build output)
  3. A text simplification works end-to-end: highlight text → click floating button → streamed result appears in page (using production backend)
  4. CORS allows requests from the Chrome extension and from twelvify.com; requests from other origins are rejected
**Plans**: TBD

### Phase 10: Chrome Web Store Submission
**Goal**: Extension is submitted to the Chrome Web Store with complete, accurate store listing assets and an accurate published privacy policy
**Depends on**: Phase 9
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05
**Success Criteria** (what must be TRUE):
  1. Privacy policy is live at twelvify.com/privacy and accurately describes the data practices (no content logging, anonymous analytics, OpenAI proxy)
  2. Extension icons exist at 16, 32, 48, and 128px PNG sizes and are recognizable at every size
  3. Store listing has at least 5 screenshots (1280x800px) showing the redesigned UI, a title under 75 characters, a summary under 132 characters, and a description
  4. Extension is submitted to Chrome Web Store with minimal required permissions and review is initiated
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Text Selection | v1.0 | 4/4 | Complete | 2026-02-23 |
| 2. Backend Integration & AI Simplification | v1.0 | 4/4 | Complete | 2026-02-24 |
| 3. Personalization & UX Polish | v1.0 | 6/6 | Complete | 2026-02-24 |
| 4. Foundation | v1.1 | 2/2 | Complete | 2026-02-24 |
| 5. Static Sections | v1.1 | 4/4 | Complete | 2026-02-24 |
| 6. Playground & Interactivity | v1.1 | 3/3 | Complete | 2026-02-24 |
| 7. Launch | v1.1 | 3/3 | Complete | 2026-02-25 |
| 8. UI Redesign | 2/3 | In Progress|  | - |
| 9. Backend Production Deploy | v1.2 | 0/? | Not started | - |
| 10. Chrome Web Store Submission | v1.2 | 0/? | Not started | - |

---

*Roadmap created: 2026-02-20*
*v1.0 MVP shipped: 2026-02-24*
*v1.1 Landing Page shipped: 2026-02-25*
*v1.2 phases added: 2026-02-25*

Full v1.0 details: `milestones/v1.0-ROADMAP.md`
Full v1.1 details: `milestones/v1.1-ROADMAP.md`
