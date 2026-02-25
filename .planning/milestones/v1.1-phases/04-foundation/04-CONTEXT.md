# Phase 4: Foundation - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

React app shell with the full design system — zine/punk visual style matching the existing landing page design (`landing/code.html`). Correct fonts, colors, sharp borders, box shadows, and rotation transforms applied globally. Layout sections and page content are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Design Reference
- Replicate the exact design system from `landing/code.html` — this is the source of truth
- No creative interpretation needed; match pixel-for-pixel

### Tailwind Configuration
- Primary color: `#f56060`
- Background light: `#f8f6f6`, background dark: `#221010`
- Font families: `display` (Permanent Marker, cursive), `punk` (Special Elite, monospace), `body` (Inter, sans-serif)
- Border radius: `DEFAULT: 0px`, `lg: 0px`, `xl: 0px`, `full: 9999px`

### Base Styles (CSS Layer)
- h1, h2, h3: `font-display`, `tracking-tight`, `uppercase`, `rotate(-1deg)`
- `.zine-box`: `border-2 border-slate-900`, `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`, dot-grid radial gradient background (`#e5e7eb 0.5px, transparent 0.5px`, `10px 10px`)
- `.paper-tear`: Custom clip-path polygon for torn-edge effect
- Dark mode variants: `dark:border-white`, `dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]`

### Font Loading
- Google Fonts with `display=swap`
- Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`
- Material Symbols Outlined icon font included

### Dark Mode
- Class-based dark mode (`darkMode: "class"`)
- Full dark mode support matching landing page patterns

### Claude's Discretion
- React project bootstrapping approach (Vite, CRA, etc.)
- Component structure for sample elements
- How to organize Tailwind config and base styles in the React project

</decisions>

<specifics>
## Specific Ideas

- The landing page HTML (`landing/code.html`) is the definitive design reference — all values, patterns, and visual effects should be extracted directly from it
- Selection color: `selection:bg-primary selection:text-white`
- Body base: `antialiased overflow-x-hidden`
- Shadow patterns vary by element: `4px`, `8px`, `10px` offsets used contextually
- Hover interactions: `hover:translate-x-1 hover:translate-y-1 hover:shadow-none` for button press effect
- Rotation transforms on interactive elements: `-1deg` to `6deg` range, with `hover:rotate-0` on some elements

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-foundation*
*Context gathered: 2026-02-24*
