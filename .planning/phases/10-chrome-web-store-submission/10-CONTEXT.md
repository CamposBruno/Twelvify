# Phase 10: Chrome Web Store Submission - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare all store listing assets and submit the extension to Chrome Web Store. This includes: privacy policy page, extension icons at all required sizes, 5+ store screenshots, store listing copy (title, summary, description), and the actual submission with minimal permissions. No new extension features are added in this phase.

</domain>

<decisions>
## Implementation Decisions

### Store listing copy
- Casual & friendly tone — conversational, approachable
- Lead with "Big words, simplified" as the primary selling point
- Target audience: general readers (anyone encountering unfamiliar vocabulary while browsing)
- Prominently mention AI — "Powered by AI" is a selling point, not hidden
- Title must be under 75 chars, summary under 132 chars, description in full

### Privacy policy
- Standard legal tone — formal privacy policy structure
- Host at twelvify.com/privacy as a route on the existing landing site
- Refer to AI processing as "third-party AI service" — do not name OpenAI specifically
- Disclose anonymous usage statistics (basic counts without user identity)
- Clearly state: no content logging, selected text is not stored, processed transiently

### Screenshots
- At least 5 screenshots at 1280x800px
- Feature coverage: text selection + popup (core flow), settings/personalization, different website contexts (news, Wikipedia, academic), before/after comparison
- Include text annotations/callouts explaining what's happening in each screenshot
- Light mode only — clean, bright screenshots
- Creation method: Claude's discretion (manual captures vs designed mockups — pick most practical approach)

### Icon design
- Stylized "T" lettermark for Twelvify — plain, no embellishments
- Sharp-square background (not rounded, not circle) with brand color fill
- Flat/minimal style — no gradients or shadows
- Match landing page brand colors and font family for the T
- Create as SVG, export to 16, 32, 48, and 128px PNGs
- Brand new icon — nothing exists yet

### Claude's Discretion
- Screenshot creation method (browser captures vs mockups)
- Exact screenshot annotation style and layout
- Privacy policy section structure and specific legal phrasing
- Icon SVG tooling and PNG export process

</decisions>

<specifics>
## Specific Ideas

- "Big words, simplified" as the tagline/pitch — user's own framing
- Icon should follow the same colour and design language as the landing page
- AI should be prominently featured as a selling point in the listing
- Privacy policy hosted as a landing page route (twelvify.com/privacy) for consistency

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-chrome-web-store-submission*
*Context gathered: 2026-02-25*
