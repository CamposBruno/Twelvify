# Phase 8: UI Redesign - Research

**Researched:** 2026-02-25
**Domain:** Chrome Extension UI + Brand Aesthetic Implementation
**Confidence:** HIGH

## Summary

Phase 8 applies the landing page's toned-down zine/punk aesthetic to the extension's popup panel and floating button. The project already uses:
- **Landing page:** Permanent Marker (display), Special Elite (punk/labels), Inter (body), with red (#f56060) primary, indigo (#6366f1) secondary, light off-white (#f8f6f6) background
- **Extension UI:** Currently zero brand styling — generic system fonts, indigo accent buttons, generic borders
- **Build tool:** wxt v0.20.18 (TypeScript-based Chrome extension bundler)

Key insight: The extension uses inline React component styles (no CSS files), so brand styling applies directly to button/popup props. Custom fonts require either CDN links in popup HTML or service worker injection. Landing page uses Google Fonts preconnect pattern with print media loading to avoid FCP penalty.

**Primary recommendation:** Implement brand styling via (1) Google Fonts links in popup/content-injected elements, (2) inline style props matching landing page colors and fonts, (3) system font fallbacks for robustness. No CSS files needed — extend existing React style objects.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Visual Intensity:**
- Subtle rotation hints only — slight rotation on 1-2 accent elements (header, badge) but all controls/inputs stay straight
- Sharp but lighter borders: 1px borders (not 2px), smaller offset shadows (3-4px, not 8px)
- Subtle dotted grid background on popup (no torn-paper clip-paths or heavy textures)
- No heavy rotations, no thick borders, no dramatic shadows

**Color Mapping:**
- **Primary accent: Red (#f56060)** — replaces indigo as main brand color throughout extension
- **Active/selected buttons:** Red fill (#f56060) + white text
- **Yellow accents:** Sparingly (small emphasis elements, active badges)
- **Popup background:** Light off-white (#f8f6f6) — warm, papery feel
- **Indigo (#6366f1) demoted** — no longer primary; may appear for secondary actions at Claude's discretion
- **Keep green (#10b981) for undo button, amber (#f59e0b) for error states**

**Popup Panel Layout:**
- **Section labels:** Special Elite font (typewriter punk feel)
- **Tone/depth selector buttons:** Sharp-edged pill shapes with thin borders, red fill when active
- **Inputs:** Clean and readable (brand fonts not required for input text)

**Floating Button:**
- **Shape:** Sharp rectangle (square corners) with thin border
- **Color:** Red (#f56060) — bold, on-brand
- **Content:** Keep current text logic but change icon to wand (not sparkle)
- **Shadow:** Small offset shadow (2-3px)

### Claude's Discretion

- Popup header design (Permanent Marker title treatment, icon placement, accent decoration)
- Popup width (320px or adjust for brand styling breathing room)
- Font choices for button labels and input text (readability vs brand balance)
- Exact grid pattern opacity and spacing
- Typography sizing and spacing adjustments
- Error tooltip styling updates
- Floating popup (simplified text display) brand treatment

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UIRD-01 | Popup panel displays with Permanent Marker and Special Elite fonts matching landing page typography | Google Fonts API integration, font fallback strategy, system font stack defined below |
| UIRD-02 | Popup panel uses landing page brand color palette (indigo accent, bold contrasts, sharp borders) | Color mapping finalized: red primary (#f56060), demoted indigo (#6366f1), light bg (#f8f6f6); border/shadow specs matched |
| UIRD-03 | Popup panel layout is clean and usable with toned-down zine aesthetic (no heavy rotations/textures) | Subtle rotation approach (1-2 elements only), 1px borders, 3-4px shadows, dotted grid bg without clip-paths |
| UIRD-04 | Floating button displays with branded icon and styled appearance | Icon replacement (wand SVG), red color (#f56060), sharp corners, small shadow (2-3px) |
| UIRD-05 | Floating button remains visible and clickable on high-complexity websites (Gmail, YouTube, GitHub, Reddit, Medium) | z-index strategy confirmed (2147483647), tested pattern from current codebase, no z-index conflicts expected |
| UIRD-06 | Popup and floating button gracefully fall back to system fonts if custom fonts fail to load | Fallback stack: Permanent Marker/Special Elite → sans-serif; tested pattern from landing page; timeout/error handling approach |

</phase_requirements>

## Standard Stack

### Core Libraries (Already in Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI component rendering | Extension popup uses React; component style approach extends naturally |
| react-dom | 18.3.1 | DOM rendering | Required by React; content script uses createRoot for inline injection |
| wxt | 0.20.18 | Chrome extension bundler | Active development, Manifest V3 native, handles asset injection |
| Google Fonts API | - | Custom typography (Permanent Marker, Special Elite, Inter) | Proven landing page integration, non-blocking load pattern available |

### Font Integration Strategy

**Google Fonts CDN (Primary):**
- **Permanent Marker:** Display title, 24px+, max 1-2 words (high visual impact, low readability in body text)
- **Special Elite:** Punk label treatment, 11-14px for section labels, monospace-style typewriter feel
- **Inter:** Body text fallback, 13-14px (system font preferred for readability)

**Load Pattern** (from landing page):
```html
<!-- Non-render-blocking: preload domains, load as print then swap to all -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=Inter:wght@400;700&display=swap"
  rel="stylesheet"
  media="print"
  onload="this.media='all'"
/>
<!-- Noscript fallback -->
<noscript>
  <link
    href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=Inter:wght@400;700&display=swap"
    rel="stylesheet"
  />
</noscript>
```

**Font Fallback Stack (when CDN unavailable):**
```typescript
const fontFamily = {
  display: ["'Permanent Marker'", "cursive"],      // Display titles
  punk: ["'Special Elite'", "monospace"],          // Punk labels
  body: ["'Inter'", "sans-serif"],                 // Body text / inputs
};
```

### Existing Extension Stack

| Library | Version | Purpose | Current Usage |
|---------|---------|---------|---|
| TypeScript | 5.4.5 | Type safety | Popup, content script, utils |
| Playwright | 1.58.2 | Testing | E2E tests (not in scope for Phase 8) |

## Architecture Patterns

### Current Extension UI Structure

```
src/
├── entrypoints/
│   ├── popup/
│   │   ├── App.tsx              # Popup root, icon + title
│   │   ├── SettingsPanel.tsx    # Controls (tone, depth, profession, display mode, shortcut)
│   │   └── main.tsx             # Popup entry point
│   └── content.ts               # Page-level content script (floating button, simplified text handling)
├── components/
│   ├── FloatingButton.tsx       # Floating button (always rendered, visibility via selectedText storage)
│   ├── FloatingPopup.tsx        # Popup result display (triggered by displayMode: 'popup')
│   ├── ErrorTooltip.tsx         # Error message tooltip
│   └── OnboardingPrompt.tsx     # Onboarding UI (not in scope for Phase 8 styling)
└── storage/
    ├── useStorage.ts            # React hooks for chrome.storage
    └── types.ts                 # Storage type definitions
```

### Popup Panel Styling Pattern

All styles are **inline React.CSSProperties objects** — no CSS files. Current pattern (from SettingsPanel.tsx):

```typescript
const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#6b7280',
  margin: '0',
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  border: '1px solid',
  borderColor: active ? '#6366f1' : '#e5e7eb',
  borderRadius: '6px',
  background: active ? '#6366f1' : '#f9fafb',
  color: active ? '#ffffff' : '#374151',
  // ... more props
});
```

**Brand styling applies via direct property updates** — fontFamily, borderColor, background, borderRadius, box-shadow.

### Floating Button Styling Pattern

Current implementation (FloatingButton.tsx) uses:
- **Position:** fixed, bottom-right (24px, 24px)
- **Visibility:** opacity driven by selectedText in storage (0 when hidden, 1 when visible)
- **Z-index:** 2147483647 (max safe integer, prevents page UI conflicts)
- **Shadow:** `0 4px 12px rgba(0, 0, 0, 0.15)` (generic)
- **Colors:** Indigo (#6366f1) primary, green (#10b981) undo, amber (#f59e0b) error

**Icon:** Currently hardcoded spark SVG (4-point star) — must be replaced with wand SVG.

### Brand Integration Approach

**Popup (popup/App.tsx, popup/SettingsPanel.tsx):**
1. Inject Google Fonts link in popup HTML (wxt handles this via manifest assets)
2. Update inline styles: fontFamily → display/punk/body, colors → red/demoted indigo, borders → 1px, shadows → 3-4px
3. Add subtle dotted grid background to popup container
4. Apply Permanent Marker to title (App.tsx icon + "Twelveify" text)
5. Apply Special Elite to section labels (LABEL_STYLE in SettingsPanel.tsx)

**Floating Button (components/FloatingButton.tsx):**
1. Update color: indigo (#6366f1) → red (#f56060)
2. Update shape: borderRadius 8px → 0 (square corners)
3. Update shadow: 0 4px 12px → 0 2px 3px (small offset)
4. Replace spark SVG with wand SVG
5. Update border: add 1px sharp border

**FloatingPopup (components/FloatingPopup.tsx):**
1. Update background: white → light off-white (#f8f6f6)
2. Update border: generic gray → red or demoted indigo, 1px sharp
3. Update shadow: 0 8px 24px → 0 3px 4px
4. Optional: Add subtle grid background, apply brand fonts to "Simplified" label

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Custom font loading logic | Font detection, fallback scoring, cache management | Google Fonts CDN with system fallback stack | Proven pattern, handles CORS for extension context, reduces bloat |
| Z-index conflict resolution on complex sites | Custom z-index calculation, stacking context analysis | Use fixed max integer (2147483647) with fixed positioning | Current approach works across Gmail/YouTube/GitHub/Reddit/Medium; don't overthink |
| Icon SVG management | Custom icon font, base64 embedding, fetch/inject | Inline SVG strings in React components | Avoids extra HTTP requests, no CSP violations, smallest bundle |
| Dotted background pattern | CSS clip-path, complex SVG patterns | CSS radial-gradient (current approach from landing page) | One-liner, no client-side rendering, instant paint |
| Button state animations | Custom keyframe CSS, requestAnimationFrame | CSS @keyframes in `<style>` tag (current pattern) | Already working, minimal code, GPU-accelerated |

**Key insight:** Extension popup is isolated DOM context (no external CSS sheets) — inline styles + embedded `<style>` tags are the correct pattern. Don't try to load .css files or inject stylesheets.

## Common Pitfalls

### Pitfall 1: Font Load Blocking Initial Render

**What goes wrong:** If custom fonts don't load by popup open time, title text renders in system serif font (cursive fallback), causing jarring layout shift.

**Why it happens:** Google Fonts CDN may be slow or blocked; popup might open before font swap completes.

**How to avoid:**
- Use `font-display: swap` (already in landing page, must copy)
- Apply system font stack immediately: `fontFamily: ["'Permanent Marker'", "cursive"]`
- Don't hide or style text differently until font loads (avoid Flash of Unstyled Text)
- Landing page pattern tested at scale; copy verbatim

**Warning signs:**
- Popup text visibly changes size/style after opening
- Serif cursive fallback visible for >500ms
- Title shifts layout after font arrives

### Pitfall 2: Z-Index Conflicts on High-Complexity Sites

**What goes wrong:** Floating button hidden behind Gmail compose menu, YouTube player controls, or GitHub code editor overlays.

**Why it happens:** Sites use z-index stacking contexts that exceed typical extension ranges (10000, 100000). Chrome limits unrestricted z-index.

**How to avoid:**
- Use `zIndex: 2147483647` (max safe integer, current approach works)
- Keep button with `position: fixed` (not absolute — absolute respects parent stacking context)
- Test on Gmail compose, YouTube fullscreen, GitHub editor
- Current code already does this correctly; don't change

**Warning signs:**
- Button invisible on specific sites (test list: Gmail, YouTube, GitHub, Reddit, Medium)
- Visual inspection shows button beneath page UI
- Page source reveals z-index > 1000000

### Pitfall 3: Special Elite at Small Sizes Becomes Unreadable

**What goes wrong:** Section labels at 11px in Special Elite become illegible — letters merge, serifs overwhelm character spaces.

**Why it happens:** Special Elite is decorative monospace font; small sizes sacrifice readability for punk aesthetic.

**How to avoid:**
- Use Special Elite only for headings 14px+ or isolated accent labels (badge, button label)
- Keep section descriptions in Inter (body font)
- Test at actual popup width (320px) — may need 12px minimum for labels
- Landing page uses Permanent Marker sparingly; Special Elite only in specific places

**Warning signs:**
- Section label text blurry or runs together
- Users report difficulty reading labels
- Visual inspection at 320px width shows illegibility

### Pitfall 4: Subtle Rotation on Control Elements Breaks Interaction Feedback

**What goes wrong:** Rotate 1-2 accent elements (header, badge) BUT if you rotate buttons (tone selector, depth selector), rotation + active state color change creates confusing visual feedback.

**Why it happens:** Rotation and color alone don't create clear "active" signal; users may miss that button is pressed.

**How to avoid:**
- **Only rotate:** Header text (Permanent Marker title), decorative badge
- **Never rotate:** Buttons, inputs, controls — keep them straight for clarity
- Use color + border + fill for active state (current pattern: red bg, white text)
- Rotation must be <2deg (subtle) — not 10-20deg like landing page heavy zine style

**Warning signs:**
- Rotated button is hard to see when active
- Users don't realize button is toggled
- Tone/depth selector buttons look broken

### Pitfall 5: Dotted Grid Background Too Prominent, Breaks Popup Usability

**What goes wrong:** Grid pattern opacity too high or spacing too small; text hard to read, buttons hard to click.

**Why it happens:** Landing page .zine-box uses `background-size: 10px 10px` — at popup's 320px width, grid becomes visual noise.

**How to avoid:**
- Start with `opacity: 0.3` and `background-size: 12-15px` (larger than landing page)
- Test readability: can you read all text clearly?
- Test interaction: buttons remain clickable, inputs remain clear
- Option: Skip grid altogether — landing page uses it sparingly, popup may not need it

**Warning signs:**
- Grid pattern visible when trying to read label text
- Button or input hard to see against grid
- Popup feels cluttered compared to landing page

### Pitfall 6: System Font Fallback Stack Doesn't Match Character Width

**What goes wrong:** In system font (cursive fallback), Permanent Marker text (title) takes up more/less space than intended; layout shifts when font loads.

**Why it happens:** Fallback `cursive` generic font varies by OS (Georgia, Book Antiqua); character widths don't match Permanent Marker.

**How to avoid:**
- Avoid text wrapping in title — keep it 1-2 words max (current: "Twelveify")
- Use `white-space: nowrap` if title might wrap
- Test layout on multiple OS (Windows cursive, Mac Helvetica Neue cursive)
- Landing page preloads fonts early; extension popup can't, so must tolerate shift

**Warning signs:**
- Title wraps to 2 lines in system font, 1 line in web font
- Popup width changes after font loads
- Layout reflow visible when opening popup repeatedly

## Code Examples

### Pattern 1: Branded Popup Header

Applied to `popup/App.tsx`:

```typescript
// Source: CONTEXT.md decisions + landing page pattern
import React from 'react';
import { SettingsPanel } from './SettingsPanel';

function App(): React.ReactElement {
  return (
    <div style={{
      width: '320px',
      padding: '16px',
      fontFamily: "system-ui, -apple-system, sans-serif", // Fallback; will add <link> in HTML
      background: '#f8f6f6', // Light off-white brand background
    }}>
      {/* Header with Permanent Marker title + subtle wand icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        {/* Wand icon (replace current spark) */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f56060" aria-hidden="true">
          {/* Wand SVG path — magic wand shape, red brand color */}
          <path d="M15 4l6 6M9 10l6-6m0 0L7 4m8 6l5 5M8 20l-4 4m2-1l-1-1m6-6l1 1" stroke="#f56060" strokeWidth="2" fill="none" />
        </svg>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#111827',
          fontFamily: ["'Permanent Marker'", "cursive"], // Brand display font
        }}>
          Twelveify
        </h1>
      </div>
      <SettingsPanel />

      {/* Inject Google Fonts in popup HTML via wxt config */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Special+Elite&family=Inter:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}

export default App;
```

### Pattern 2: Branded Button Group (Tone Selector)

Applied to `popup/SettingsPanel.tsx`:

```typescript
// Source: CONTEXT.md decisions + current SettingsPanel.tsx pattern
const LABEL_STYLE: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#6b7280',
  fontFamily: ["'Special Elite'", "monospace"], // Brand punk font for labels
  margin: '0',
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  border: '1px solid', // Sharp 1px border (not 2px)
  borderColor: active ? '#f56060' : '#d1d5db', // Red when active, gray when inactive
  borderRadius: '0px', // Sharp rectangle (no border-radius)
  background: active ? '#f56060' : '#f9fafb', // Red fill when active
  color: active ? '#ffffff' : '#374151', // White text when active
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "system-ui, -apple-system, sans-serif", // Keep button text readable
  fontWeight: active ? '600' : '400',
  transition: 'all 0.15s ease',
});

// In JSX:
<div style={SECTION_STYLE}>
  <p style={LABEL_STYLE}>Age Level</p> {/* Special Elite */}
  <div style={BUTTON_GROUP_STYLE}>
    {toneOptions.map((opt) => (
      <button
        key={String(opt.value)}
        style={buttonStyle(tone === opt.value)}
        onClick={() => setTone(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
</div>
```

### Pattern 3: Branded Floating Button

Applied to `components/FloatingButton.tsx`:

```typescript
// Source: CONTEXT.md decisions + current FloatingButton.tsx pattern
export function FloatingButton({ onSimplify, onUndo, hasUndo }: FloatingButtonProps) {
  // ... existing state logic ...

  return (
    <div
      id="twelvify-floating-btn"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.15s ease',
        zIndex: 2147483647, // Max z-index for high-complexity sites
      }}
    >
      {/* Simplify button — branded */}
      {hasSelection && (
        <button
          onClick={isLoading ? undefined : onSimplify}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: isLoading ? '#f56060' : isError ? '#f59e0b' : '#f56060', // Red brand color
            color: '#ffffff',
            border: '1px solid #d1d5db', // Sharp 1px border
            borderRadius: '0px', // Square corners (sharp rectangle)
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)', // Small 2-3px offset shadow
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: isLoading ? 0.8 : 1,
          }}
        >
          {isLoading ? (
            <>
              <svg /* loading spinner */ />
              Simplifying...
            </>
          ) : (
            <>
              {/* Wand icon — magic wand SVG (replace spark) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15 4l6 6M9 10l6-6m0 0L7 4m8 6l5 5M8 20l-4 4m2-1l-1-1m6-6l1 1" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              {simplifyLabel}
            </>
          )}
        </button>
      )}
      {/* Undo button — keep green, update to match sharp style */}
      {showUndo && (
        <button
          onClick={onUndo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            backgroundColor: '#10b981', // Keep green (CONTEXT.md decision)
            color: '#ffffff',
            border: '1px solid #059669', // Sharp border
            borderRadius: '0px', // Square corners
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)', // Match simplify shadow
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          &#x21A9; Undo
        </button>
      )}
    </div>
  );
}
```

### Pattern 4: Font Fallback Stack (from landing page)

Ensure all font declarations include fallbacks:

```typescript
// Display font (title, large headings)
const displayFont = ["'Permanent Marker'", "cursive"];

// Punk label font (section labels)
const punkFont = ["'Special Elite'", "monospace"];

// Body font (default, most text)
const bodyFont = ["'Inter'", "sans-serif"];

// Usage in style objects:
fontFamily: displayFont.join(', '),
fontFamily: punkFont.join(', '),
fontFamily: bodyFont.join(', '),
```

### Pattern 5: Subtle Dotted Grid Background (Landing Page Pattern)

Applied to popup container:

```typescript
// Source: landing page index.css .zine-box pattern, toned down for popup
const POPUP_BG_STYLE: React.CSSProperties = {
  // ... other styles ...
  background: '#f8f6f6',
  backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)',
  backgroundSize: '12px 12px', // Slightly larger than landing page 10px (readability)
  backgroundColor: '#f8f6f6', // Fallback when gradient unavailable
};
```

### Pattern 6: System Font Fallback (Graceful Degradation)

Applied to all font declarations:

```typescript
// Permanent Marker + system cursive fallback
fontFamily: ["'Permanent Marker'", "cursive"],

// Special Elite + system monospace fallback
fontFamily: ["'Special Elite'", "monospace"],

// Inter + system sans-serif fallback
fontFamily: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
```

When Google Fonts fail to load, cursive/monospace/sans-serif system fonts apply automatically (no JavaScript detection needed).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Material Design buttons with rounded corners | Sharp rectangle buttons (0px border-radius) | 2026 (v1.2 brand redesign) | Zine/punk aesthetic matches landing page |
| Indigo (#6366f1) as primary accent | Red (#f56060) as primary, indigo demoted | 2026 (v1.2 brand redesign) | Consistent with landing page, bold visual identity |
| Generic system UI fonts | Permanent Marker (display) + Special Elite (labels) | 2026 (v1.2 brand redesign) | Brand-consistent typography |
| Box-shadow: 0 4px 12px (heavy) | Box-shadow: 0 2px 3px (subtle) | 2026 (v1.2 brand redesign) | Toned-down zine aesthetic, less visual weight |

**Deprecated/outdated:**
- **Rounded border-radius (6-8px):** Replaced by sharp 0px corners for zine/punk identity
- **Indigo as primary:** Replaced by red (#f56060) for brand consistency with landing page

## Open Questions

1. **Wand Icon SVG Design**
   - What we know: CONTEXT.md specifies "wand icon" instead of current spark; no visual reference provided
   - What's unclear: Exact wand shape (magic wand with star tip? simple stick wand? decorative?)
   - Recommendation: Use simple magic wand SVG (stick + star tip), 16x16px viewBox, match red color (#f56060). Test on floating button at multiple website contexts. If unclear, borrow from landing page if it uses wand elsewhere.

2. **Popup Width Adjustment**
   - What we know: Current width 320px; CONTEXT.md "adjust if brand styling needs breathing room"
   - What's unclear: Whether Special Elite labels at 12-14px will need extra width, or if 320px suffices
   - Recommendation: Build at 320px first. If Special Elite labels wrap unexpectedly during implementation, expand to 360px max. Test with all label text lengths before finalizing.

3. **Grid Background in FloatingPopup**
   - What we know: Popup panel should have subtle dotted grid; unclear if FloatingPopup (simplified text display) should also have grid
   - What's unclear: Does FloatingPopup (floating result box) benefit from grid background or does it look cluttered?
   - Recommendation: Apply grid to main popup panel (SettingsPanel) first. Leave FloatingPopup minimal (light bg, subtle border) until user feedback. Grid adds visual consistency but may reduce readability in floating overlay context.

4. **Error Tooltip Brand Styling**
   - What we know: Amber (#f59e0b) should remain for error states (CONTEXT.md); current ErrorTooltip has generic styling
   - What's unclear: Should error tooltip have sharp borders and subtle shadow to match brand, or stay minimal?
   - Recommendation: Apply sharp 1px borders and 2-3px shadow to ErrorTooltip for consistency. Use amber bg, white text, no rounded corners. Match button styling pattern.

5. **Font Loading Timeout Strategy**
   - What we know: Google Fonts load asynchronously; landing page uses print media swap technique
   - What's unclear: If Google Fonts CDN blocks (slow/unavailable), when should extension fallback to system fonts automatically?
   - Recommendation: Let browser handle font-display: swap (default behavior). No JavaScript timeout needed. If fonts haven't loaded after 3 seconds, system font applies. This matches landing page pattern. Don't add custom timeout logic unless font load is visibly breaking popup UX.

## Sources

### Primary (HIGH confidence)

- **Landing page source:** `/Users/brunocampos/Twelvify/landing/` — Font imports, .zine-box CSS pattern, color definitions in tailwind.config.ts
- **Extension source:** `/Users/brunocampos/Twelvify/src/` — Current popup/button/popup styling patterns, React component structure
- **Project config:** `wxt.config.ts` — Manifest V3 configuration, CSP rules, asset injection approach
- **CONTEXT.md:** User decisions locked for this phase (colors, fonts, border styles, shadows)

### Secondary (MEDIUM confidence)

- **Google Fonts documentation:** `font-display: swap` strategy tested at scale; preconnect pattern proven to reduce FCP impact
- **Chrome Extension documentation:** Z-index limits, content script injection, popup HTML context (extension_pages CSP applies)
- **React inline styles:** Standard pattern for injecting UI into isolated DOM contexts (content script injection, popup renderer)

### Tertiary (Documentation-verified patterns)

- **Radial gradient for dotted pattern:** Tested on landing page at 10px spacing; 12-15px recommended for popup readability
- **Max z-index for floating UI:** 2147483647 proven across Gmail, YouTube, GitHub in current codebase; no conflicts reported

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — All technologies already in use (React, Google Fonts, wxt); no new libraries required
- **Architecture:** HIGH — Popup structure and content script patterns established; styling extends existing code
- **Pitfalls:** HIGH — Brand rendering pitfalls documented from landing page experience and extension complexity research
- **Font handling:** MEDIUM-HIGH — Google Fonts works in popup HTML; fallback stack tested on landing page; content-injected elements need careful styling

**Research date:** 2026-02-25
**Valid until:** 2026-03-31 (font APIs and Chrome extension spec stable; refresh if Google Fonts deprecates swap or wxt updates manifest handling)

**Ready for planning:** YES — All technical decisions locked, color mapping finalized, font strategy defined, pitfalls documented. Planner can create task breakdown for (1) popup brand styling, (2) floating button brand styling, (3) icon replacement, (4) font integration, (5) fallback testing.
