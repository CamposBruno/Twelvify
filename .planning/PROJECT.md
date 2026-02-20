# Twelveify

## What This Is

A Chrome extension that rewrites complex or technical text into clear, plain language tailored to each user's preferences. Users highlight text on any webpage, click a floating icon, and the selected text is replaced with a simplified version — personalized by tone, depth, and the user's background so explanations feel natural and relatable.

## Core Value

When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Text simplification via AI when user highlights and clicks
- [ ] Replace-in-page as default display mode (popup/side panel configurable)
- [ ] Progressive onboarding — ask preferences gradually over first few uses
- [ ] Personalization based on tone (casual, direct, supportive), sentence length, explanation depth
- [ ] Profession/interest-based analogies (e.g., finance explained via sports)
- [ ] Click-to-define difficult words with inline tooltip
- [ ] Backend proxy server for AI calls (user never manages API keys)
- [ ] Free beta — no payment for MVP
- [ ] Privacy-first: no content stored server-side, anonymous usage analytics only
- [ ] Rate limiting on backend (usage counts, no text retention)

### Out of Scope

- Multiple explanation modes (academic, ELI5, etc.) — MVP is simplification only
- OAuth / user accounts — not needed for free beta
- Mobile app — Chrome extension only
- Offline mode — requires AI backend
- Payment / subscription system — free beta first
- Browser support beyond Chrome — Chrome-first

## Context

- No product code exists yet — greenfield build on top of GSD framework and Chrome Extension development skill
- Chrome Extension Manifest V3 is the target platform
- AI provider not yet decided — will be determined during research (OpenAI, Anthropic, or similar)
- Backend serves as a thin AI proxy: receives text + user preferences, returns rewrite, logs nothing content-related
- Progressive onboarding means the extension works immediately with sensible defaults, then refines over first few uses
- Target audience is broad: non-technical readers, students, ESL speakers, anyone facing jargon-heavy content
- "Done" for MVP = highlight text on a real webpage, click icon, see rewritten text in place

## Constraints

- **Platform**: Chrome Extension Manifest V3 — must follow Chrome Web Store policies
- **Privacy**: Zero content logging on backend; anonymous analytics only (usage counts, feature adoption)
- **AI Dependency**: All rewrites require network + AI API call; no local inference
- **Cost**: Free beta means backend costs are absorbed; need efficient API usage (consider cheaper models for simple rewrites)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace-in-page as default | Seamless reading experience; popup/panel as user option | — Pending |
| Progressive onboarding | Lower friction than wizard; learn preferences naturally | — Pending |
| Backend proxy (not BYOK) | Simpler UX, broader audience, control over costs/quality | — Pending |
| Free beta (no monetization) | Validate product-market fit before building payment | — Pending |
| Anonymous analytics only | Privacy-first positioning is a differentiator | — Pending |
| Backend stack TBD | Will decide during research — likely serverless for cost efficiency | — Pending |
| AI provider TBD | Will evaluate during research — quality vs cost tradeoff | — Pending |

---
*Last updated: 2026-02-20 after initialization*
