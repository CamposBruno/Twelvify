# Requirements: Twelveify Landing Page

**Defined:** 2026-02-24
**Core Value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## v1.1 Requirements

Requirements for the landing page milestone. Each maps to roadmap phases.

### Setup

- [ ] **SETUP-01**: React app bootstrapped with Tailwind CSS, custom theme (fonts, colors, borders matching design)
- [ ] **SETUP-02**: Google Fonts loaded (Permanent Marker, Special Elite, Inter) and Material Symbols Icons

### Layout

- [ ] **LAYOUT-01**: Sticky nav bar with logo, section links (How it works, Features, Playground), and "Add to Chrome" CTA
- [ ] **LAYOUT-02**: Responsive layout — mobile-first with desktop breakpoints matching design grid

### Sections

- [ ] **SECT-01**: Hero section with tagline, description, install/demo CTAs, social proof avatars, and browser mockup
- [ ] **SECT-02**: How-it-works section with 3-step cards (Highlight, Click Wand, Read Simplified)
- [ ] **SECT-03**: Playground section with live AI demo — user clicks "Fix This Mess" and text is simplified via dedicated backend endpoint
- [ ] **SECT-04**: Features section with 3 feature cards (In-page Replacement, Privacy by Design, Native Feel) and illustration
- [ ] **SECT-05**: CTA section with final install call-to-action and "Free to use — Forever" badge
- [ ] **SECT-06**: Footer with logo, tagline, product/resources/legal links, social links, copyright

### Interactive

- [ ] **INTX-01**: Playground calls dedicated `/api/playground` endpoint to simplify sample text with streaming response
- [ ] **INTX-02**: Smooth scroll navigation for anchor links
- [ ] **INTX-03**: Hover effects matching design (rotation resets, shadow transitions, color transitions)
- [ ] **INTX-04**: Playground button disabled after first successful simplification (one-shot demo)
- [ ] **INTX-05**: Graceful rate-limit error handling — friendly message when playground limit exceeded

### Design

- [ ] **DSGN-01**: Zine/punk aesthetic: sharp borders, box shadows, rotation transforms, paper-tear clip-path
- [ ] **DSGN-02**: Dark mode support matching system preference
- [ ] **DSGN-03**: Custom Tailwind config (primary #f56060, background-light/dark, font families, border-radius 0px)

### SEO

- [ ] **SEO-01**: Meta tags (title, description, canonical URL)
- [ ] **SEO-02**: Open Graph and Twitter Card tags for social sharing
- [ ] **SEO-03**: Semantic HTML structure (proper heading hierarchy, landmarks)

### Analytics

- [ ] **ANALYTICS-01**: Analytics integration (Google Analytics, Plausible, or similar) tracking page views and CTA clicks

### Performance

- [ ] **PERF-01**: Lighthouse performance score 90+ (image optimization, lazy loading, efficient asset delivery)
- [ ] **PERF-02**: Font loading optimized (preconnect, font-display: swap)

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

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated by roadmapper) | | |

**Coverage:**
- v1.1 requirements: 27 total
- Mapped to phases: 0
- Unmapped: 27

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 after initial definition*
