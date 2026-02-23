// src/entrypoints/background.ts
// MV3 Service Worker — state manager and message router
// CRITICAL: All listeners at TOP LEVEL — never inside async functions

import type { ExtensionMessage, MessageResponse } from '../messaging/messages';
import { DEFAULT_STATE } from '../storage/types';

export default defineBackground(() => {
  // CRITICAL: Register listener at top level (not inside async callback)
  // Listeners registered inside async/promise callbacks are not guaranteed to fire
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: MessageResponse) => void) => {
      handleMessage(message, sendResponse);
      // Return true to indicate async response
      return true;
    }
  );

  // Initialize storage with defaults on first install
  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      chrome.storage.local.set(DEFAULT_STATE);
    }
  });
});

function handleMessage(
  message: ExtensionMessage,
  sendResponse: (response: MessageResponse) => void
): void {
  switch (message.type) {
    case 'TEXT_SELECTED':
      // Persist selection to storage — never use global variable
      chrome.storage.local.set(
        {
          selectedText: message.text,
          selectedAt: message.timestamp,
          isLoading: false,
        },
        () => {
          if (chrome.runtime.lastError) {
            sendResponse({ status: 'error', error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ status: 'received' });
          }
        }
      );
      break;

    case 'CLEAR_SELECTION':
      chrome.storage.local.set(
        { selectedText: '', selectedAt: null, isLoading: false },
        () => sendResponse({ status: 'received' })
      );
      break;

    case 'SET_LOADING':
      chrome.storage.local.set(
        { isLoading: message.isLoading },
        () => sendResponse({ status: 'received' })
      );
      break;

    default:
      sendResponse({ status: 'error', error: 'Unknown message type' });
  }
}
