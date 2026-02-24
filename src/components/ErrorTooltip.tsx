// src/components/ErrorTooltip.tsx
// Sarcastic error tooltip anchored to the floating button
// Appears above the button, auto-dismisses after 5 seconds (timer managed by FloatingButton)

import React from 'react';

interface ErrorTooltipProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorTooltip({ message, onDismiss }: ErrorTooltipProps) {
  return (
    <div
      onClick={onDismiss}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 8px)',  // 8px above the button
        right: '0',
        backgroundColor: '#1f2937',  // Dark background
        color: '#f9fafb',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.4',
        maxWidth: '240px',
        minWidth: '160px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'pre-wrap',
      }}
    >
      {message}
      {/* Arrow pointing down toward the button */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          right: '18px',
          width: '0',
          height: '0',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1f2937',
        }}
      />
    </div>
  );
}
