import React from 'react';
import { SettingsPanel } from './SettingsPanel';

function App(): React.ReactElement {
  return (
    <div
      style={{
        width: '320px',
        padding: '16px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#f8f6f6',
        backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)',
        backgroundSize: '14px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {/* Magic wand icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f56060"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 4l5 5" />
          <path d="M5 19L19 5" />
          <path d="M3 21l3-3" />
          <circle cx="18" cy="6" r="1" fill="#f56060" stroke="none" />
          <circle cx="6" cy="18" r="1" fill="#f56060" stroke="none" />
        </svg>
        <h1
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            fontFamily: "'Permanent Marker', cursive",
            display: 'inline-block',
            whiteSpace: 'nowrap',
            transform: 'rotate(-1.5deg)',
          }}
        >
          Twelveify
        </h1>
      </div>
      <SettingsPanel />
    </div>
  );
}

export default App;
