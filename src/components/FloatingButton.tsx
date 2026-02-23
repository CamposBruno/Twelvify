// src/components/FloatingButton.tsx
// Floating simplify button using native Popover API
// Popover API renders in top layer — zero z-index management needed
// Chrome 114+ (cross-browser Baseline stable as of April 2025)

import { useStorageValue } from '../storage/useStorage';

// Extend React's HTML attribute types to include the Popover API attributes
// (React 18 types don't include popover attributes; they are standard HTML spec as of 2024)
declare module 'react' {
  interface HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | '' | undefined;
    popoverTarget?: string | undefined;
    popoverTargetAction?: 'hide' | 'show' | 'toggle' | undefined;
  }
}

interface FloatingButtonProps {
  onSimplify: () => void;
}

export function FloatingButton({ onSimplify }: FloatingButtonProps) {
  const [isLoading] = useStorageValue<boolean>('isLoading', false);
  const [selectedText] = useStorageValue<string>('selectedText', '');

  if (!selectedText) {
    return null;
  }

  return (
    // Popover renders in the top layer above all page content
    // No z-index needed — Popover API handles layering natively
    <div
      id="twelvify-floating-btn"
      popover="manual"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        border: 'none',
        padding: '0',
        background: 'transparent',
        margin: '0',
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
