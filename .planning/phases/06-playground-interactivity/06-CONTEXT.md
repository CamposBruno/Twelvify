# Phase 6: Playground & Interactivity - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Live AI demo section on the landing page. Visitors click "Fix This Mess" and watch hardcoded sample text get simplified via a streaming AI response. Includes a dedicated `/api/playground` endpoint with rate limiting. The playground is a one-shot demo per page load — no repeat runs within a session, but fresh on each visit.

</domain>

<decisions>
## Implementation Decisions

### Sample text & layout
- Use the sample text from the design: "The superfluous utilization of sesquipedalian verbiage inevitably precipitates a profound state of intellectual vertigo for the uninitiated observer."
- Complex words are highlighted with colored underlines (matching design: `bg-primary/20` + `border-b-4 border-primary`)
- **Inline replacement** — single text area, original text gets replaced in-place as AI output streams in
- After simplification, highlights fade away — simplified text is clean with no markup. Shows contrast between "messy before" and "clean after"
- Adapt subtitle copy from "Highlight the text below and see the magic" to match the button-click interaction (e.g., "Click the button and watch the magic happen")

### Streaming animation
- **Typing effect** — characters appear one by one with a blinking cursor
- Transition from original to simplified: Claude's discretion (could be instant swap, fade, or scramble — pick what fits the punk aesthetic)
- **Fast typing speed** — 30-50ms per character, feels quick and confident
- Completion: cursor blinks a few times at the end, then fades away — subtle finish

### One-shot flow
- **Fresh each visit** — page reload resets the playground. No localStorage persistence. Visitors can re-run the demo on return visits
- One-shot within a page load — button disabled after first successful run
- Disabled state: button grays out and label changes (e.g., "FIXED!" or "DONE")
- Button loading state: Claude's discretion (spinner or copy change while waiting for API)
- Legend at bottom (COMPLEX ORIGINAL → SIMPLIFIED VERSION) updates after demo runs to reflect new state

### Error & loading states
- Rate limit error tone: **playful/on-brand** — matches the punk vibe (e.g., "Whoa, slow down! The AI needs a breather.")
- Error placement: **toast/banner** that slides in above the playground section
- Toast auto-dismisses after ~5 seconds
- Mid-stream failure: keep whatever was typed so far, show error toast that something went wrong (don't revert to original)

### Claude's Discretion
- Original-to-simplified transition animation (instant, fade, or scramble)
- Button loading state indicator (spinner vs copy change)
- Exact error copy wording (keep it fun and on-brand)
- Toast styling within the zine/punk design system
- Typing cursor visual style

</decisions>

<specifics>
## Specific Ideas

- Design already exists in `landing/code.html` — the playground section (`#try-it`) has full HTML/CSS with the zine aesthetic, dashed border text area, rotated elements, and the COMPLEX ORIGINAL → SIMPLIFIED VERSION legend
- Heading is "Is this even English?" — keep this
- Button copy is "FIX THIS MESS" with `auto_fix_high` material icon
- The section uses `zine-box` styling with `bg-white`, overflow hidden, and the characteristic border/shadow treatment

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-playground-interactivity*
*Context gathered: 2026-02-24*
