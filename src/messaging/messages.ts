// src/messaging/messages.ts
// Type-safe message contracts between content scripts and service worker

export type MessageType = 'TEXT_SELECTED' | 'CLEAR_SELECTION' | 'SET_LOADING';

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

export type ExtensionMessage =
  | TextSelectedMessage
  | ClearSelectionMessage
  | SetLoadingMessage;

export interface MessageResponse {
  status: 'received' | 'error';
  error?: string;
}
