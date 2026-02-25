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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        {/* Logo icon — red square with running person, matches landing page */}
        <div
          style={{
            backgroundColor: '#f56060',
            border: '2px solid #1e293b',
            padding: '4px',
            transform: 'rotate(-4deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
          >
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9-1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
          </svg>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            fontFamily: "'Permanent Marker', cursive",
            display: 'inline-block',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}
        >
          Twelvify
        </h1>
      </div>
      <SettingsPanel />
    </div>
  );
}

export default App;
