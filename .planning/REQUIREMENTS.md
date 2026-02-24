# Requirements: Twelveify Landing Page

**Defined:** 2026-02-24
**Core Value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## v1.1 Requirements

Requirements for the landing page milestone. Each maps to roadmap phases.

### Setup

- [x] **SETUP-01**: React app bootstrapped with Tailwind CSS, custom theme (fonts, colors, borders matching design)
- [x] **SETUP-02**: Google Fonts loaded (Permanent Marker, Special Elite, Inter) and Material Symbols Icons

### Layout

- [x] **LAYOUT-01**: Sticky nav bar with logo, section links (How it works, Features, Playground), and "Add to Chrome" CTA
- [x] **LAYOUT-02**: Responsive layout — mobile-first with desktop breakpoints matching design grid

### Sections

- [x] **SECT-01**: Hero section with tagline, description, install/demo CTAs, social proof avatars, and browser mockup
- [x] **SECT-02**: How-it-works section with 3-step cards (Highlight, Click Wand, Read Simplified)
- [x] **SECT-03**: Playground section with live AI demo — user clicks "Fix This Mess" and text is simplified via dedicated backend endpoint
- [x] **SECT-04**: Features section with 3 feature cards (In-page Replacement, Privacy by Design, Native Feel) and illustration
- [x] **SECT-05**: CTA section with final install call-to-action and "Free to use — Forever" badge
- [x] **SECT-06**: Footer with logo, tagline, product/resources/legal links, social links, copyright

### Interactive

- [x] **INTX-01**: Playground calls dedicated `/api/playground` endpoint to simplify sample text with streaming response
- [x] **INTX-02**: Smooth scroll navigation for anchor links
- [x] **INTX-03**: Hover effects matching design (rotation resets, shadow transitions, color transitions)
- [x] **INTX-04**: Playground button disabled after first successful simplification (one-shot demo)
- [x] **INTX-05**: Graceful rate-limit error handling — friendly message when playground limit exceeded

### Design

- [x] **DSGN-01**: Zine/punk aesthetic: sharp borders, box shadows, rotation transforms, paper-tear clip-path

- [x] **DSGN-03**: Custom Tailwind config (primary #f56060, background-light/dark, font families, border-radius 0px)

### SEO

- [x] **SEO-01**: Meta tags (title, description, canonical URL)
- [x] **SEO-02**: Open Graph and Twitter Card tags for social sharing
- [x] **SEO-03**: Semantic HTML structure (proper heading hierarchy, landmarks)

### Analytics

- [ ] **ANALYTICS-01**: Analytics integration (Google Analytics, Plausible, or similar) tracking page views and CTA clicks

### Performance

- [ ] **PERF-01**: Lighthouse performance score 90+ (image optimization, lazy loading, efficient asset delivery)
- [x] **PERF-02**: Font loading optimized (preconnect, font-display: swap)

### Backend

- [ ] **API-01**: Dedicated `/api/playground` endpoint with stricter rate limiting (1 req/sec per client)
- [ ] **API-02**: Playground endpoint uses same AI simplification but with hardcoded sample text (no arbitrary input)

### Deploy

- [ ] **DEPLOY-01**: Production build optimized (minified, tree-shaken, assets hashed)
- [ ] **DEPLOY-02**: Deploy to Netlify or Vercel with CI from git push
- [ ] **DEPLOY-03**: Custom domain configured on hosting platform

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Landing Page Enhancements

- **LP-01**: A/B testing for CTA variants
- **LP-02**: Blog/content section for SEO
- **LP-03**: Testimonials from real users (post-launch)
- **LP-04**: Video demo embed

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-page site | Single-page landing is sufficient for v1.1 |
| Email capture / waitlist | Extension is already live; direct to Web Store instead |
| Internationalization | English-only for now |
| CMS integration | Static content is fine for a landing page |
| User accounts on landing page | No need — extension handles preferences locally |
| Dark mode | Not needed for landing page; light-only simplifies implementation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 4 | Complete |
| SETUP-02 | Phase 4 | Complete |
| DSGN-01 | Phase 4 | Complete |

| DSGN-03 | Phase 4 | Complete |
| PERF-02 | Phase 4 | Complete |
| LAYOUT-01 | Phase 5 | Complete |
| LAYOUT-02 | Phase 5 | Complete |
| SECT-01 | Phase 5 | Complete |
| SECT-02 | Phase 5 | Complete |
| SECT-04 | Phase 5 | Complete |
| SECT-05 | Phase 5 | Complete |
| SECT-06 | Phase 5 | Complete |
| INTX-02 | Phase 5 | Complete |
| INTX-03 | Phase 5 | Complete |
| SEO-01 | Phase 5 | Complete |
| SEO-02 | Phase 5 | Complete |
| SEO-03 | Phase 5 | Complete |
| SECT-03 | Phase 6 | Complete |
| INTX-01 | Phase 6 | Complete |
| INTX-04 | Phase 6 | Complete |
| INTX-05 | Phase 6 | Complete |
| API-01 | Phase 6 | Pending |
| API-02 | Phase 6 | Pending |
| ANALYTICS-01 | Phase 7 | Pending |
| PERF-01 | Phase 7 | Pending |
| DEPLOY-01 | Phase 7 | Pending |
| DEPLOY-02 | Phase 7 | Pending |
| DEPLOY-03 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 — traceability populated by roadmapper*
