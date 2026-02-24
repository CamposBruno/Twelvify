import React, { useEffect, useState } from 'react';

interface FloatingPopupProps {
  simplifiedText: string;
  onClose: () => void;
}

export function FloatingPopup({ simplifiedText, onClose }: FloatingPopupProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    // Defer to next frame to allow CSS transition to trigger
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    right: '24px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    maxWidth: '360px',
    maxHeight: '300px',
    overflowY: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 2147483646,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.2s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#6b7280',
    margin: '0',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#9ca3af',
    padding: '0',
    lineHeight: '1',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
    margin: '0',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>Simplified</p>
        <button style={closeButtonStyle} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <p style={bodyStyle}>{simplifiedText}</p>
    </div>
  );
}
