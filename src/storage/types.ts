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
