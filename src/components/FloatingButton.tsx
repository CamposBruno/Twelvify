// src/components/FloatingButton.tsx
// Floating simplify button — always rendered, visibility driven by selectedText in storage
// CSS visibility approach: no Popover API, no race conditions with React render cycle

import React, { useEffect } from 'react';
import { useStorageValue, useStorageSyncValue } from '../storage/useStorage';
import type { ExtensionState, ToneLevel } from '../storage/types';
import { ErrorTooltip } from './ErrorTooltip';

interface FloatingButtonProps {
  onSimplify: () => void;
  onUndo?: () => void;    // Called when undo button clicked
  hasUndo?: boolean;      // True when undo stack has entries — shows undo mode
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

export function FloatingButton({ onSimplify, onUndo, hasUndo }: FloatingButtonProps) {
  const [isLoading] = useStorageValue<boolean>('isLoading', false);
  const [selectedText] = useStorageValue<string>('selectedText', '');
  const [errorState, setErrorState] = useStorageValue<ExtensionState['errorState']>('errorState', null);
  const [tone] = useStorageSyncValue<ToneLevel>('tone', 12);

  // Auto-dismiss error after 5 seconds — clears errorState from storage
  const dismissTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (errorState) {
      // Clear any existing timer before starting a new one
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
      // New error appeared — trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600); // Match shake animation duration
    }
    prevErrorRef.current = errorState;
  }, [errorState]);

  // Always render — visibility controlled via CSS, not conditional null return.
  // Conditional null caused a race: DOM element didn't exist when content.ts
  // tried to call showPopover(), so the button never appeared.
  const isVisible = Boolean(selectedText);

  // --- Button state priority hierarchy ---
  // 1. isLoading → spinner + "Simplifying..." (unchanged)
  // 2. errorState → yellow button + ErrorTooltip (unchanged)
  // 3. hasUndo → green undo button (new)
  // 4. default → age-level label + indigo button (modified)

  const isUndoMode = Boolean(hasUndo) && !isLoading;

  const buttonBgColor = isLoading
    ? '#6366f1'   // Indigo during loading
    : errorState
      ? '#f59e0b' // Warning yellow on error
      : isUndoMode
        ? '#10b981' // Green for undo mode
        : '#6366f1'; // Default indigo

  const buttonAriaLabel = isLoading
    ? 'Simplifying...'
    : isUndoMode
      ? 'Revert to original text'
      : 'Simplify selected text';

  const handleClick = isLoading
    ? undefined
    : isUndoMode
      ? onUndo
      : onSimplify;

  return (
    // Always-present container — opacity/pointerEvents toggle makes it visible/hidden
    <div
      id="twelvify-floating-btn"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
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
      <button
        onClick={handleClick}
        disabled={isLoading}
        aria-label={buttonAriaLabel}
        title={!isLoading && !isUndoMode ? `Simplify selected text (Ctrl+Shift+1)` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: buttonBgColor,
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
            {/* Loading spinner — inline SVG, no external assets */}
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
        ) : isUndoMode ? (
          // Undo mode — green button, no spark icon, just text
          <>&#x21A9; Undo</>
        ) : (
          <>
            {/* Spark icon — inline SVG */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
            </svg>
            {getButtonLabel(tone)}
          </>
        )}
      </button>
      {/* CSS keyframes for spinner and shake animations — injected once */}
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
