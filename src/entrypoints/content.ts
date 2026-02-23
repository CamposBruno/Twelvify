// src/entrypoints/content.ts
// Runs on every webpage — detects text selection, injects floating button
// Selection API: standard DOM text selection (shadow DOM excluded, deferred to Phase 4)

import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { FloatingButton } from '../components/FloatingButton';
import type { ExtensionMessage } from '../messaging/messages';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    // --- Inject floating button into page ---
    const container = document.createElement('div');
    container.id = 'twelvify-root';
    document.body.appendChild(container);

    const root = createRoot(container);

    function renderButton() {
      root.render(
        createElement(FloatingButton, {
          onSimplify: handleSimplify,
        })
      );
    }

    // Initial render — FloatingButton always renders, hidden until text is selected
    renderButton();

    // --- Text selection detection ---
    // Use selectionchange event (fires on any selection change)
    // Also listen for mouseup to catch rapid selections
    let selectionDebounce: ReturnType<typeof setTimeout> | null = null;

    function handleSelectionChange() {
      if (selectionDebounce) clearTimeout(selectionDebounce);

      selectionDebounce = setTimeout(() => {
        const selectedText = getSelectedText();

        if (selectedText && selectedText.length > 3) {
          // Send to background service worker for persistence
          // FloatingButton reads selectedText from storage directly — no showPopover() needed
          const message: ExtensionMessage = {
            type: 'TEXT_SELECTED',
            text: selectedText,
            timestamp: Date.now(),
          };

          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              // Service worker may have just restarted — not an error, retry once
              chrome.runtime.sendMessage(message);
            }
            // No showPopover() needed — FloatingButton reads from storage directly
          });
        } else {
          // Clear selection state — FloatingButton hides itself when selectedText is empty
          const clearMessage: ExtensionMessage = { type: 'CLEAR_SELECTION' };
          chrome.runtime.sendMessage(clearMessage);
        }
      }, 50); // 50ms debounce — prevents flooding on drag selections
    }

    function getSelectedText(): string {
      // Standard Selection API for most page text
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // Handle textarea/input fields (getSelection() returns empty for these)
      if (!text) {
        const activeEl = document.activeElement;
        if (
          activeEl instanceof HTMLTextAreaElement ||
          activeEl instanceof HTMLInputElement
        ) {
          const start = activeEl.selectionStart ?? 0;
          const end = activeEl.selectionEnd ?? 0;
          return activeEl.value.slice(start, end).trim();
        }
      }

      return text ?? '';
    }

    // Register listeners at top level of main() — not inside async callbacks
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    // Hide button when user clicks outside — send CLEAR_SELECTION so storage updates
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#twelvify-root')) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length <= 3) {
          const clearMessage: ExtensionMessage = { type: 'CLEAR_SELECTION' };
          chrome.runtime.sendMessage(clearMessage);
          // No hidePopover() needed — FloatingButton hides itself when selectedText clears
        }
      }
    });

    function handleSimplify() {
      // Phase 2 will implement the actual AI call here
      // Phase 1 stub: just log and set loading state
      const loadingMessage: ExtensionMessage = { type: 'SET_LOADING', isLoading: true };
      chrome.runtime.sendMessage(loadingMessage);

      // Simulate Phase 2 API call completion after 1s (stub only)
      setTimeout(() => {
        const doneMessage: ExtensionMessage = { type: 'SET_LOADING', isLoading: false };
        chrome.runtime.sendMessage(doneMessage);
      }, 1000);
    }
  },
});
