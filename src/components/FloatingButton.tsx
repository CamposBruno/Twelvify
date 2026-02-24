// src/components/FloatingButton.tsx
// Floating simplify button — always rendered, visibility driven by selectedText in storage
// CSS visibility approach: no Popover API, no race conditions with React render cycle

import React, { useEffect } from 'react';
import { useStorageValue } from '../storage/useStorage';
import type { ExtensionState } from '../storage/types';

interface FloatingButtonProps {
  onSimplify: () => void;
}

export function FloatingButton({ onSimplify }: FloatingButtonProps) {
  const [isLoading] = useStorageValue<boolean>('isLoading', false);
  const [selectedText] = useStorageValue<string>('selectedText', '');
  const [errorState] = useStorageValue<ExtensionState['errorState']>('errorState', null);

  // Auto-dismiss error after 5 seconds — clears errorState from storage
  useEffect(() => {
    if (!errorState) return;
    const timerId = setTimeout(() => {
      chrome.storage.local.set({ errorState: null });
    }, 5000);
    return () => clearTimeout(timerId);
  }, [errorState]);

  // Always render — visibility controlled via CSS, not conditional null return.
  // Conditional null caused a race: DOM element didn't exist when content.ts
  // tried to call showPopover(), so the button never appeared.
  const isVisible = Boolean(selectedText);

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
      <button
        onClick={isLoading ? undefined : onSimplify}
        disabled={isLoading}
        aria-label={isLoading ? 'Simplifying...' : 'Simplify selected text'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#6366f1',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          opacity: isLoading ? 0.8 : 1,
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
            Simplify
          </>
        )}
      </button>
      {/* CSS keyframe for spinner animation — injected once */}
      <style>{`
        @keyframes twelvify-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
