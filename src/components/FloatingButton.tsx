// src/components/FloatingButton.tsx
// Floating simplify button — always rendered, visibility driven by selectedText in storage
// CSS visibility approach: no Popover API, no race conditions with React render cycle

import React, { useEffect } from 'react';
import { useStorageValue, useStorageSyncValue } from '../storage/useStorage';
import type { ExtensionState, ToneLevel } from '../storage/types';
import { ErrorTooltip } from './ErrorTooltip';

interface FloatingButtonProps {
  onSimplify: () => void;
  onUndo?: () => void;           // Called when undo button clicked
  hasUndo?: boolean;             // True when undo stack has entries — shows undo button
  hasSimplifiedBefore?: boolean; // True after at least one simplification — shows level-down label
}

/**
 * Returns the ONE-LEVEL-LOWER age label for the button.
 * The button invites the user to simplify to the level BELOW their current setting.
 *
 * Wrapping order (from highest to lowest, then wraps around):
 *   big_boy → 18 → 12 → 5 → baby → big_boy (wrap-around)
 */
function getButtonLabel(tone: ToneLevel): string {
  switch (tone) {
    case 'big_boy':
      return "Explain like I'm 18";
    case 18:
      return "Explain like I'm 12";
    case 12:
      return "Explain like I'm 5";
    case 5:
      return "Explain like I'm a Baby";
    case 'baby':
      return "Explain like I'm a Big Boy";
    default:
      // TypeScript exhaustiveness guard — ToneLevel covers all 5 cases above
      return "Simplify";
  }
}

export function FloatingButton({ onSimplify, onUndo, hasUndo, hasSimplifiedBefore }: FloatingButtonProps) {
  const [isLoading] = useStorageValue<boolean>('isLoading', false);
  const [selectedText] = useStorageValue<string>('selectedText', '');
  const [errorState, setErrorState] = useStorageValue<ExtensionState['errorState']>('errorState', null);
  const [tone] = useStorageSyncValue<ToneLevel>('tone', 12);

  // Auto-dismiss error after 5 seconds — clears errorState from storage
  const dismissTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (errorState) {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setErrorState(null);
      }, 5000);
    }
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [errorState]);

  // Shake animation — triggers once when a new error appears
  const [isShaking, setIsShaking] = React.useState(false);
  const prevErrorRef = React.useRef<ExtensionState['errorState']>(null);

  useEffect(() => {
    if (errorState && !prevErrorRef.current) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
    prevErrorRef.current = errorState;
  }, [errorState]);

  // Visible when text is selected OR when undo stack has entries (so undo stays accessible)
  const hasSelection = Boolean(selectedText);
  const showUndo = Boolean(hasUndo) && !isLoading;
  const isVisible = hasSelection || showUndo;

  // Simplify button label: "Simplify" initially, age-level-down label after first simplification
  const simplifyLabel = hasSimplifiedBefore ? getButtonLabel(tone) : 'Simplify';

  const simplifyBgColor = isLoading
    ? '#6366f1'
    : errorState
      ? '#f59e0b'
      : '#6366f1';

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
        zIndex: 2147483647,
      }}
    >
      {errorState && (
        <ErrorTooltip
          message={errorState.message}
          onDismiss={() => setErrorState(null)}
        />
      )}
      {/* Undo button — separate, appears left of simplify when undo stack has entries */}
      {showUndo && (
        <button
          onClick={onUndo}
          aria-label="Revert to original text"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          &#x21A9; Undo
        </button>
      )}
      {/* Simplify button — always rendered, hidden via parent opacity when no selection */}
      {hasSelection && (
        <button
          onClick={isLoading ? undefined : onSimplify}
          disabled={isLoading}
          aria-label="Simplify selected text"
          title={!isLoading ? `Simplify selected text (Ctrl+Shift+1)` : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: simplifyBgColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity: isLoading ? 0.8 : 1,
            animation: isShaking ? 'twelvify-shake 0.6s ease' : undefined,
          }}
        >
          {isLoading ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ animation: 'twelvify-spin 1s linear infinite' }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Simplifying...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
              </svg>
              {simplifyLabel}
            </>
          )}
        </button>
      )}
      <style>{`
        @keyframes twelvify-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twelvify-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-5px) rotate(-1deg); }
          30% { transform: translateX(5px) rotate(1deg); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
