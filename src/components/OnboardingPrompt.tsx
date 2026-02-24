import React, { useState } from 'react';
import type { OnboardingPromptDef } from '../utils/onboarding';

interface OnboardingPromptProps {
  prompt: OnboardingPromptDef;
  onDismiss: () => void;  // Called when user clicks "Not now" — forever
  onSelect?: (value: string) => void;  // Called when user picks a value
}

const CARD_STYLE: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '12px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '13px',
  maxWidth: '320px',
  marginTop: '8px',
};

const TITLE_STYLE: React.CSSProperties = {
  fontWeight: '600',
  fontSize: '13px',
  color: '#111827',
  marginBottom: '4px',
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  marginBottom: '10px',
  lineHeight: '1.4',
};

const BUTTON_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '5px 10px',
  margin: '3px 3px 3px 0',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  background: '#f9fafb',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const DISMISS_STYLE: React.CSSProperties = {
  display: 'block',
  marginTop: '8px',
  fontSize: '11px',
  color: '#9ca3af',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: '0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  textAlign: 'left' as const,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '6px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '12px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#374151',
  marginBottom: '6px',
};

const SAVE_BUTTON_STYLE: React.CSSProperties = {
  padding: '5px 12px',
  background: '#6366f1',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

export function OnboardingPrompt({ prompt, onDismiss, onSelect }: OnboardingPromptProps): React.ReactElement {
  const [professionValue, setProfessionValue] = useState('');

  const handleButtonSelect = (value: string) => {
    if (onSelect) onSelect(value);
  };

  const handleProfessionSave = () => {
    if (onSelect && professionValue.trim()) {
      onSelect(professionValue.trim());
    } else {
      onDismiss();
    }
  };

  const renderControls = () => {
    if (prompt.id === 'tone') {
      const toneOptions: { label: string; value: string }[] = [
        { label: 'Baby', value: 'baby' },
        { label: '5', value: '5' },
        { label: '12', value: '12' },
        { label: '18', value: '18' },
        { label: 'Big Boy', value: 'big_boy' },
      ];
      return (
        <div>
          {toneOptions.map((opt) => (
            <button
              key={opt.value}
              style={BUTTON_STYLE}
              onClick={() => handleButtonSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (prompt.id === 'depth') {
      const depthOptions: { label: string; value: string }[] = [
        { label: 'Light', value: 'light' },
        { label: 'Medium', value: 'medium' },
        { label: 'Detailed', value: 'detailed' },
      ];
      return (
        <div>
          {depthOptions.map((opt) => (
            <button
              key={opt.value}
              style={BUTTON_STYLE}
              onClick={() => handleButtonSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (prompt.id === 'profession') {
      return (
        <div>
          <input
            type="text"
            style={INPUT_STYLE}
            placeholder="I'm a nurse, I do marketing..."
            value={professionValue}
            onChange={(e) => setProfessionValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleProfessionSave();
            }}
          />
          <button style={SAVE_BUTTON_STYLE} onClick={handleProfessionSave}>
            Save
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={CARD_STYLE}>
      <div style={TITLE_STYLE}>{prompt.title}</div>
      <div style={DESCRIPTION_STYLE}>{prompt.description}</div>
      {renderControls()}
      <button style={DISMISS_STYLE} onClick={onDismiss}>
        Not now →
      </button>
    </div>
  );
}
