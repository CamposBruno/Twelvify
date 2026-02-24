# Requirements: Twelveify

**Defined:** 2026-02-20
**Core Value:** When a user highlights confusing text and clicks the icon, they get back a clear, personalized rewrite that makes sense to them — every time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Text Simplification

- [x] **SIMP-01**: User can highlight text on any webpage and see a floating action icon appear
- [x] **SIMP-02**: User can click the floating icon to trigger AI-powered text simplification
- [x] **SIMP-03**: User can use a keyboard shortcut (e.g., Ctrl+Shift+S) to simplify selected text
- [x] **SIMP-04**: User can revert rewritten text back to the original with one click

### Display

- [ ] **DISP-01**: Simplified text replaces the original text in-page by default
- [x] **DISP-02**: User can configure display to show simplified text in a floating popup instead
- [x] **DISP-03**: User sees a loading indicator while the AI processes their text

### Personalization

- [x] **PERS-01**: Extension works immediately with sensible defaults (no upfront setup required)
- [x] **PERS-02**: Extension progressively asks user about preferences over first few uses
- [x] **PERS-03**: User can set profession/interests so analogies feel relatable (e.g., finance explained via sports)
- [x] **PERS-04**: User preferences persist across browser sessions via chrome.storage.sync

### Backend & Infrastructure

- [x] **BACK-01**: Backend proxy server handles all AI API calls (user never sees API keys)
- [x] **BACK-02**: Backend implements rate limiting per anonymous user
- [x] **BACK-03**: Backend logs zero text content — only anonymous usage metrics (token counts, timestamps)
- [x] **BACK-04**: Extension communicates with backend via HTTPS with request validation

### Error Handling

- [x] **ERRH-01**: User sees a friendly message when offline (not a silent failure)
- [x] **ERRH-02**: User sees a message when rate limit is reached with reset timing
- [x] **ERRH-03**: User sees a message when API request times out, with option to retry
- [x] **ERRH-04**: User sees a message when text is too long (>5000 chars) with guidance

### Extension Foundation

- [x] **EXTF-01**: Chrome Extension uses Manifest V3 with proper CSP configuration
- [x] **EXTF-02**: Service worker manages state via chrome.storage (not global variables)
- [x] **EXTF-03**: Content script properly handles text selection across diverse page structures
- [x] **EXTF-04**: Extension follows Chrome Web Store policies and is submittable

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Personalization (Enhanced)

- **PERS-05**: User can set tone preference (casual, direct, supportive)
- **PERS-06**: User can set explanation depth (simple, medium, detailed)
- **PERS-07**: User can control target sentence length

### Display (Enhanced)

- **DISP-04**: User can view simplified text in Chrome side panel
- **DISP-05**: Extension supports dark mode matching system preference

### Word Definitions

- **WORD-01**: User can click difficult words in rewritten text for inline tooltip definition
- **WORD-02**: Definitions are personalized to user's background

### Privacy & Polish

- **PRIV-01**: Clear in-extension privacy messaging explaining data handling
- **PRIV-02**: Readability metrics showing before/after reading level

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multiple simplification modes (ELI5, academic, etc.) | One well-tuned mode beats many mediocre ones; add later |
| User accounts / OAuth | No accounts needed for free beta; preferences stored locally |
| Summarization mode | Different cognitive task from simplification; separate product |
| Real-time on-hover simplification | Massive API cost spike; users want intentional simplification |
| PDF simplification | High complexity (OCR); defer until demand validated |
| Offline mode / local LLM | Requires 200MB+ model download; not feasible for MVP |
| Payment / subscription | Validate product-market fit before monetization |
| Browser support beyond Chrome | Chrome-first; Firefox only if demand exists |
| Mobile app | Chrome extension only |
| Save/sync simplifications across devices | Requires user accounts; contradicts "no login" goal |
| Learning integration (flashcards, quizzes) | Rewordify's moat; don't compete here in v1 |
| Always-on background simplification | Privacy nightmare + cost explosion |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SIMP-01 | Phase 1 | Complete |
| SIMP-02 | Phase 2 | Complete |
| SIMP-03 | Phase 3 | Complete |
| SIMP-04 | Phase 3 | Complete |
| DISP-01 | Phase 3 | Pending |
| DISP-02 | Phase 3 | Complete |
| DISP-03 | Phase 1 | Complete |
| PERS-01 | Phase 3 | Complete |
| PERS-02 | Phase 3 | Complete |
| PERS-03 | Phase 3 | Complete |
| PERS-04 | Phase 3 | Complete |
| BACK-01 | Phase 2 | Complete |
| BACK-02 | Phase 2 | Complete |
| BACK-03 | Phase 2 | Complete |
| BACK-04 | Phase 2 | Complete |
| ERRH-01 | Phase 2 | Complete |
| ERRH-02 | Phase 2 | Complete |
| ERRH-03 | Phase 2 | Complete |
| ERRH-04 | Phase 2 | Complete |
| EXTF-01 | Phase 1 | Complete |
| EXTF-02 | Phase 1 | Complete |
| EXTF-03 | Phase 1 | Complete |
| EXTF-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23 ✓
- Unmapped: 0

---

*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after roadmap creation*
