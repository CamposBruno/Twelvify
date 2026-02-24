# Phase 2: Backend Integration & AI Simplification - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the extension to a backend AI proxy that simplifies selected text, implements rate limiting and cost controls, and provides graceful error handling. Users can click the floating icon to trigger simplification and see the result streamed in-place. Personalization, keyboard shortcuts, display mode toggle, and revert are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Simplification Output
- Adaptive reading level: adjust simplification intensity based on source complexity — simpler sources get light edits, dense sources get heavy simplification
- Preserve original structure: paragraphs, bullet points, headings stay intact — only simplify the words within them
- Replace jargon with plain language (e.g., "myocardial infarction" → "heart attack") — do NOT keep-and-explain
- Length/brevity: Claude's discretion — balance shorter vs. clearer based on source text
- Blend seamlessly: simplified text reads naturally within surrounding unmodified text (no highlight border on the replaced section)
- Always casual/friendly tone regardless of source formality
- Numbers, dates, and proper nouns (names, places, brands) left untouched
- Preserve code snippets, formulas, and technical notation as-is — only simplify surrounding prose
- Always attempt simplification regardless of selection length (no minimum threshold)
- Support any language — simplify text in whatever language it's written in
- Preserve rich formatting (bold, italic, links) in simplified output
- Preserve citations, footnotes, and reference links

### Processing Experience
- Streaming text replacement: simplified text streams in word-by-word, replacing original progressively
- No cancel button needed — fast enough that cancelling isn't worth the UI complexity
- Brief highlight then fade after completion — subtle background highlight on simplified text that fades after 1-2 seconds
- Block concurrent requests — disable the button during processing, user must wait
- Button shows spinner replacing the icon during processing
- Always show streaming effect even for fast responses (<500ms) — consistency over speed
- No audio or haptic feedback — visual only
- Preserve scroll position during text replacement — no jarring jumps

### Error Presentation
- Button turns warning yellow with a shiver/shake animation, then a tooltip bubble appears attached to the floating button
- Auto-dismiss after ~5 seconds, but user can also click to dismiss sooner
- Sarcastic, playful tone — not taking itself too seriously (e.g., "Wow, no internet. Shocking." / "Easy there, speed racer.")
- Rate limit error shows exact reset time (e.g., "Chill, I need a break. Try again in 12 minutes.")

### Trigger Flow
- Immediate action on click — no confirmation step, simplification starts right away
- No text selected → show sarcastic hint tooltip (e.g., "Select some text first, genius")
- Keep Phase 1 button visibility behavior (appears on text selection)
- Button hides/fades after successful simplification, reappears on next text selection

### Claude's Discretion
- Backend architecture choices (framework, hosting, deployment)
- AI prompt engineering for simplification quality
- Rate limiting implementation details
- Request validation approach
- Exact streaming implementation (SSE vs WebSocket vs other)
- Exact animation timings and easing curves
- Specific sarcastic error message copy (tone is set, exact wording is flexible)

</decisions>

<specifics>
## Specific Ideas

- Error UX: button turns yellow + shiver animation + tooltip — very tactile, physical feeling
- Sarcastic personality throughout error messages — the extension has attitude
- Streaming word-by-word replacement gives the user something to watch and builds confidence the AI is working
- "Select some text first, genius" — captures the playful brand voice

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-backend-integration-ai-simplification*
*Context gathered: 2026-02-23*
