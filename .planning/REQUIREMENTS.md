# Requirements: Twelvify

**Defined:** 2026-02-25
**Core Value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## v1.2 Requirements

Requirements for Extension Redesign + Ship milestone. Each maps to roadmap phases.

### UI Redesign

- [x] **UIRD-01**: Popup panel displays with Permanent Marker and Special Elite fonts matching the landing page typography
- [x] **UIRD-02**: Popup panel uses the landing page brand color palette (indigo accent, bold contrasts, sharp borders)
- [x] **UIRD-03**: Popup panel layout is clean and usable with toned-down zine/punk aesthetic (no heavy rotations/textures)
- [x] **UIRD-04**: Floating button displays with branded icon and styled appearance
- [x] **UIRD-05**: Floating button remains visible and clickable on high-complexity websites (Gmail, YouTube, GitHub, Reddit, Medium)
- [x] **UIRD-06**: Popup and floating button gracefully fall back to system fonts if custom fonts fail to load

### Backend Deploy

- [x] **DEPL-01**: Express backend is deployed and running on Render with production environment variables
- [x] **DEPL-02**: Backend exposes `/health` endpoint returning 200 OK for Render health checks
- [x] **DEPL-03**: Backend handles SIGTERM gracefully for zero-downtime deploys
- [x] **DEPL-04**: Extension manifest points to production Render URL (no localhost references in production build)
- [x] **DEPL-05**: CORS configuration allows requests from the Chrome extension in production
- [x] **DEPL-06**: CORS configuration allows requests from twelvify.com landing page (playground demo)

### Chrome Web Store

- [x] **STOR-01**: Privacy policy is published at twelvify.com/privacy with accurate data practices
- [x] **STOR-02**: Extension icon exists at 16, 32, 48, and 128px PNG sizes
- [ ] **STOR-03**: At least 5 screenshots at 1280x800px showing the redesigned extension UI
- [ ] **STOR-04**: Store listing has title (≤75 chars), summary (≤132 chars), and description
- [ ] **STOR-05**: Extension is submitted to Chrome Web Store with minimal required permissions

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### UI Polish

- **UIPOL-01**: Styled in-page simplified text with brand-consistent highlighting and border accents
- **UIPOL-02**: SSE keep-alive tuning with heartbeat comments for long simplifications
- **UIPOL-03**: Rate limit transparency UI showing usage count in popup
- **UIPOL-04**: Privacy badge displayed in popup footer

### Features

- **FEAT-01**: Click-to-define difficult words with inline tooltip
- **FEAT-02**: Chrome side panel display mode
- **FEAT-03**: Dark mode matching system preference
- **FEAT-04**: In-extension privacy messaging
- **FEAT-05**: Readability metrics showing before/after reading level

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| In-page text styling redesign | Deferred — popup and button are higher priority for brand consistency |
| SSE keep-alive heartbeats | Deferred — current SSE works; tune only if disconnects reported |
| Dark mode | Landing page is light-only; not v1.2 priority |
| Rate limit counter UI | Nice-to-have; gather user feedback post-launch |
| User accounts / OAuth | Not needed for free beta; local storage sufficient |
| Mobile app | Chrome extension only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| UIRD-01 | Phase 8 | Complete |
| UIRD-02 | Phase 8 | Complete |
| UIRD-03 | Phase 8 | Complete |
| UIRD-04 | Phase 8 | Complete |
| UIRD-05 | Phase 8 | Complete |
| UIRD-06 | Phase 8 | Complete |
| DEPL-01 | Phase 9 | Complete |
| DEPL-02 | Phase 9 | Complete |
| DEPL-03 | Phase 9 | Complete |
| DEPL-04 | Phase 9 | Complete |
| DEPL-05 | Phase 9 | Complete |
| DEPL-06 | Phase 9 | Complete |
| STOR-01 | Phase 10 | Complete |
| STOR-02 | Phase 10 | Complete |
| STOR-03 | Phase 10 | Pending |
| STOR-04 | Phase 10 | Pending |
| STOR-05 | Phase 10 | Pending |

**Coverage:**
- v1.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 — traceability complete after roadmap creation*
