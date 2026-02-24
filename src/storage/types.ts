// src/storage/types.ts
// All chrome.storage.local state for Twelveify

export interface ExtensionState {
  /** Text the user has selected for simplification */
  selectedText: string;
  /** ISO timestamp when text was selected */
  selectedAt: number | null;
  /** Whether the AI is currently processing a simplification request */
  isLoading: boolean;
  /** Number of simplifications performed (lifetime total) */
  simplifyCount: number;
  /** ISO timestamp of last simplification */
  lastSimplifiedAt: number | null;
  /** Current error state — null when no error. Drives error tooltip in FloatingButton */
  errorState: {
    code: 'offline' | 'rate_limit' | 'timeout' | 'text_too_long' | 'ai_error' | 'unknown';
    message: string;
    resetAt?: string;
  } | null;
  /** Client-side soft rate limit: requests in current hour window */
  simplifyCountThisHour: number;
  /** ISO timestamp when current hour window started */
  hourWindowStart: string | null;
}

export const DEFAULT_STATE: ExtensionState = {
  selectedText: '',
  selectedAt: null,
  isLoading: false,
  simplifyCount: 0,
  lastSimplifiedAt: null,
  errorState: null,
  simplifyCountThisHour: 0,
  hourWindowStart: null,
};

// ─── User Settings (chrome.storage.sync) ──────────────────────────────────────
// These preferences are persisted in chrome.storage.sync so they survive browser
// restarts and sync across devices/profiles. Contrast with ExtensionState above,
// which lives in chrome.storage.local and tracks ephemeral runtime state.

/**
 * Five age-based simplification levels that drive the AI prompt.
 * - 'baby'    → Playful, ultra-simple language (under 5)
 * - 5         → Simple sentences, basic vocabulary
 * - 12        → Default "Twelveify" brand level — clear, accessible English
 * - 18        → Near-adult complexity
 * - 'big_boy' → Full adult complexity — minimal simplification
 *
 * Stored in chrome.storage.sync under key 'tone'.
 */
export type ToneLevel = 'baby' | 5 | 12 | 18 | 'big_boy';

/**
 * User preferences persisted across sessions via chrome.storage.sync.
 * All fields have sensible defaults defined in DEFAULT_SETTINGS.
 */
export interface UserSettings {
  /**
   * Age-based simplification level controlling AI prompt persona.
   * Stored in chrome.storage.sync under key 'tone'.
   */
  tone: ToneLevel;

  /**
   * Explanation detail level — separate from tone.
   * - 'light'    → Brief one-line summary
   * - 'medium'   → Balanced explanation with context
   * - 'detailed' → In-depth with examples and analogies
   * Stored in chrome.storage.sync under key 'depth'.
   */
  depth: 'light' | 'medium' | 'detailed';

  /**
   * Free-text profession for relatable analogies in AI output.
   * Examples: "I'm a nurse", "I do marketing", "I'm a student".
   * Empty string means no profession context is applied.
   * Stored in chrome.storage.sync under key 'profession'.
   */
  profession: string;

  /**
   * Controls where the simplified text is displayed.
   * - 'replace' → Replaces selected text in-place (DOM mutation)
   * - 'popup'   → Shows result in a floating popover overlay
   * Stored in chrome.storage.sync under key 'displayMode'.
   */
  displayMode: 'replace' | 'popup';

  /**
   * Keyboard shortcut string for display purposes only.
   * The actual key binding is managed by chrome.commands in the manifest.
   * Example: 'Ctrl+Shift+1'.
   * Stored in chrome.storage.sync under key 'keyboardShortcut'.
   */
  keyboardShortcut: string;

  /**
   * IDs of onboarding prompts the user has dismissed.
   * Known IDs: 'tone', 'depth', 'profession'.
   * Used to suppress prompts after first dismissal.
   * Stored in chrome.storage.sync under key 'dismissedOnboardingPrompts'.
   */
  dismissedOnboardingPrompts: string[];
}

/**
 * Sensible defaults applied on first install via initSyncDefaults.
 * tone: 12 is the Twelveify brand default — clear, accessible English.
 */
export const DEFAULT_SETTINGS: UserSettings = {
  tone: 12,
  depth: 'medium',
  profession: '',
  displayMode: 'replace',
  keyboardShortcut: 'Ctrl+Shift+1',
  dismissedOnboardingPrompts: [],
};
