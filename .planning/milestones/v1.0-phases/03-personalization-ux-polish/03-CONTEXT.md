# Phase 3: Personalization & UX Polish - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver personalization features (progressive onboarding, age-based simplification levels, profession-based analogies) and complete user control (keyboard shortcuts, display mode toggle, revert/undo). The extension already has text selection, floating button, SSE streaming simplification, and error handling from Phases 1-2.

</domain>

<decisions>
## Implementation Decisions

### Progressive Onboarding Flow
- Onboarding triggers after **3rd simplification** — let user get value first
- Prompts appear **inline below simplified text** — contextual, non-intrusive
- Preference collection order: **Age level → Depth → Profession** (one per session)
- Spacing: **every 2-3 uses apart** (use 3: age level, use 5-6: depth, use 8-9: profession)
- Dismissal: **one dismiss = gone forever** — user finds preferences in settings if they want later
- Each prompt shows **before/after preview** of how the preference affects output
- Note: "depth" is separate from the age-based tone — it controls explanation detail level

### Age-Based Simplification Levels (Tone)
- Five levels: **Baby** (playful baby sounds/references) → **5** → **12** (default) → **18** → **Big Boy** (adult/original complexity)
- **Default for new users: 12** — on-brand with "Twelveify"
- Baby mode is intentionally playful/humorous — not a serious simplification level

### Floating Button Age Toggle
- Button label shows **one age level lower** than current setting (e.g., setting is 12 → button says "Explain like I'm 5")
- At the lowest level (Baby), **wraps around to the top**: "Explain like I'm a Big Boy"
- This creates a cycle: each click gives a different perspective on the same text

### Profession/Interests
- **Free text input** — user types their background ("I'm a nurse", "I do marketing")
- AI uses this for relatable analogies in simplifications

### Settings Access
- **Extension popup** (click toolbar icon) is the single settings UI for all preferences
- No settings gear on the floating button — keep it clean

### Keyboard Shortcut
- Default: **Ctrl+Shift+1** — on-brand nod to "12"
- **Customizable via extension popup settings** (not Chrome's shortcuts page)
- **Only works with text selected** — does nothing without selection
- Discoverability: **tooltip on floating button hover** + **one-time mention during onboarding**

### Revert / Undo
- After simplification, **floating button becomes an undo button**
- **ESC key** reverts most recent simplification
- **Stack-based undo**: ESC reverts in reverse order (most recent first, then previous, like Ctrl+Z)
- Undo button **always visible** as long as any simplification is present on the page
- Undo stack **resets on page navigation** — no cross-page state
- **No badge/count** on undo button — just press ESC or click

### Display Modes
- **Replace-in-page** is the default (already partially working from Phase 2 streaming)
- **Floating popup** as alternative — toggle in extension popup settings only (not per-simplification)

### Claude's Discretion
- Visual confirmation when a preference is set during onboarding (brief inline confirmation vs re-simplify)
- Floating popup design for alternative display mode (card near selection vs side panel)
- Exact spacing and typography for onboarding prompts
- Custom shortcut picker UI design in extension popup

</decisions>

<specifics>
## Specific Ideas

- The age-based tone system is core to the brand — "Twelveify" = "Explain like I'm 12"
- Baby mode should be genuinely funny/playful (baby sounds, simple references) — it's a personality feature
- The floating button cycling through age levels ("Explain like I'm 5" → click → "Explain like I'm a Baby" → click → "Explain like I'm a Big Boy") creates a fun, discoverable interaction loop
- "Big Boy" as the top-level name, not "Adult" — keeps the playful tone consistent

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-personalization-ux-polish*
*Context gathered: 2026-02-23*
