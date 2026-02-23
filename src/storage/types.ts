// src/storage/types.ts
// All chrome.storage.local state for Twelveify

export interface ExtensionState {
  /** Text the user has selected for simplification */
  selectedText: string;
  /** ISO timestamp when text was selected */
  selectedAt: number | null;
  /** Whether the AI is currently processing a simplification request */
  isLoading: boolean;
  /** Number of simplifications performed (for rate limiting in Phase 2) */
  simplifyCount: number;
  /** ISO timestamp of last simplification (for rate limiting in Phase 2) */
  lastSimplifiedAt: number | null;
}

export const DEFAULT_STATE: ExtensionState = {
  selectedText: '',
  selectedAt: null,
  isLoading: false,
  simplifyCount: 0,
  lastSimplifiedAt: null,
};
