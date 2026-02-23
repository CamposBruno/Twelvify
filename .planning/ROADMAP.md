# Roadmap: Twelveify

**Project:** Twelveify (AI-powered text simplification Chrome extension)
**Defined:** 2026-02-20
**Depth:** Quick (3 phases, aggressive grouping)
**Requirements Coverage:** 23/23 ✓

---

## Phases

- [ ] **Phase 1: Foundation & Text Selection** - Extension architecture, service worker, content script, floating button UI
- [ ] **Phase 2: Backend Integration & AI Simplification** - Cloudflare Workers proxy, AI integration, rate limiting, error handling
- [ ] **Phase 3: Personalization & UX Polish** - Progressive onboarding, tone/depth preferences, keyboard shortcuts, revert functionality

---

## Phase Details

### Phase 1: Foundation & Text Selection

**Goal:** Establish correct extension architecture with service worker state management and enable users to select text and trigger the simplification UI.

**Depends on:** Nothing (foundational)

**Requirements:**
- EXTF-01: Chrome Extension uses Manifest V3 with proper CSP configuration
- EXTF-02: Service worker manages state via chrome.storage (not global variables)
- EXTF-03: Content script properly handles text selection across diverse page structures
- EXTF-04: Extension follows Chrome Web Store policies and is submittable
- SIMP-01: User can highlight text on any webpage and see a floating action icon appear
- DISP-03: User sees a loading indicator while the AI processes their text

**Success Criteria** (what must be TRUE when this phase completes):
1. User can highlight any text on a webpage and a floating "Simplify" button appears within 200ms
2. Floating button is visible and clickable on diverse page structures (news sites, blogs, Twitter/LinkedIn, forum pages)
3. Service worker correctly persists state to chrome.storage.local across restarts and browser sessions
4. Extension loads without CSP errors; manifest.json properly lists backend domain in connect-src
5. Extension meets Chrome Web Store submission requirements (no dangerous permissions, proper privacy policy stub)

**Plans:** 2/3 plans executed

Plans:
- [ ] 01-01-PLAN.md — WXT scaffold + Manifest V3 with CSP and host_permissions
- [ ] 01-02-PLAN.md — Service worker with chrome.storage state persistence and message types
- [ ] 01-03-PLAN.md — Content script text selection + FloatingButton with Popover API

---

### Phase 2: Backend Integration & AI Simplification

**Goal:** Connect the extension to a backend AI proxy that simplifies text, implements rate limiting and cost controls, and provides graceful error handling.

**Depends on:** Phase 1

**Requirements:**
- SIMP-02: User can click the floating icon to trigger AI-powered text simplification
- BACK-01: Backend proxy server handles all AI API calls (user never sees API keys)
- BACK-02: Backend implements rate limiting per anonymous user
- BACK-03: Backend logs zero text content — only anonymous usage metrics (token counts, timestamps)
- BACK-04: Extension communicates with backend via HTTPS with request validation
- ERRH-01: User sees a friendly message when offline (not a silent failure)
- ERRH-02: User sees a message when rate limit is reached with reset timing
- ERRH-03: User sees a message when API request times out, with option to retry
- ERRH-04: User sees a message when text is too long (>5000 chars) with guidance

**Success Criteria** (what must be TRUE when this phase completes):
1. User can click the floating button and see selected text replaced with simplified version within 2-3 seconds
2. Simplified text accurately preserves original meaning and is appropriately simplified (verified via manual QA on 10+ sample texts)
3. Backend enforces rate limit (50 requests/hour soft limit in extension, 100 requests/hour hard limit on backend)
4. Extension shows friendly error messages for: offline, rate limit exceeded, timeout, text too long
5. Backend logs no text content; logs only track usage metadata (hashed user IDs, feature use, input length bins)

**Plans:** TBD

---

### Phase 3: Personalization & UX Polish

**Goal:** Deliver differentiated personalization features (progressive onboarding, tone/depth preferences) and complete user control (keyboard shortcuts, display modes, revert).

**Depends on:** Phase 2

**Requirements:**
- PERS-01: Extension works immediately with sensible defaults (no upfront setup required)
- PERS-02: Extension progressively asks user about preferences over first few uses
- PERS-03: User can set profession/interests so analogies feel relatable (e.g., finance explained via sports)
- PERS-04: User preferences persist across browser sessions via chrome.storage.sync
- SIMP-03: User can use a keyboard shortcut (e.g., Ctrl+Shift+S) to simplify selected text
- SIMP-04: User can revert rewritten text back to the original with one click
- DISP-01: Simplified text replaces the original text in-page by default
- DISP-02: User can configure display to show simplified text in a floating popup instead

**Success Criteria** (what must be TRUE when this phase completes):
1. New user can simplify text on first use without any configuration; extension works with sensible defaults (tone: casual, depth: light)
2. After first three uses, user has been asked about tone preference, explanation depth, and profession/background via non-intrusive inline prompts
3. User can customize keyboard shortcut (e.g., Alt+S, Ctrl+Shift+S) and setting persists across browser sessions
4. User can toggle between replace-in-page mode (default) and floating popup mode via settings UI
5. User can revert any simplified text to original with one-click "Undo" button; revert action is immediate (no API call needed)

**Plans:** TBD

---

## Progress Tracking

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Text Selection | 2/3 | In Progress|  |
| 2. Backend Integration & AI Simplification | 0/? | Not started | — |
| 3. Personalization & UX Polish | 0/? | Not started | — |

---

*Roadmap created: 2026-02-20*
*Phase 1 planned: 2026-02-22 — 3 plans, 2 waves*
