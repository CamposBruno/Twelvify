import React, { useEffect, useState } from 'react';
import { useStorageSyncValue, initSyncDefaults } from '../../storage/useStorage';
import { DEFAULT_SETTINGS } from '../../storage/types';
import type { ToneLevel } from '../../storage/types';

// ─── Styles ──────────────────────────────────────────────────────────────────

const PANEL_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: "'Special Elite', monospace",
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#4b5563',
  margin: '0',
};

const BUTTON_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap' as const,
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  border: active ? '2px solid #111827' : '1px solid #d1d5db',
  borderRadius: '0px',
  background: active ? '#f56060' : '#f9fafb',
  color: active ? '#ffffff' : '#374151',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "'Special Elite', monospace",
  fontWeight: active ? '600' : '400',
  transition: 'all 0.15s ease',
});

const HELPER_TEXT_STYLE: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0',
  lineHeight: '1.4',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '8px 10px',
  border: '1px solid #d1d5db',
  borderRadius: '0px',
  fontSize: '13px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#374151',
  background: '#ffffff',
};

const RADIO_GROUP_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const RADIO_LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontFamily: "'Special Elite', monospace",
  color: '#374151',
  cursor: 'pointer',
};

const NOTE_STYLE: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0',
  lineHeight: '1.4',
  fontStyle: 'italic',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsPanel(): React.ReactElement {
  // Initialize sync defaults on popup open
  useEffect(() => {
    initSyncDefaults(DEFAULT_SETTINGS as unknown as Record<string, unknown>);
  }, []);

  // ── Tone ──
  const [tone, setTone] = useStorageSyncValue<ToneLevel>('tone', 12);

  const toneOptions: { label: string; value: ToneLevel }[] = [
    { label: 'Baby', value: 'baby' },
    { label: '5', value: 5 },
    { label: '12', value: 12 },
    { label: '18', value: 18 },
    { label: 'Big Boy', value: 'big_boy' },
  ];

  // ── Depth ──
  const [depth, setDepth] = useStorageSyncValue<string>('depth', 'medium');

  const depthOptions: { label: string; value: string }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Medium', value: 'medium' },
    { label: 'Detailed', value: 'detailed' },
  ];

  // ── Profession ──
  const [profession, setProfession] = useStorageSyncValue<string>('profession', '');
  const [professionDraft, setProfessionDraft] = useState(profession);

  // Sync draft when storage value changes
  useEffect(() => {
    setProfessionDraft(profession);
  }, [profession]);

  const handleProfessionBlur = () => {
    setProfession(professionDraft);
  };

  const handleProfessionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setProfession(professionDraft);
      (e.target as HTMLInputElement).blur();
    }
  };

  // ── Display Mode ──
  const [displayMode, setDisplayMode] = useStorageSyncValue<string>('displayMode', 'replace');

  // ── Keyboard Shortcut ──
  const [keyboardShortcut, setKeyboardShortcut] = useStorageSyncValue<string>('keyboardShortcut', 'Ctrl+Shift+1');
  const [shortcutDraft, setShortcutDraft] = useState(keyboardShortcut);

  useEffect(() => {
    setShortcutDraft(keyboardShortcut);
  }, [keyboardShortcut]);

  const handleShortcutBlur = () => {
    setKeyboardShortcut(shortcutDraft);
  };

  const handleShortcutKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setKeyboardShortcut(shortcutDraft);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={PANEL_STYLE}>

      {/* ── Age Level (Tone) ── */}
      <div style={SECTION_STYLE}>
        <p style={LABEL_STYLE}>Age Level</p>
        <div style={BUTTON_GROUP_STYLE}>
          {toneOptions.map((opt) => (
            <button
              key={String(opt.value)}
              style={buttonStyle(tone === opt.value)}
              onClick={() => setTone(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p style={HELPER_TEXT_STYLE}>
          Sets how simply I explain things. 12 = default Twelvify level.
        </p>
      </div>

      {/* ── Explanation Depth ── */}
      <div style={SECTION_STYLE}>
        <p style={LABEL_STYLE}>Explanation Depth</p>
        <div style={BUTTON_GROUP_STYLE}>
          {depthOptions.map((opt) => (
            <button
              key={opt.value}
              style={buttonStyle(depth === opt.value)}
              onClick={() => setDepth(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Display Mode ── */}
      <div style={SECTION_STYLE}>
        <p style={LABEL_STYLE}>Display Mode</p>
        <div style={RADIO_GROUP_STYLE}>
          <label style={RADIO_LABEL_STYLE} onClick={() => setDisplayMode('replace')}>
            <span style={{
              width: '14px',
              height: '14px',
              border: displayMode === 'replace' ? '2px solid #111827' : '1px solid #d1d5db',
              borderRadius: '0px',
              background: displayMode === 'replace' ? '#fde047' : '#ffffff',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            Replace in-page
          </label>
          <label style={RADIO_LABEL_STYLE} onClick={() => setDisplayMode('popup')}>
            <span style={{
              width: '14px',
              height: '14px',
              border: displayMode === 'popup' ? '2px solid #111827' : '1px solid #d1d5db',
              borderRadius: '0px',
              background: displayMode === 'popup' ? '#fde047' : '#ffffff',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            Show in popup
          </label>
        </div>
      </div>

      {/* ── Keyboard Shortcut ── */}
      <div style={SECTION_STYLE}>
        <p style={LABEL_STYLE}>Keyboard Shortcut</p>
        <p style={{ margin: 0, fontSize: '13px', fontFamily: "'Special Elite', monospace", color: '#374151' }}>
          {keyboardShortcut}
        </p>
        <p style={NOTE_STYLE}>
          Update in chrome://extensions/shortcuts
        </p>
      </div>

    </div>
  );
}
