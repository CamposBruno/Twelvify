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
}

/** Returns the label matching the user's current tone level. */
function getButtonLabel(tone: ToneLevel): string {
  switch (tone) {
    case 'baby':
      return "Explain like I'm a Baby";
    case 5:
      return "Explain like I'm 5";
    case 12:
      return 'Twelvify';
    case 18:
      return "Explain like I'm 18";
    case 'big_boy':
      return "Explain like I'm a Big Boy";
    default:
      return 'Twelvify';
  }
}

/** Returns the ONE-LEVEL-LOWER label for re-simplifying already-simplified text. */
function getDowngradeLabel(tone: ToneLevel): string {
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
      return "Explain like I'm 5";
  }
}

export function FloatingButton({ onSimplify, onUndo, hasUndo }: FloatingButtonProps) {
  const [isLoading] = useStorageValue<boolean>('isLoading', false);
  const [selectedText] = useStorageValue<string>('selectedText', '');
  const [errorState, setErrorState] = useStorageValue<ExtensionState['errorState']>('errorState', null);
  const [tone] = useStorageSyncValue<ToneLevel>('tone', 12);
  const [isSelectingSimplified] = useStorageValue<boolean>('isSelectingSimplified', false);

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

  // Label: current tone level normally, one-level-down when re-selecting simplified text
  const simplifyLabel = isSelectingSimplified ? getDowngradeLabel(tone) : getButtonLabel(tone);

  const simplifyBgColor = isLoading
    ? '#f56060'      // Red during loading (was indigo)
    : errorState
      ? '#f59e0b'    // Amber on error (keep amber for error states)
      : '#f56060';   // Red default (red replaces indigo as primary)

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
          className="twelvify-simplify-btn"
          onClick={onUndo}
          aria-label="Revert to original text (Esc)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: '2px solid #1e293b',
            borderRadius: '0px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: "'Permanent Marker', cursive",
          }}
        >
          Esc to Undo
        </button>
      )}
      {/* Simplify button — always rendered, hidden via parent opacity when no selection */}
      {hasSelection && (
        <button
          className="twelvify-simplify-btn"
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
            border: '2px solid #1e293b',
            borderRadius: '0px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Permanent Marker', cursive",
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
                <path d="M7.5 5.6 10 7l-1.4-2.5L10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8-2.5-1.4 1.4 2.5-1.4 2.5 2.5-1.4L22 19l-1.4-2.5zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a1 1 0 0 0-1.41 0L1.29 18.96a1 1 0 0 0 0 1.41l2.34 2.34a1 1 0 0 0 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41zm-1.03 7.41-1.42-1.42 1.42-1.42 1.41 1.42z" />
              </svg>
              {simplifyLabel}
            </>
          )}
        </button>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        .twelvify-simplify-btn {
          box-shadow: 4px 4px 0px 0px #1e293b;
          transition: all 0.15s ease;
        }
        .twelvify-simplify-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
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
