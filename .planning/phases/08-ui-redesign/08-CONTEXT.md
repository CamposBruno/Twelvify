# Phase 8: UI Redesign - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the toned-down zine/punk brand aesthetic from the landing page to the Chrome extension's popup panel and floating button. Custom fonts (Permanent Marker, Special Elite), brand colors (red primary, indigo, yellow accents), and sharp-edge styling. Must remain usable and render reliably across high-complexity websites (Gmail, YouTube, GitHub, Reddit, Medium). Graceful fallback to system fonts if custom fonts fail to load.

</domain>

<decisions>
## Implementation Decisions

### Visual Intensity
- Subtle rotation hints only — slight rotation on 1-2 accent elements (e.g., header, a badge) but all controls and inputs stay straight
- Sharp but lighter borders: 1px borders (not 2px), smaller offset shadows (3-4px, not 8px) — zine feel without heaviness
- Subtle dotted grid background on popup — no torn-paper clip-paths or heavy textures
- No heavy rotations, no thick borders, no dramatic shadows

### Color Mapping
- **Primary accent: Red (#f56060)** — replaces indigo as the main brand color throughout the extension
- **Active/selected buttons: Red fill (#f56060) + white text** — tone selector, depth selector
- **Yellow accents: Sparingly** — small accent uses like highlighting an active badge or emphasis element
- **Popup background: Light off-white (#f8f6f6)** — warm, papery feel matching landing page light theme
- **Indigo (#6366f1) demoted** — no longer primary; may still appear for specific secondary actions at Claude's discretion
- Keep green (#10b981) for undo button, amber (#f59e0b) for error states

### Popup Panel Layout
- **Section labels:** Special Elite font (typewriter punk feel)
- **Tone/depth selector buttons:** Sharp-edged pill shapes with thin borders, red fill when active
- **Inputs:** Stay clean and readable (brand fonts not required for input text)

### Floating Button
- **Shape:** Sharp rectangle (square corners) with thin border — matches popup's sharp aesthetic
- **Color: Red (#f56060)** — bold, on-brand, consistent with popup
- **Content:** Keep current text logic (icon + "Simplify"), but change icon to wand
- **Shadow:** Small offset shadow (2-3px) — on-brand but won't clash with page content

### Claude's Discretion
- Popup header design (Permanent Marker title treatment, icon placement, any accent decoration)
- Popup width (320px or adjust if brand styling needs breathing room)
- Font choices for button labels and input text (balance readability vs brand)
- Exact grid pattern opacity and spacing
- Typography sizing and spacing adjustments
- Error tooltip styling updates
- Floating popup (simplified text display) brand treatment

</decisions>

<specifics>
## Specific Ideas

- Landing page brand reference: Permanent Marker for display, Special Elite for labels, Inter for body
- Landing page uses `.zine-box` class with thick borders, dotted grid backgrounds, and chunky drop shadows — tone this down for extension context
- The wand icon should be used on the floating button instead of current sparkle
- Tone selector buttons: "Baby, 5, 12, 18, Big Boy" — sharp-edged pills, red when selected
- Extension currently has zero brand presence — this is a full visual overhaul

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-ui-redesign*
*Context gathered: 2026-02-25*
