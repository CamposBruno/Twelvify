// src/entrypoints/content.ts
// Runs on every webpage — detects text selection, injects floating button
// Selection API: standard DOM text selection (shadow DOM excluded, deferred to Phase 4)

import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { FloatingButton } from '../components/FloatingButton';
import { FloatingPopup } from '../components/FloatingPopup';
import { OnboardingPrompt } from '../components/OnboardingPrompt';
import { UndoStack } from '../utils/undoStack';
import { getNextOnboardingPrompt } from '../utils/onboarding';
import type { ExtensionMessage } from '../messaging/messages';
import type { ToneLevel } from '../storage/types';
import { DEFAULT_SETTINGS } from '../storage/types';

// TODO: Update to production URL before Chrome Web Store submission
const BACKEND_URL = 'http://localhost:3001/api/simplify';
const SOFT_RATE_LIMIT = 50;       // requests per hour
const HOUR_MS = 3600000;           // 1 hour in milliseconds
const MAX_TEXT_LENGTH = 5000;      // characters
const REQUEST_TIMEOUT_MS = 10000;  // 10 seconds

// Module-level undo stack — one instance per content script (per page load)
const undoStack = new UndoStack();

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
          onUndo: handleUndo,
          hasUndo: !undoStack.isEmpty(),
        })
      );
    }

    // Initial render — FloatingButton always renders, hidden until text is selected
    renderButton();

    function handleUndo() {
      undoStack.revertLast();
      renderButton(); // Re-render to update hasUndo state
    }

    function renderOnboardingPromptIfNeeded(belowSpan: HTMLElement): void {
      chrome.storage.sync.get(
        ['simplifyCount', 'dismissedOnboardingPrompts'],
        (result) => {
          const count = (result.simplifyCount as number) ?? 0;
          const dismissed = (result.dismissedOnboardingPrompts as string[]) ?? [];
          const prompt = getNextOnboardingPrompt(count, dismissed);
          if (!prompt) return;

          // Create a container div inserted after the simplified text span
          const promptContainer = document.createElement('div');
          promptContainer.id = 'twelvify-onboarding-prompt';
          belowSpan.insertAdjacentElement('afterend', promptContainer);

          const promptRoot = createRoot(promptContainer);

          function dismiss() {
            // Mark prompt as dismissed forever in chrome.storage.sync
            const updated = [...dismissed, prompt!.id];
            chrome.storage.sync.set({ dismissedOnboardingPrompts: updated });
            promptRoot.unmount();
            promptContainer.remove();
          }

          function handleSelect(value: string) {
            // Save the selected preference to chrome.storage.sync
            // Map prompt.id to storage key (tone/depth/profession)
            chrome.storage.sync.set({ [prompt!.id]: value });
            dismiss();
          }

          promptRoot.render(
            createElement(OnboardingPrompt, {
              prompt,
              onDismiss: dismiss,
              onSelect: handleSelect,
            })
          );
        }
      );
    }

    // ESC key listener — reverts most recent simplification when stack is non-empty
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !undoStack.isEmpty()) {
        e.preventDefault();
        handleUndo();
      }
    });

    // Clear undo stack on page navigation
    window.addEventListener('beforeunload', () => {
      undoStack.clear();
      renderButton();
    });

    // SIMPLIFY_HOTKEY message listener — triggers handleSimplify() only when text is selected
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'SIMPLIFY_HOTKEY') {
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 3) {
          handleSimplify();
        }
        // Silent no-op if no text selected (CONTEXT.md: "only works with text selected")
      }
    });

    // --- Text selection detection ---
    // Use selectionchange event (fires on any selection change)
    // Also listen for mouseup to catch rapid selections
    let selectionDebounce: ReturnType<typeof setTimeout> | null = null;

    function handleSelectionChange() {
      if (selectionDebounce) clearTimeout(selectionDebounce);

      selectionDebounce = setTimeout(() => {
        const selectedText = getSelectedText();
        // Re-render button so hasSimplifiedBefore reflects current selection
        renderButton();

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

    async function handleSimplify() {
      // Read state from chrome.storage.local for all pre-flight checks
      const state = await new Promise<{
        selectedText: string;
        simplifyCountThisHour: number;
        hourWindowStart: string | null;
        simplifyCount: number;
      }>((resolve) => {
        chrome.storage.local.get(
          ['selectedText', 'simplifyCountThisHour', 'hourWindowStart', 'simplifyCount'],
          (result) => resolve(result as {
            selectedText: string;
            simplifyCountThisHour: number;
            hourWindowStart: string | null;
            simplifyCount: number;
          })
        );
      });

      const { selectedText } = state;
      let { simplifyCountThisHour, hourWindowStart, simplifyCount } = state;

      // Read user settings from chrome.storage.sync for personalization
      const settings = await new Promise<{ tone: ToneLevel; depth: string; profession: string; displayMode: string }>((resolve) => {
        chrome.storage.sync.get(
          ['tone', 'depth', 'profession', 'displayMode'],
          (result) => resolve({
            tone: (result.tone as ToneLevel) ?? DEFAULT_SETTINGS.tone,
            depth: (result.depth as string) ?? DEFAULT_SETTINGS.depth,
            profession: (result.profession as string) ?? DEFAULT_SETTINGS.profession,
            displayMode: (result.displayMode as string) ?? DEFAULT_SETTINGS.displayMode,
          })
        );
      });

      // 1. Client-side soft rate limit check (50 req/hr)
      const now = Date.now();
      const windowStart = hourWindowStart ? new Date(hourWindowStart).getTime() : null;

      if (windowStart === null || now - windowStart > HOUR_MS) {
        // Reset the hour window
        simplifyCountThisHour = 0;
        hourWindowStart = new Date(now).toISOString();
        await new Promise<void>((resolve) => {
          chrome.storage.local.set(
            { simplifyCountThisHour: 0, hourWindowStart },
            () => resolve()
          );
        });
      }

      if (simplifyCountThisHour >= SOFT_RATE_LIMIT) {
        const windowStartMs = new Date(hourWindowStart!).getTime();
        const resetMs = windowStartMs + HOUR_MS;
        const minutesLeft = Math.ceil((resetMs - now) / 60000);
        chrome.runtime.sendMessage({
          type: 'SIMPLIFY_ERROR',
          errorCode: 'rate_limit',
          message: `Easy there, speed racer. You've hit your hourly limit. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
          resetAt: new Date(resetMs).toISOString(),
        } as ExtensionMessage);
        return;
      }

      // 2. Text length check (>5000 chars)
      if (!selectedText || selectedText.length === 0) {
        return; // No text selected — do nothing
      }

      if (selectedText.length > MAX_TEXT_LENGTH) {
        chrome.runtime.sendMessage({
          type: 'SIMPLIFY_ERROR',
          errorCode: 'text_too_long',
          message: "Easy there, speed racer. That's too much to chew. Select a shorter passage (under 5000 characters).",
        } as ExtensionMessage);
        return;
      }

      // 3. Offline check
      if (!navigator.onLine) {
        chrome.runtime.sendMessage({
          type: 'SIMPLIFY_ERROR',
          errorCode: 'offline',
          message: "Wow, no internet. Shocking.",
        } as ExtensionMessage);
        return;
      }

      // 4. Capture the DOM range before any async work
      // Critical: user may click away during streaming — range must be captured now
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0).cloneRange();

      // Save scroll position to restore after replacement (prevents layout jump)
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // 5. Set loading state
      chrome.runtime.sendMessage({ type: 'SET_LOADING', isLoading: true } as ExtensionMessage);

      // 6. Fetch with SSE streaming via ReadableStream
      // NOTE: EventSource does NOT support POST with body — must use fetch()
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: selectedText,
            tone: settings.tone,
            depth: settings.depth,
            profession: settings.profession,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.status === 429) {
          const data = await response.json();
          const resetAt = data.resetAt ? new Date(data.resetAt) : new Date(now + HOUR_MS);
          const minutesLeft = Math.ceil((resetAt.getTime() - now) / 60000);
          chrome.runtime.sendMessage({
            type: 'SIMPLIFY_ERROR',
            errorCode: 'rate_limit',
            message: `Chill, I need a break. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
            resetAt: resetAt.toISOString(),
          } as ExtensionMessage);
          chrome.runtime.sendMessage({ type: 'SET_LOADING', isLoading: false } as ExtensionMessage);
          return;
        }

        if (!response.ok) {
          // Handle 400 text_too_long from backend (belt-and-suspenders; client already checks)
          const data = await response.json().catch(() => ({}));
          chrome.runtime.sendMessage({
            type: 'SIMPLIFY_ERROR',
            errorCode: (data.error === 'text_too_long') ? 'text_too_long' : 'ai_error',
            message: data.message ?? 'Something broke. Try again?',
          } as ExtensionMessage);
          chrome.runtime.sendMessage({ type: 'SET_LOADING', isLoading: false } as ExtensionMessage);
          return;
        }

        // 7. Stream SSE chunks — parse line by line
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        // Delete the original selected text immediately and create a text node placeholder
        range.deleteContents();
        const textNode = document.createTextNode('');
        range.insertNode(textNode);
        window.scrollTo(scrollX, scrollY); // Restore scroll position after DOM mutation

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.error) {
                // Stream-level error (timeout, ai_error)
                chrome.runtime.sendMessage({
                  type: 'SIMPLIFY_ERROR',
                  errorCode: payload.error === 'timeout' ? 'timeout' : 'ai_error',
                  message: payload.message ?? 'Something broke. Try again?',
                } as ExtensionMessage);
                chrome.runtime.sendMessage({ type: 'SET_LOADING', isLoading: false } as ExtensionMessage);
                return;
              }
              if (payload.chunk) {
                accumulated += payload.chunk;
                textNode.textContent = accumulated; // Update DOM in-place — word-by-word streaming
              }
              if (payload.done) {
                // Push to undo stack BEFORE clearing selectedText in storage
                undoStack.push({
                  originalText: selectedText,
                  simplifiedText: accumulated,
                  textNode: textNode,
                });
                renderButton(); // Update hasUndo state

                // Simplification complete — update rate limit count, clear loading, trigger fade
                chrome.storage.local.get(
                  ['simplifyCount', 'simplifyCountThisHour', 'hourWindowStart'],
                  (result) => {
                    chrome.storage.local.set({
                      isLoading: false,
                      selectedText: '',           // Hide button — user can select again
                      simplifyCount: (result.simplifyCount ?? 0) + 1,
                      simplifyCountThisHour: (result.simplifyCountThisHour ?? 0) + 1,
                      errorState: null,           // Clear any prior error
                      lastSimplifiedAt: Date.now(),
                    });
                  }
                );

                // Trigger brief highlight + fade using a span wrapper
                const span = document.createElement('span');
                span.setAttribute('data-twelvify-simplified', 'true');
                span.style.cssText =
                  'background: rgba(99, 102, 241, 0.2); border-radius: 3px; transition: background 1.5s ease;';
                textNode.parentNode?.insertBefore(span, textNode);
                span.appendChild(textNode);

                // Increment sync simplifyCount and check for onboarding prompt
                chrome.storage.sync.get(['simplifyCount'], (result) => {
                  const newCount = ((result.simplifyCount as number) ?? 0) + 1;
                  chrome.storage.sync.set({ simplifyCount: newCount });
                  // Check if onboarding prompt should show
                  renderOnboardingPromptIfNeeded(span); // span = the highlight span created after streaming
                });

                // Display mode routing — popup mode shows FloatingPopup instead of in-place text
                if (settings.displayMode === 'popup') {
                  // Revert the in-place DOM change (restore original, user sees popup instead)
                  textNode.textContent = selectedText; // Restore original
                  const popupContainer = document.createElement('div');
                  popupContainer.id = 'twelvify-popup-root';
                  document.body.appendChild(popupContainer);
                  const popupRoot = createRoot(popupContainer);
                  popupRoot.render(
                    createElement(FloatingPopup, {
                      simplifiedText: accumulated,
                      onClose: () => {
                        popupRoot.unmount();
                        popupContainer.remove();
                      },
                    })
                  );
                }

                setTimeout(() => {
                  span.style.background = 'transparent';
                  // Keep span in DOM (with data-twelvify-simplified attribute)
                  // so re-selecting this text triggers the downgrade label
                  setTimeout(() => {
                    span.style.cssText = '';
                  }, 1600);
                }, 100);
              }
            } catch {
              // Malformed SSE line — skip silently
            }
          }
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const error = err as Error;
        const isAbort = error.name === 'AbortError';
        chrome.runtime.sendMessage({
          type: 'SIMPLIFY_ERROR',
          errorCode: isAbort ? 'timeout' : 'offline',
          message: isAbort
            ? 'That took too long. Hit me again?'
            : 'Wow, no internet. Shocking.',
        } as ExtensionMessage);
        chrome.runtime.sendMessage({ type: 'SET_LOADING', isLoading: false } as ExtensionMessage);
      }
    }
  },
});
