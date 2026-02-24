// src/messaging/messages.ts
// Type-safe message contracts between content scripts and service worker

export type MessageType =
  | 'TEXT_SELECTED'
  | 'CLEAR_SELECTION'
  | 'SET_LOADING'
  | 'SIMPLIFY_COMPLETE'
  | 'SIMPLIFY_ERROR';

export interface TextSelectedMessage {
  type: 'TEXT_SELECTED';
  text: string;
  timestamp: number;
}

export interface ClearSelectionMessage {
  type: 'CLEAR_SELECTION';
}

export interface SetLoadingMessage {
  type: 'SET_LOADING';
  isLoading: boolean;
}

export interface SimplifyCompleteMessage {
  type: 'SIMPLIFY_COMPLETE';
}

export interface SimplifyErrorMessage {
  type: 'SIMPLIFY_ERROR';
  errorCode: 'offline' | 'rate_limit' | 'timeout' | 'text_too_long' | 'ai_error' | 'unknown';
  message: string;        // Sarcastic user-facing message
  resetAt?: string;       // ISO string, only present for rate_limit errors
}

export type ExtensionMessage =
  | TextSelectedMessage
  | ClearSelectionMessage
  | SetLoadingMessage
  | SimplifyCompleteMessage
  | SimplifyErrorMessage;

export interface MessageResponse {
  status: 'received' | 'error';
  error?: string;
}
