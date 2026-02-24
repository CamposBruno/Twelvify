import React from 'react';
import { SettingsPanel } from './SettingsPanel';

function App(): React.ReactElement {
  return (
    <div style={{ width: '320px', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {/* Spark icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6366f1" aria-hidden="true">
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
        </svg>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Twelveify</h1>
      </div>
      <SettingsPanel />
    </div>
  );
}

export default App;
