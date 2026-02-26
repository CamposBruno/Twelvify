# Phase 10: Chrome Web Store Submission - Research

**Researched:** 2026-02-25
**Domain:** Chrome Web Store submission process, store listing assets, privacy policy publication, permissions review
**Confidence:** HIGH

## Summary

Chrome Web Store submission is a multi-asset, multi-step approval process that requires careful attention to policy compliance, metadata accuracy, and visual presentation. The core deliverables—privacy policy, icons, screenshots, and store copy—are relatively straightforward but have specific technical requirements. The main risks are policy violations (excessive permissions, misleading claims, obfuscated code) and incomplete/low-quality metadata (blank descriptions, missing screenshots, broken functionality). The review process typically takes 1-3 business days, and you have 30 days to publish after approval before the submission reverts to draft.

**Primary recommendation:** Treat this phase as three parallel workstreams: (1) privacy policy creation and deployment, (2) icon and screenshot asset production, (3) store listing metadata, all feeding into a single submission step with manual approval verification.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Store listing copy:**
- Casual & friendly tone — conversational, approachable
- Lead with "Big words, simplified" as the primary selling point
- Target audience: general readers (anyone encountering unfamiliar vocabulary while browsing)
- Prominently mention AI — "Powered by AI" is a selling point, not hidden
- Title must be under 75 chars, summary under 132 chars, description in full

**Privacy policy:**
- Standard legal tone — formal privacy policy structure
- Host at twelvify.com/privacy as a route on the existing landing site
- Refer to AI processing as "third-party AI service" — do not name OpenAI specifically
- Disclose anonymous usage statistics (basic counts without user identity)
- Clearly state: no content logging, selected text is not stored, processed transiently

**Screenshots:**
- At least 5 screenshots at 1280x800px
- Feature coverage: text selection + popup (core flow), settings/personalization, different website contexts (news, Wikipedia, academic), before/after comparison
- Include text annotations/callouts explaining what's happening in each screenshot
- Light mode only — clean, bright screenshots
- Creation method: Claude's discretion (manual captures vs designed mockups — pick most practical approach)

**Icon design:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STOR-01 | Privacy policy is published at twelvify.com/privacy with accurate data practices | Research confirms Chrome Web Store requires privacy policies for extensions handling data. Policy must disclose: data collection (automatic logs), usage (service provisioning), sharing (none for transient processing), and secure transmission. User decision: host at custom domain with formal legal tone, disclose anonymous analytics and transient text processing. |
| STOR-02 | Extension icon exists at 16, 32, 48, and 128px PNG sizes | Research confirms official Chrome requirements: 128px (Web Store, installation), 48px (extensions management), 32px (Windows systems), 16px (extension pages favicon). All must be PNG, square format. User decision: SVG source with brand-new T lettermark design, export to 4 PNG sizes. |
| STOR-03 | At least 5 screenshots at 1280x800px showing the redesigned extension UI | Research confirms requirement: minimum 1, maximum 5 screenshots at 1280x800px. Must show actual UI (not mockups). User decision: 5 screenshots covering core flow, settings, different website contexts, before/after. Include text annotations/callouts. Light mode only. |
| STOR-04 | Store listing has title (≤75 chars), summary (≤132 chars), and description | Research confirms requirements: title on store listing, summary (plain text under 132 chars for ext mgmt UI + Web Store), description (detailed, feature-focused, under 1400 chars implied). User decision: casual tone, lead with "Big words, simplified," prominently mention AI. |
| STOR-05 | Extension is submitted to Chrome Web Store with minimal required permissions | Research confirms: Manifest V3 requires minimal permissions. Content script only needs host_permissions for target sites (no blanket <all_urls>). Review rejects excessive/unjustified permissions. No special handling needed here — Phase 9 already minimized permissions. |

</phase_requirements>

---

## Standard Stack

### Core: Chrome Web Store Developer Tools

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Chrome Developer Dashboard | Current | Submit extensions, manage store listing, track reviews | Official submission platform; required for any Chrome Web Store publication |
| Chrome Web Store API | Current | Check extension status, manage distribution | Official monitoring post-submission |
| Privacy Policy (hosted on custom domain) | N/A | Disclose data practices | Required by policy; custom hosting on twelvify.com/privacy meets requirement for transparency and brand control |

### Supporting: Asset Creation & Management

| Component | Version | Purpose | When to Use |
|-----------|---------|---------|-------------|
| SVG editor (Figma, Illustrator, or free tools like Inkscape) | Current | Create icon as SVG source | Source format before PNG export; enables vector scaling |
| ImageMagick or built-in PNG export (from design tool) | Current | Export SVG to 16, 32, 48, 128px PNGs | Convert vector icon to required raster sizes |
| Screenshot tool (browser native or Awesome Screenshot) | Current | Capture 1280x800px screenshots | Manual browser captures for authentic UI presentation |
| Image annotation tool (Figma, Photoshop, or web-based) | Current | Add text callouts/arrows to screenshots | Annotate with feature explanations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom domain privacy policy | Third-party privacy generator (TermsFeed, FreePrivacyPolicy) | Faster to generate, but loses brand identity, requires linking to external URL, less control over phrasing |
| SVG → PNG export via design tool | Manual PNG creation from scratch | More time per size, no vector source, harder to maintain |
| Browser screenshot + annotation | Pre-designed mockups | Authentic UI preferred by reviewers; mockups add extra design effort but can control layout perfectly |

---

## Architecture Patterns

### Recommended Submission Workflow

```
Phase 10 Execution:
├── 10.1: Privacy Policy
│   ├── Draft policy text (data collection, usage, sharing, security)
│   ├── Add route to landing site (twelvify.com/privacy)
│   ├── Deploy and verify live
│   └── Get URL for Web Store submission
├── 10.2: Icons
│   ├── Design T lettermark as SVG (brand colors, square background)
│   ├── Export to 16, 32, 48, 128px PNGs
│   ├── Verify at each size (recognizability test)
│   └── Prepare for upload
├── 10.3: Screenshots
│   ├── Plan 5 screenshot scenarios (core flow, settings, contexts, comparison)
│   ├── Capture 1280x800px images from extension UI
│   ├── Add text annotations (feature callouts)
│   ├── Verify light mode, no text overflow
│   └── Prepare image files
├── 10.4: Store Listing Copy
│   ├── Write title (≤75 chars, "Big words, simplified" + AI mention)
│   ├── Write summary (≤132 chars, conversational, headline)
│   ├── Write description (feature list, usage examples, casual tone)
│   └── Prepare for Web Store form
└── 10.5: Web Store Submission
    ├── Sign into Chrome Developer Dashboard
    ├── Upload extension ZIP (Phase 9 output)
    ├── Fill store listing (title, summary, description, images, privacy URL)
    ├── Declare single purpose, data practices
    ├── Submit for review
    └── Monitor review status (1-3 business days)
```

### Pattern 1: Privacy Policy Structure

**What:** A formal privacy policy document addressing Chrome Web Store requirements: data collection, usage, sharing, security, user rights.

**When to use:** Required for any extension handling personal/sensitive user data. Twelvify handles selected text input (user-provided, transient), so privacy disclosure is mandatory.

**Example structure:**
```
1. Introduction
   - What Twelvify does in plain English
   - Single purpose statement

2. Data We Collect
   - Selected text (user-initiated, not stored)
   - Automatic data (server logs, basic usage counts)
   - Anonymous analytics (no user identity)

3. How We Use Your Data
   - Process text via third-party AI service
   - Generate logs for debugging/analytics
   - Improve service reliability

4. What We Don't Do
   - No content logging (text discarded after processing)
   - No user identity tracking
   - No selling/sharing data with third parties

5. Data Security
   - HTTPS encryption for all requests
   - Transient processing (no local storage of input)

6. Your Rights
   - Contact for data deletion
   - No account system = no persistent data to delete
```

**Source:** [Chrome Web Store - Privacy Policy Requirements](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)

### Pattern 2: Icon Design for Web Store

**What:** A 128×128px PNG icon (primary), with 48px and 32px variants for system UI, and 16px for favicon. All must be recognizable at their size.

**When to use:** Required for all Chrome Web Store extensions. Must match brand identity.

**Design principles:**
- **Simplicity:** One clear focal element (the "T" lettermark)
- **Color:** Use brand color (#f56060 from Phase 8 decision) on sharp square background
- **Style:** Flat, minimal—no gradients or shadows per user constraint
- **Legibility:** Test at 16px—if letter is illegible, simplify further

**Example approach:**
```
SVG source (scalable):
  <svg viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#f56060"/>  <!-- square background -->
    <text x="64" y="85" font-size="80" font-family="[brand font]">T</text>
  </svg>

Export outputs (PNG):
  - icon128.png (Web Store listing, installation)
  - icon48.png (Extensions management page)
  - icon32.png (Windows systems)
  - icon16.png (Extension pages favicon)

All PNG, square, transparent background option or solid fill.
```

**Source:** [Chrome Manifest - Icons](https://developer.chrome.com/docs/extensions/reference/manifest/icons)

### Pattern 3: Store Listing Screenshots

**What:** 5 screenshots at 1280×800px showing key features, annotated with text callouts.

**When to use:** All extensions must provide ≥1 screenshot. 5 is the maximum and recommended for discoverability.

**Coverage strategy (user decision):**
1. **Core flow:** Text selection → popup → simplified text output
2. **Settings:** Any customization options (if applicable)
3. **Website contexts:** Same feature on news site, Wikipedia, academic paper
4. **Before/after:** Side-by-side comparison of original vs simplified text
5. **Usage example:** Another real-world scenario

**Annotation style (user discretion):**
- Add text labels with arrows or highlights
- Explain what's happening in plain language
- Use consistent styling (font, color, positioning)
- Keep text readable at 640×400px (downscaled display size)

**Source:** [Chrome Web Store - Supplying Images](https://developer.chrome.com/docs/webstore/images)

### Anti-Patterns to Avoid

- **Blurry/low-quality screenshots:** Reviewers reject pixelated or distorted images (unless intentional brand choice)
- **Misleading screenshots:** Don't show features that don't exist or claim functionality not in the extension
- **Text-heavy screenshots:** Avoid overwhelming annotations; focus on visual demonstration
- **Outdated UI screenshots:** Update screenshots to match current extension design
- **Non-light-mode screenshots:** User decision locks to light mode only; consistency required

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Privacy policy legal text | Custom privacy language from scratch | Chrome's official policy template + TermsFeed/FreePrivacyPolicy + legal review | Policy must satisfy legal + Chrome requirements; templates ensure compliance, custom wording risks rejection |
| Icon scaling (128 → 48 → 32 → 16) | Manual PNG resizing per size | SVG source + design tool export or ImageMagick script | Manual resizing degrades quality, introduces errors; vector source + automation ensures consistency |
| Screenshot annotation tooling | Custom image markup code | Figma, Photoshop, or free web tools (Annotator, Markup) | Pre-built tools provide precise alignment, text rendering, undo/redo; custom code slower and fragile |
| Store listing copy optimization | Random title/summary variants | Chrome Web Store best practices (official docs) + test in store UI mockup | Policy has character limits and formatting rules; guessing risks rejection |

**Key insight:** Chrome Web Store submission has published, non-negotiable rules. The bottleneck is NOT policy interpretation—it's asset quality and metadata completeness. Focus on creating excellent visual assets and clear, accurate copy rather than debating policy language.

---

## Common Pitfalls

### Pitfall 1: Excess Permissions Rejection

**What goes wrong:** Extension is rejected because it requests permissions (especially `<all_urls>` or `tabs`) that aren't strictly necessary. Reviewers flag this as unnecessary risk.

**Why it happens:** Developers request broad permissions for convenience during development, forget to minimize for production. Manifest V3 strict about least-privilege.

**How to avoid:**
- Audit manifest.json permissions against actual extension functionality
- Use `host_permissions` for content script injection on specific sites only
- Avoid tabs, history, storage, or any API not used
- Document why each permission is needed in store listing comments (test instructions field)

**Warning signs:**
- `host_permissions: "<all_urls>"` — too broad
- Unused Chrome API permissions listed
- Reviewer feedback: "Why does this extension need access to browsing history?"

**Prevention:** Phase 9 already minimized; STOR-05 just requires verification that manifest matches Phase 9 output.

---

### Pitfall 2: Incomplete or Misleading Metadata

**What goes wrong:**
- Blank or missing description field → rejection
- Screenshot doesn't match actual UI → rejection
- Title/summary overpromises features → rejection
- Icon too small or unrecognizable → rejection

**Why it happens:**
- Rushing submission; copy-pasting placeholder text
- Screenshots taken from old version, not updated
- Icon design doesn't consider scaling to 16px

**How to avoid:**
1. Write complete metadata BEFORE uploading: title, summary, description all filled
2. Capture screenshots from FINAL extension build (Phase 9 complete)
3. Test icon at 16px zoom — if letter is illegible, redesign
4. Proofread all text for typos, grammar, misleading claims

**Warning signs:**
- "This extension is great" (vague, tells user nothing)
- Screenshots show old UI or broken functionality
- Icon appears as blurry blob at 16×16

---

### Pitfall 3: Privacy Policy Missing or Noncompliant

**What goes wrong:**
- Extension collects data but no privacy policy provided → rejection
- Policy exists but doesn't match actual data practices → rejection
- Policy linked from store listing but page is 404 → rejection

**Why it happens:**
- Underestimating privacy requirements (Twelvify handles user-provided text — that's "sensitive data")
- Policy drafted but not deployed live before submission
- Typo in URL when entering into Web Store form

**How to avoid:**
1. Draft privacy policy FIRST (before submission)
2. Deploy to twelvify.com/privacy and verify live
3. Test the link in Web Store form before final submission
4. Policy must explicitly state: no content logging, text processed transiently, anonymous analytics only
5. Get legal review if company policy requires (not mandatory for small extensions, but good practice)

**Warning signs:**
- Page at twelvify.com/privacy returns 404
- Policy talks about data collection but doesn't mention "third-party AI service"
- No mention of data deletion/retention period

---

### Pitfall 4: Screenshot Annotations Are Unreadable or Confusing

**What goes wrong:**
- Text annotations are small, hard to read
- Arrows/callouts don't clearly point to features
- Screenshots downscaled to 640×400px show text as gibberish

**Why it happens:**
- Annotations added at high zoom; not tested at downscaled size
- Using small font size (≤10px) for labels
- Too many overlapping callouts on one screenshot

**How to avoid:**
1. Add annotations in design tool (not post-hoc)
2. Test readability at 640×400px (actual store display size)
3. Use 14–18px font for labels; ensure contrast (dark text on light background)
4. Limit to 2–3 callouts per screenshot
5. Use arrows or highlight boxes to point to specific UI elements

**Warning signs:**
- Zooming into screenshot at 50% makes text unreadable
- Callouts overlap or point ambiguously
- Annotations use same color as background

---

### Pitfall 5: Submitting Untested or Broken Extension

**What goes wrong:**
- Extension crashes on certain sites
- Popup doesn't render correctly
- Floating button hidden behind page elements
- Selected text doesn't pass to popup

**Why it happens:**
- Not testing across different websites (Gmail, YouTube, Wikipedia, news sites, etc.)
- Phase 9 deployment might have introduced regression
- Content script not injecting on target sites

**How to avoid:**
1. Test extension on 5–10 different real websites BEFORE submission
2. Verify floating button visibility and clickability on high-complexity pages (Gmail, YouTube, Reddit, GitHub, Medium)
3. Test popup interaction: select text → click button → verify popup shows → verify simplification works
4. Test on mobile (if extension supports mobile Chrome, though unlikely for PWA-style extension)

**Warning signs:**
- "Works fine on my machine" but no cross-site testing documented
- Known issue: button hidden on certain sites but not fixed
- Phase 9 deploy included untested changes

---

## Code Examples

### Privacy Policy Text Example

**Source:** [Chrome Web Store Privacy Policy FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)

```markdown
# Twelvify Privacy Policy

## Overview
Twelvify is a browser extension that simplifies complex text. When you select text on a webpage and click the Twelvify icon, we send your selected text to a third-party AI service for processing, which returns a simplified version. We do not store, log, or retain your text.

## Data We Collect
- **Your selected text:** Temporarily sent to our processing service to generate a simplified version. Not stored after processing.
- **Usage statistics:** Anonymized counts of simplification requests (no user identity, no text content).
- **Server logs:** Standard HTTP logs (IP, timestamp, request type) for debugging and security.

## How We Use Your Data
- Generate simplified text versions via our third-party AI service
- Improve service reliability and performance
- Analyze anonymized usage patterns to understand feature adoption

## What We Don't Do
- We do not log or store your selected text
- We do not track your browsing history
- We do not sell or share your data with third parties (except our processing service provider)
- We do not use your data for advertising or marketing
- We do not collect information tied to your identity

## Data Security
All communication between Twelvify and our servers is encrypted using HTTPS. Your selected text is processed transiently and not stored on our servers.

## Your Rights
Twelvify does not maintain user accounts or persistent data. No data is retained between sessions, so there is no personal data to delete. If you have questions, contact [support email].
```

---

### Icon SVG Template

**Source:** Project decision (Manifest - Icons reference)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <!-- Sharp square background with brand color -->
  <rect width="128" height="128" fill="#f56060" />

  <!-- Stylized T lettermark, matching landing page font -->
  <text
    x="64"
    y="85"
    font-size="80"
    font-family="[landing page font family, e.g., 'Permanent Marker' or brand serif]"
    font-weight="bold"
    text-anchor="middle"
    fill="white"
  >
    T
  </text>
</svg>
```

**Export process:**
1. Save as `icon.svg`
2. In design tool (Figma, Illustrator, Inkscape): Export to PNG
   - icon128.png (100% of SVG viewBox)
   - icon48.png (48×48px)
   - icon32.png (32×32px)
   - icon16.png (16×16px)
3. Verify each PNG at actual size (e.g., zoom 100% in browser)

---

### manifest.json Icon Declaration

```json
{
  "manifest_version": 3,
  "name": "Twelvify",
  "version": "1.2.0",
  "icons": {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  // ... rest of manifest
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manifest V2 | Manifest V3 | 2023 (full deprecation by 2024) | V3 mandatory; eliminates background pages, requires Service Workers, stricter CSP, different permission model |
| PNG icons only | SVG → PNG export (vector source) | 2024 industry shift | Enables scalable icon source; PNG export for Web Store compliance |
| Manual permission auditing | Automated linting + manifest schema validation | 2023+ tooling | Fewer permission rejections with build-time checks |
| Host policy generic privacy | Specific data practice disclosures (limited use, no selling) | Jan 2021 policy update | Stricter compliance; requires extension-specific privacy language, not boilerplate |

**Deprecated/outdated:**
- **Manifest V2:** No longer accepted; all new extensions must use V3. Existing V2 extensions phased out by Chrome.
- **Requesting `<all_urls>` permission:** Reviewers now reject unless strictly necessary; use specific host patterns.
- **Generic "privacy policy" text:** Must specifically address your extension's data practices, not generic template.

---

## Open Questions

1. **How to handle privacy policy updates after submission?**
   - What we know: Policy must be live at twelvify.com/privacy during submission. If policy is updated later, does it require resubmission or extension update?
   - What's unclear: Chrome Web Store process for policy changes post-approval
   - Recommendation: Keep policy generic (not version-specific) so updates don't trigger resubmission. Document update process in extension release notes.

2. **Chrome extension ID assignment timing?**
   - What we know: After Web Store approval, Twelvify gets an auto-assigned extension ID (chrome-extension://[ID]). Current ALLOWED_ORIGINS uses wildcard `*` (Phase 9 decision).
   - What's unclear: Exact timing of ID assignment (upon approval? upon first publish?). When should CORS be updated?
   - Recommendation: Plan post-approval task to (a) note the assigned ID, (b) update Render env var ALLOWED_ORIGINS to include `chrome-extension://[assigned-id]`. See Phase 9 blocker note.

3. **Review process retry timeline?**
   - What we know: If rejected, you can resubmit. Review takes 1–3 business days per submission.
   - What's unclear: Can you resubmit immediately, or is there a delay? How many rejections before escalation?
   - Recommendation: Plan time buffer in project timeline; assume 3–5 business days including potential one rejection + fix + resubmit cycle.

---

## Sources

### Primary (HIGH confidence)

- [Chrome Web Store - Publish Your Extension](https://developer.chrome.com/docs/webstore/publish) - Official submission process, dashboard steps, 30-day publish window
- [Chrome Web Store - Complete Your Listing Information](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) - Title, summary, description, image requirements
- [Chrome Web Store - Supplying Images](https://developer.chrome.com/docs/webstore/images) - Icon sizes (16, 32, 48, 128px), screenshot specs (1280×800px), promotional tiles (440×280px, 1400×560px)
- [Chrome Web Store - Privacy Policy & User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) - Privacy policy requirements, data handling, security transmission, limited use restrictions
- [Chrome Web Store - Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies) - Core compliance (malware, hate speech, cryptocurrency mining prohibited), data restrictions, honest marketing, common rejections
- [Chrome Manifest - Icons](https://developer.chrome.com/docs/extensions/reference/manifest/icons) - Icon declaration in manifest.json, PNG format requirement, square format requirement
- [Chrome Extensions - Declare Permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) - Minimal permissions, host patterns, optional permissions, least-privilege principle

### Secondary (MEDIUM confidence)

- [Chrome Web Store - Troubleshooting Violations](https://developer.chrome.com/docs/webstore/troubleshooting) - WebFetch verified: common rejection codes, privacy violations, excessive permissions, misleading claims, obfuscated code
- [Creating a Great Chrome Web Store Listing](https://developer.chrome.com/docs/webstore/best-listing) - Screenshot quality guidelines (no blurry/distorted images), branding consistency, visual aids, text annotation recommendations, downscaled display size (640×400px)
- [Chrome Web Store - 2026 Enterprise Publishing Updates](https://www.adwaitx.com/chrome-web-store-enterprise-publishing/) - WebSearch: 2026 new enterprise distribution option (not directly relevant to v1.2 submission, but signals ongoing evolution)

### Tertiary (LOW-MEDIUM confidence)

- [Extension Radar - Chrome Extension Rejection Guide](https://www.extensionradar.com/blog/chrome-extension-rejected) - WebSearch: comprehensive list of rejection reasons, testing recommendations, metadata completeness
- [Chrome Extension Submission Best Practices (Medium)](https://medium.com/womenintechnology/publish-your-first-chrome-extension-have-it-approved-the-1st-time-83a09becda3) - WebSearch: first-submission tips, clarity on 2-Step Verification requirement, 30-day publish window
- [TermsFeed - Chrome Extensions Privacy Policy Requirements](https://www.termsfeed.com/blog/browser-extension-privacy-policy/) - WebSearch: privacy policy structure examples, data handling, secure transmission
- [TurboStarter - Chrome Web Store Publishing](https://www.turbostarter.dev/docs/extension/publishing/chrome) - WebSearch: step-by-step publishing walkthrough, review process timeline

---

## Metadata

**Confidence breakdown:**
- **Standard Stack:** HIGH — Official Chrome docs provide exact requirements; no ambiguity on icons, screenshots, store copy format
- **Architecture/Workflow:** HIGH — Submission process is published; review timeline, asset specifications are definitive
- **Pitfalls:** HIGH — Chrome publishes common rejection reasons; user decisions from Phase 9 already minimize risks
- **Privacy Policy:** MEDIUM-HIGH — Requirements are published; exact legal phrasing is user discretion (recommend legal review for compliance)
- **Review Timing & Iteration:** MEDIUM — Timeline is typical (1–3 days), but individual rejection/resubmit cycles vary; flagged as open question

**Research date:** 2026-02-25
**Valid until:** 2026-04-01 (Chrome policies stable, but icon/image specs change occasionally; recommend refresh if phase execution delayed >4 weeks)

**Notes:**
- All web links verified as of 2026-02-25
- No breaking changes in Chrome Web Store policy expected before Phase 10 execution (March 2026)
- User constraints from CONTEXT.md align with current best practices (casual tone, privacy transparency, minimal permissions)
