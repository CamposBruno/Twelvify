# Phase 5: Static Sections - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert the existing HTML/Tailwind landing page design (code.html) into React components with all static sections: nav, hero, how-it-works, features, CTA, and footer. Includes responsive layout, hover effects, smooth scroll navigation, and SEO meta tags. The Playground section (SECT-03) and all interactivity beyond hover effects and smooth scroll belong to Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Section copy & content
- Use code.html as the exact source of truth for all text content — no copy changes
- "NOW IN THE WEB STORE (DUH)" badge stays as-is (static, not conditional)
- Social proof shows "10,000+ users already get it" as-is
- Footer links (Privacy Policy, Terms of Service, GitHub, Twitter) use placeholder '#' hrefs

### Mobile layout adaptation
- Mobile nav: logo + "Add to Chrome" CTA button only — no hamburger menu, no section links on mobile
- Hero on mobile: text only — hide the browser mockup on small screens
- Cards (how-it-works, features): stacking/layout approach is at Claude's discretion
- All sections visible on mobile — nothing hidden, just restacked/resized

### Image & asset strategy
- Browser mockup in hero is CSS-built (HTML/CSS magic, not an image) — replicate from code.html
- Social proof avatars: Claude's discretion (colored circles from code.html or alternative)
- Feature card icons: keep current Material Symbols icons (auto_fix_high, lock, tune)
- How-it-works step icons: Claude's discretion (currently highlight, auto_fix_high, visibility)

### Chrome Web Store link
- Extension is NOT published yet — use Chrome Web Store homepage as placeholder URL
- Define a single `CHROME_STORE_URL` constant in one place — easy to swap when extension goes live
- All "Add to Chrome" / install CTA buttons (nav, hero, CTA section) share the same URL constant

### Claude's Discretion
- Card layout pattern on mobile (vertical stack vs horizontal scroll)
- Social proof avatar styling
- How-it-works step icon choices
- Loading skeleton or transition approaches

</decisions>

<specifics>
## Specific Ideas

- Browser mockup is "CSS magic" — build it with HTML/CSS like in code.html, no image assets needed
- code.html is the single source of truth for visual design, copy, and component structure

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-static-sections*
*Context gathered: 2026-02-24*
