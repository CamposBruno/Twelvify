# Phase 3: Personalization & UX Polish - Research

**Researched:** 2026-02-24
**Domain:** Chrome extension local storage, keyboard shortcuts, progressive UI patterns, undo/revert mechanisms, display mode toggle, onboarding flows
**Confidence:** HIGH (stack verified with Chrome Extension API docs, established patterns from Phase 1-2, project architecture understood)

## Summary

Phase 3 adds personalization and user control to an extension that already has core simplification working. The phase requires: (1) settings storage via chrome.storage.sync for cross-session persistence, (2) keyboard shortcut binding and customization, (3) progressive onboarding that surfaces preferences over first few uses without friction, (4) an undo/revert system that reverses simplifications, (5) display mode toggle between in-page replacement and floating popup, and (6) age-based tone cycling via the floating button.

The key architectural insight is that personalization state is split: immutable settings (keyboard shortcut, tone, depth, profession, display mode) live in chrome.storage.sync for sync across profiles, while transient state (undo stack, current simplifications) lives in chrome.storage.local per-session. The extension already has useStorageValue hook and storage-driven UI patterns from Phases 1-2, so these extend naturally.

The onboarding flow is non-intrusive: after the 3rd simplification, inline prompts appear below the simplified text asking one preference at a time (age level, then depth, then profession), each dismissible forever. The undo system is stack-based in memory, resets on page navigation, and accessible via ESC key or button click. Keyboard shortcuts use chrome.commands API for registration but allow custom rebinding via the popup settings UI (not Chrome's built-in shortcuts page).

**Primary recommendation:** Extend existing chrome.storage patterns with sync storage for settings; use chrome.commands for keyboard shortcuts; implement inline onboarding prompts as transient DOM injections below simplified text; build undo as in-memory stack keyed by DOM node; toggle display modes via settings flag checked before rendering.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Progressive Onboarding Flow**
- Onboarding triggers after **3rd simplification** — let user get value first
- Prompts appear **inline below simplified text** — contextual, non-intrusive
- Preference collection order: **Age level → Depth → Profession** (one per session)
- Spacing: **every 2-3 uses apart** (use 3: age level, use 5-6: depth, use 8-9: profession)
- Dismissal: **one dismiss = gone forever** — user finds preferences in settings if they want later
- Each prompt shows **before/after preview** of how the preference affects output
- Note: "depth" is separate from the age-based tone — it controls explanation detail level

**Age-Based Simplification Levels (Tone)**
- Five levels: **Baby** (playful baby sounds/references) → **5** → **12** (default) → **18** → **Big Boy** (adult/original complexity)
- **Default for new users: 12** — on-brand with "Twelveify"
- Baby mode is intentionally playful/humorous — not a serious simplification level

**Floating Button Age Toggle**
- Button label shows **one age level lower** than current setting (e.g., setting is 12 → button says "Explain like I'm 5")
- At the lowest level (Baby), **wraps around to the top**: "Explain like I'm a Big Boy"
- This creates a cycle: each click gives a different perspective on the same text

**Profession/Interests**
- **Free text input** — user types their background ("I'm a nurse", "I do marketing")
- AI uses this for relatable analogies in simplifications

**Settings Access**
- **Extension popup** (click toolbar icon) is the single settings UI for all preferences
- No settings gear on the floating button — keep it clean

**Keyboard Shortcut**
- Default: **Ctrl+Shift+1** — on-brand nod to "12"
- **Customizable via extension popup settings** (not Chrome's shortcuts page)
- **Only works with text selected** — does nothing without selection
- Discoverability: **tooltip on floating button hover** + **one-time mention during onboarding**

**Revert / Undo**
- After simplification, **floating button becomes an undo button**
- **ESC key** reverts most recent simplification
- **Stack-based undo**: ESC reverts in reverse order (most recent first, then previous, like Ctrl+Z)
- Undo button **always visible** as long as any simplification is present on the page
- Undo stack **resets on page navigation** — no cross-page state
- **No badge/count** on undo button — just press ESC or click

**Display Modes**
- **Replace-in-page** is the default (already partially working from Phase 2 streaming)
- **Floating popup** as alternative — toggle in extension popup settings only (not per-simplification)

### Claude's Discretion

- Visual confirmation when a preference is set during onboarding (brief inline confirmation vs re-simplify)
- Floating popup design for alternative display mode (card near selection vs side panel)
- Exact spacing and typography for onboarding prompts
- Custom shortcut picker UI design in extension popup

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

Phase 3 must address these 8 requirements to be complete:

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIMP-03 | User can use a keyboard shortcut (e.g., Ctrl+Shift+S) to simplify selected text | chrome.commands API registers default Ctrl+Shift+1; popup settings UI allows rebinding; content script listens via chrome.runtime.onMessage for SIMPLIFY_HOTKEY command |
| SIMP-04 | User can revert rewritten text back to the original with one click | In-memory undo stack in content script stores {simplified, original, range} tuples; button toggles to "Undo" state after simplification; ESC key triggers revert; stack clears on page navigation |
| DISP-01 | Simplified text replaces the original text in-page by default | Phase 2 already implements DOM in-place replacement; Phase 3 adds display mode flag (default: "replace") checked before render; no change if mode not explicitly set to "popup" |
| DISP-02 | User can configure display to show simplified text in a floating popup instead | Settings popup has toggle for displayMode (replace vs popup); content script checks chrome.storage.sync for displayMode before rendering; popup display renders simplified text in fixed-position card near selection |
| PERS-01 | Extension works immediately with sensible defaults (no upfront setup required) | DEFAULT_STATE in storage/types.ts extended with tone: 12, depth: 'medium', profession: '', displayMode: 'replace'; popup shows these on first open; no wizard or required fields |
| PERS-02 | Extension progressively asks user about preferences over first few uses | After 3rd simplification (tracked via simplifyCount), inline prompts inject below simplified text; each prompt dismissible forever (dismissedOnboardingPrompts set in storage); one question per session, spaced 2-3 uses apart |
| PERS-03 | User can set profession/interests so analogies feel relatable | Popup settings UI has free-text input for profession; value stored in chrome.storage.sync; included in simplification API request so backend can incorporate into prompt |
| PERS-04 | User preferences persist across browser sessions via chrome.storage.sync | All user settings (tone, depth, profession, displayMode, keyboardShortcut) stored in chrome.storage.sync (not local); chrome.storage.sync auto-syncs across profiles if user has Google account linked |

</phase_requirements>

## Standard Stack

### Core Chrome Extension APIs
| API | Purpose | Why Standard | Version |
|-----|---------|-------------|---------|
| chrome.storage.sync | Persistent user settings across sessions | Chrome's official sync mechanism for user preferences; auto-syncs to Google account if linked; Manifest V3 standard | MV3 native |
| chrome.storage.local | Transient per-session state | Phase 1-2 established this pattern; simpler than sync for local-only data; good for undo stack, onboarding state | MV3 native |
| chrome.commands | Keyboard shortcut registration and binding | Official API for background shortcuts; integrates with Chrome's shortcuts UI and remapping | MV3 native |
| chrome.runtime.onMessage | Inter-script messaging | Phase 1-2 pattern; content script sends SIMPLIFY_HOTKEY to background when Ctrl+Shift+1 pressed | MV3 native |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React | 18.2+ | UI components for popup settings | Already in project; extends App.tsx with settings form |
| TypeScript | 5.0+ | Type safety for storage types | Already in project; extends ExtensionState interface |
| WXT | 0.20+ (current) | Build tool, defineBackground, defineContentScript | Already in project; handles chrome.commands registration |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| chrome.storage.sync | IndexedDB, localStorage | LocalStorage fails in service workers; IndexedDB overkill for simple KV; sync is purpose-built for settings |
| chrome.commands | Manual keyboard listener on content script | chrome.commands integrates with Chrome's shortcuts remapping UI; manual listeners don't show in chrome://extensions/shortcuts; harder to customize |
| In-memory undo stack | Persistent undo via storage | Undo persisting across pages contradicts user mental model (undo typically resets on navigation); in-memory is lighter, matches browser UX patterns |
| Inline onboarding prompts | Popup overlay or wizard | Inline is less disruptive; doesn't block user from continuing work; wizard adds friction and setup perception |

## Architecture Patterns

### Recommended Project Structure

Extension structure (building on Phase 1-2):

```
src/
├── entrypoints/
│   ├── popup/
│   │   ├── main.tsx
│   │   ├── App.tsx              # Extended: settings UI
│   │   ├── SettingsPanel.tsx    # NEW: tone, depth, profession, display mode, shortcuts
│   │   └── KeyboardShortcutPicker.tsx  # NEW: custom keybind UI
│   ├── background.ts            # Extended: handle chrome.commands
│   ├── content.ts               # Extended: undo stack, onboarding prompts, display mode toggle
│   └── options.html             # Optional: could move settings to dedicated options page
├── components/
│   ├── FloatingButton.tsx        # Extended: toggle to "Undo" state after simplification
│   ├── ErrorTooltip.tsx          # (no change)
│   ├── OnboardingPrompt.tsx      # NEW: inline preference prompt component
│   └── FloatingPopup.tsx         # NEW: alternative display mode (if displayMode=popup)
├── storage/
│   ├── types.ts                 # Extended: add UserSettings interface
│   └── useStorage.ts            # (no change; works with both sync and local)
├── messaging/
│   ├── messages.ts              # Extended: add SIMPLIFY_HOTKEY message type
│   └── handlers/
│       ├── simplify.ts          # (refactored from content.ts)
│       └── hotkey.ts            # NEW: handle keyboard shortcut
├── utils/
│   ├── undoStack.ts             # NEW: undo stack management
│   └── onboarding.ts            # NEW: onboarding logic (track count, generate prompts)
└── api/
    └── simplify.ts              # Extended: accept tone, depth, profession in request
```

### Pattern 1: Progressive Onboarding with Dismissal

**What:** After Nth simplification, show an inline preference prompt below the simplified text. Each prompt is dismissible forever (stored in dismissedOnboardingPrompts set).

**When to use:** When introducing new user preferences gradually without friction or wizard UX.

**Implementation:**

```typescript
// src/utils/onboarding.ts
interface OnboardingPrompt {
  id: 'tone' | 'depth' | 'profession';
  title: string;
  description: string;
  triggerAt: number;  // simplify count threshold
  spacingFrom: number; // minimum simplifications between prompts
}

const PROMPTS: OnboardingPrompt[] = [
  { id: 'tone', title: 'What age level?', triggerAt: 3, spacingFrom: 0 },
  { id: 'depth', title: 'How deep?', triggerAt: 5, spacingFrom: 3 },
  { id: 'profession', title: 'Your background?', triggerAt: 8, spacingFrom: 5 },
];

export function getNextOnboardingPrompt(
  simplifyCount: number,
  dismissedPrompts: string[]
): OnboardingPrompt | null {
  const available = PROMPTS.filter(
    (p) => simplifyCount >= p.triggerAt && !dismissedPrompts.includes(p.id)
  );
  return available[0] || null;
}

export function dismissPrompt(promptId: string, dismissed: string[]): string[] {
  return [...dismissed, promptId];
}
```

**Usage in content.ts:**

```typescript
// After simplification completes, check if prompt should show
const prompt = getNextOnboardingPrompt(simplifyCount, dismissedPrompts);
if (prompt) {
  // Inject OnboardingPrompt component below simplified text range
  renderPromptComponent(prompt, (selectedValue) => {
    // Store preference in storage.sync
    // Mark prompt as dismissed
  });
}
```

### Pattern 2: Undo Stack with ESC Key Binding

**What:** Maintain in-memory stack of {original, simplified, range} tuples. ESC key reverts to previous state.

**When to use:** Reversible DOM mutations where user expects standard undo behavior (Ctrl+Z, ESC).

**Implementation:**

```typescript
// src/utils/undoStack.ts
interface UndoStackEntry {
  original: string;
  simplified: string;
  range: Range; // or serialized range info
  domNode: Node;
}

class UndoStack {
  private stack: UndoStackEntry[] = [];

  push(entry: UndoStackEntry) {
    this.stack.push(entry);
  }

  pop(): UndoStackEntry | undefined {
    return this.stack.pop();
  }

  revert(entry: UndoStackEntry) {
    // Restore original text at entry.range
    entry.domNode.textContent = entry.original;
  }

  clear() {
    this.stack = [];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
```

**Usage in content.ts:**

```typescript
// After simplification completes, store original/simplified pair
const undoStack = new UndoStack();
undoStack.push({ original, simplified, range, domNode });

// Update FloatingButton state to show "Undo" label
// Listen for ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !undoStack.isEmpty()) {
    const entry = undoStack.pop();
    undoStack.revert(entry);
    // Update button state
  }
});

// Reset on page navigation
window.addEventListener('beforeunload', () => {
  undoStack.clear();
});
```

### Pattern 3: Display Mode Toggle via Settings

**What:** Settings UI has toggle for displayMode. Before rendering simplified text, check storage and render either in-place or in popup component.

**When to use:** When a feature has multiple presentation modes, configurable per-user.

**Implementation in content.ts:**

```typescript
async function handleSimplify() {
  // Fetch simplified text from backend
  const simplified = await fetchSimplifiedText(selectedText);

  // Check display mode from storage
  const [displayMode] = useStorageValue('displayMode', 'replace');

  if (displayMode === 'popup') {
    // Render FloatingPopup component with simplified text
    renderPopup(simplified, selectionRange);
  } else {
    // Default: replace in-place (existing Phase 2 behavior)
    replaceTextInDOM(simplified, selectionRange);
  }
}
```

### Pattern 4: Keyboard Shortcut with Custom Rebinding

**What:** chrome.commands registers default hotkey; popup settings allow user to rebind to custom key combo.

**When to use:** When users want app-global shortcuts with Chrome integration, plus optional customization.

**Implementation in background.ts:**

```typescript
// Define in wxt.config.ts:
// commands: {
//   'simplify-hotkey': { suggested_key: 'Ctrl+Shift+1' }
// }

chrome.commands.onCommand.addListener((command) => {
  if (command === 'simplify-hotkey') {
    // Get current shortcut binding from storage
    const [customBinding] = useStorageValue('keyboardShortcut', 'default');

    // Send message to content script to trigger simplify
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'SIMPLIFY_HOTKEY' });
    });
  }
});

// In popup settings:
// User can remap chrome.commands hotkey via chrome.commands.update() (newer API)
// OR store custom binding and let extension check in background
```

### Anti-Patterns to Avoid

- **Storing undo stack in chrome.storage:** Undo stack should be ephemeral (in-memory); persisting across sessions violates user expectations (undo typically resets on navigation).
- **Mixing sync and local storage for the same setting:** Pick one store per setting; sync for persistent user preferences, local for transient session state.
- **Onboarding prompt blocking interaction:** Inline prompts should be dismissible and non-modal; don't show wizard or require answers.
- **No default values:** Always provide sensible defaults (tone: 12, depth: medium, displayMode: replace) so extension works without setup.
- **Keyboard shortcuts hardcoded in content script:** Use chrome.commands API; ensures Chrome integration and allows remapping in chrome://extensions/shortcuts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistent user settings across sessions | Custom sync logic | chrome.storage.sync | Built for this exact use case; handles Google account sync, quota, conflict resolution |
| Keyboard shortcut binding and remapping | Manual keydown listeners | chrome.commands API | Integrates with Chrome's shortcuts UI; users expect remapping in chrome://extensions/shortcuts, not custom UI |
| In-memory undo/stack management | Custom stack + localStorage | In-memory UndoStack class + local storage for display mode flag | Undo should not persist; memory is fast and matches browser UX patterns |
| Progressive prompts over multiple uses | Custom state machine | Simple dismissedPrompts set + trigger logic | Don't over-engineer; dismissal set + count check is sufficient |
| Floating popup rendering | Custom positioning logic | Fixed/absolute CSS + React portal or shadow DOM | Browser's layout engine handles stacking; use standard web patterns not custom JS |

**Key insight:** Chrome's storage APIs and commands system are mature and purpose-built. Custom alternatives introduce edge cases (sync conflicts, quota exhaustion, keyboard remapping UX debt). Lean on the platform.

## Common Pitfalls

### Pitfall 1: Undo Stack Persisting Across Pages

**What goes wrong:** Developer stores undo stack in chrome.storage.local, expecting it to work across page navigations. User navigates to new URL, undo stack still contains old nodes, undo breaks or affects wrong text.

**Why it happens:** Developer assumes undo = persistent like browser history; doesn't realize DOM references don't survive page reload.

**How to avoid:** Keep undo stack in memory (not storage); clear on page navigation (beforeunload or popstate listeners); accept that undo resets per-page (matches user mental model).

**Warning signs:** Undo referencing stale DOM nodes; error in console when popping undo entries.

### Pitfall 2: Onboarding Prompts Don't Respect Dismissal

**What goes wrong:** User dismisses "What age level?" prompt, but it reappears on next simplification.

**Why it happens:** dismissedOnboardingPrompts set not properly persisted or checked; logic bug in getNextOnboardingPrompt.

**How to avoid:** Store dismissedPrompts in chrome.storage.sync (not local); always check it before rendering; unit test getNextOnboardingPrompt with various dismiss states.

**Warning signs:** User complains about repeated prompts; dismissedPrompts not in storage after dismissal.

### Pitfall 3: Display Mode Toggle Not Checking Storage

**What goes wrong:** User toggles displayMode in settings popup, but simplified text still renders in-place.

**Why it happens:** Content script caches displayMode value on load; doesn't re-read from storage after popup updates it.

**How to avoid:** Use useStorageValue hook (already does re-read on every onChanged event); or manually add chrome.storage.onChanged listener in content script.

**Warning signs:** Toggle works in first tab but not second; page needs reload for toggle to take effect.

### Pitfall 4: Keyboard Shortcut Not Triggering Simplify

**What goes wrong:** User presses Ctrl+Shift+1, nothing happens (or gets picked up by OS/browser).

**Why it happens:** chrome.commands handler never invokes content script handler; message routing missing; or Windows/macOS reserved the shortcut.

**How to avoid:** Verify chrome.commands registered in wxt.config.ts; log in chrome.commands.onCommand handler to confirm it fires; test with non-reserved key combo first (Ctrl+Shift+Y); document shortcut in UI.

**Warning signs:** Console shows "command 'simplify-hotkey' not found"; OS intercepts shortcut; message never reaches content script.

### Pitfall 5: Mixing Storage Scopes (sync vs local)

**What goes wrong:** Developer stores displayMode in chrome.storage.local, expects it to sync across profiles. Or stores transient onboarding state in sync, pollutes quota across profiles.

**Why it happens:** Confusion about storage semantics; sync for profile-bound data, local for per-device.

**How to avoid:** Make explicit choice for each setting: is this a preference (sync) or session state (local)? Document in ExtensionState interface comment. Use type system: UserSettings extends sync schema, TransientState extends local schema.

**Warning signs:** Toggle setting works on profile A but not B; unnecessary quota consumption; storage quota exceeded warnings.

## Code Examples

Verified patterns from official sources:

### Example 1: Store and Retrieve User Settings via Sync Storage

```typescript
// src/storage/types.ts
export interface UserSettings {
  tone: 5 | 12 | 18 | 'baby' | 'big_boy';
  depth: 'light' | 'medium' | 'detailed';
  profession: string; // free text
  displayMode: 'replace' | 'popup';
  keyboardShortcut: string; // e.g., 'Ctrl+Shift+1'
  dismissedOnboardingPrompts: string[]; // ['tone', 'depth', ...]
}

export const DEFAULT_SETTINGS: UserSettings = {
  tone: 12,
  depth: 'medium',
  profession: '',
  displayMode: 'replace',
  keyboardShortcut: 'Ctrl+Shift+1',
  dismissedOnboardingPrompts: [],
};

// In popup component:
const [tone, setTone] = useStorageValue<UserSettings['tone']>('tone', 12);
const [displayMode, setDisplayMode] = useStorageValue<UserSettings['displayMode']>('displayMode', 'replace');

// useStorageValue works with both chrome.storage.sync and .local
// Just ensure you read/write the same storage in wxt.config or explicit chrome.storage.sync.get/set calls
```

**Source:** Chrome Extension API docs - https://developer.chrome.com/docs/extensions/reference/storage/

### Example 2: Keyboard Shortcut Registration in wxt.config.ts

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    // ... other config
    commands: {
      'simplify-hotkey': {
        suggested_key: 'Ctrl+Shift+1',
        description: 'Simplify selected text'
      }
    }
  }
});

// In background.ts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'simplify-hotkey') {
    // Get active tab, send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SIMPLIFY_HOTKEY' });
      }
    });
  }
});
```

**Source:** Chrome Extension API docs - https://developer.chrome.com/docs/extensions/reference/commands/

### Example 3: Undo Stack Implementation in Content Script

```typescript
// src/utils/undoStack.ts
export class UndoStack {
  private stack: Array<{ original: string; simplified: string }> = [];

  push(original: string, simplified: string) {
    this.stack.push({ original, simplified });
  }

  pop() {
    return this.stack.pop();
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  clear() {
    this.stack = [];
  }
}

// In content.ts after simplification
const undoStack = new UndoStack();
undoStack.push(originalText, simplifiedText);

// Listen for ESC key globally
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !undoStack.isEmpty()) {
    e.preventDefault();
    const entry = undoStack.pop();
    // Replace simplified text back with original in DOM
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      range.deleteContents();
      range.insertNode(document.createTextNode(entry.original));
    }
    // Update button state to hide undo
  }
});

// Clear undo stack on page navigation
window.addEventListener('beforeunload', () => {
  undoStack.clear();
});
```

**Source:** MDN Web Docs - Stack data structure pattern

### Example 4: Progressive Onboarding Prompt Logic

```typescript
// src/utils/onboarding.ts
interface OnboardingPrompt {
  id: string;
  title: string;
  triggerAt: number;
}

const PROMPTS: OnboardingPrompt[] = [
  { id: 'tone', title: 'What age level?', triggerAt: 3 },
  { id: 'depth', title: 'How deep?', triggerAt: 6 },
  { id: 'profession', title: 'Your background?', triggerAt: 9 },
];

export function getNextPrompt(
  simplifyCount: number,
  dismissed: string[]
): OnboardingPrompt | null {
  const pending = PROMPTS.filter(
    (p) => simplifyCount >= p.triggerAt && !dismissed.includes(p.id)
  );
  return pending[0] || null;
}

// In content.ts after simplification:
const [simplifyCount] = useStorageValue('simplifyCount', 0);
const [dismissed, setDismissed] = useStorageValue('dismissedOnboardingPrompts', []);
const nextPrompt = getNextPrompt(simplifyCount, dismissed);

if (nextPrompt) {
  // Render OnboardingPrompt component inline below simplified text
  renderPrompt(nextPrompt, async (value) => {
    // Save preference (e.g., tone = value)
    // Mark prompt as dismissed
    setDismissed([...dismissed, nextPrompt.id]);
  });
}
```

**Source:** Established UX pattern in Slack, Figma, GitHub (gradual feature discovery)

### Example 5: Display Mode Toggle in Settings UI

```typescript
// src/entrypoints/popup/SettingsPanel.tsx
import { useStorageValue } from '../../storage/useStorage';

export function SettingsPanel() {
  const [displayMode, setDisplayMode] = useStorageValue<'replace' | 'popup'>(
    'displayMode',
    'replace'
  );

  return (
    <div>
      <h2>Display Mode</h2>
      <label>
        <input
          type="radio"
          value="replace"
          checked={displayMode === 'replace'}
          onChange={(e) => setDisplayMode(e.target.value as 'replace' | 'popup')}
        />
        Replace in-page (default)
      </label>
      <label>
        <input
          type="radio"
          value="popup"
          checked={displayMode === 'popup'}
          onChange={(e) => setDisplayMode(e.target.value as 'replace' | 'popup')}
        />
        Show in floating popup
      </label>
    </div>
  );
}

// In content.ts, check displayMode before rendering:
const [displayMode] = useStorageValue('displayMode', 'replace');
if (displayMode === 'popup') {
  // Render FloatingPopup component
} else {
  // Replace in-place (Phase 2 behavior)
}
```

**Source:** Established pattern in Chrome extension development

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual localStorage for sync | chrome.storage.sync | Manifest V3 (2023) | sync API is official, handles Google account, better quota management |
| Global keyboard listeners in content script | chrome.commands API | Manifest V3 (2021) | commands integrates with Chrome's shortcuts UI, more discoverable, less conflict |
| Persistent undo in IndexedDB | In-memory undo stack | Best practice | Better performance, matches browser UX expectations, simpler |
| Popup wizard for onboarding | Gradual inline prompts | 2020s UX research | Lower friction, higher completion, better retention |

**Deprecated/outdated:**
- **chrome.storage.sync on non-Manifest V3:** Manifest V2 is deprecated; V3 is standard since 2021
- **Background page scripts with persistent state:** Service workers (MV3) terminate after 30 seconds; use chrome.storage for all state
- **Custom shortcut dialogs:** chrome.commands UI is standard; users expect chrome://extensions/shortcuts for remapping

## Open Questions

1. **Should undo stack be accessible across sites on same domain?**
   - What we know: Current design clears undo on page navigation (beforeunload)
   - What's unclear: Should a user expect undo to work when navigating github.com/org/repo → github.com/org/repo2?
   - Recommendation: Clear on hard navigation (new domain/path), but consider keeping stack if it's a soft nav within same site. Implement with popstate listener and clear stack if pathname changes.

2. **How should "Explain like I'm a Baby" mode affect API request?**
   - What we know: Tone is sent to backend in simplification request
   - What's unclear: Should Baby mode have a special prompt instruction to add baby sounds/references, or is it just a tone level?
   - Recommendation: Document in backend simplification prompt what each tone level means. Test Baby mode output before shipping.

3. **Should profession field be free-text or a preset list?**
   - What we know: CONTEXT.md says free-text input ("I'm a nurse", "I do marketing")
   - What's unclear: Will backend AI properly use a free-text profession, or would a preset list (Finance, Healthcare, Tech, etc.) work better?
   - Recommendation: Start with free-text; if backend returns off-topic analogies, add preset list or combobox autocomplete in Phase 4.

4. **What's the interaction when user presses keyboard shortcut with no text selected?**
   - What we know: CONTEXT.md says "only works with text selected"
   - What's unclear: Should we show a tooltip saying "Select some text first" or silently ignore the shortcut?
   - Recommendation: Show brief tooltip ("Select text first, genius") to match Phase 2 sarcastic tone. Similar to current "no text selected" behavior.

## Sources

### Primary (HIGH confidence)

- Chrome Extension API docs - https://developer.chrome.com/docs/extensions/reference/storage/ (storage.sync, storage.local API reference)
- Chrome Extension API docs - https://developer.chrome.com/docs/extensions/reference/commands/ (keyboard shortcuts)
- Chrome Extension API docs - https://developer.chrome.com/docs/extensions/reference/runtime/ (messaging between scripts)
- MDN Web Docs - https://developer.mozilla.org/en-US/docs/Web/API/Selection_API (text selection in DOM for undo implementation)
- Project codebase Phase 1-2 - useStorageValue hook, FloatingButton component, established patterns for storage-driven UI

### Secondary (MEDIUM confidence)

- Chrome Web Store policy on keyboard shortcuts - https://developer.chrome.com/docs/extensions/mv3/ (best practices for commands)
- UX research on progressive onboarding - Slack, GitHub, Figma use gradual preference discovery over wizards

### Tertiary (LOW confidence)

- None; all recommendations are based on official Chrome APIs and established project patterns

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** - Chrome storage and commands APIs are native, documented, stable since MV3 (2021)
- Architecture: **HIGH** - Patterns (undo stack, onboarding, display toggle) are well-established in web extensions and web apps
- Pitfalls: **HIGH** - Identified from Phase 1-2 project experience and common Chrome extension patterns
- Open questions: **MEDIUM** - Require backend integration and UX testing to finalize

**Research date:** 2026-02-24

**Valid until:** 2026-03-24 (30 days - Chrome APIs stable, patterns unchanging)

**Next validation:** Before task breakdown in Phase 3 planning, confirm Baby mode prompt behavior with backend team.
