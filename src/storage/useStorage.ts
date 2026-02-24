// src/storage/useStorage.ts
// React hook for reading/writing chrome.storage.local in UI components

import { useState, useEffect } from 'react';

export function useStorageValue<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // Read initial value
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key] as T);
      }
    });

    // Listen for changes from background script
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key] !== undefined) {
        setValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  const updateValue = async (newValue: T): Promise<void> => {
    setValue(newValue);
    await chrome.storage.local.set({ [key]: newValue });
  };

  return [value, updateValue];
}

// ─── Sync Storage Hook ──────────────────────────────────────────────────────
//
// useStorageSyncValue mirrors useStorageValue but targets chrome.storage.sync
// instead of chrome.storage.local. Use this for user preferences (UserSettings)
// that must survive browser restarts and sync across profiles.
//
// Key distinction: chrome.storage.onChanged fires for BOTH local AND sync areas.
// The listener MUST check `areaName === 'sync'` before acting, or local-storage
// changes will incorrectly trigger sync hook re-renders.

/**
 * React hook for reading/writing a value in chrome.storage.sync.
 *
 * Designed for user preferences (UserSettings) that should persist across
 * sessions and sync across devices. Contrast with useStorageValue which
 * uses chrome.storage.local for ephemeral runtime state.
 *
 * @param key - Storage key to read/write
 * @param defaultValue - Value to use when key is absent (first install)
 * @returns [value, setter] — identical API to useStorageValue
 */
export function useStorageSyncValue<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // Read initial value from sync storage
    chrome.storage.sync.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key] as T);
      }
    });

    // Listen for changes — but ONLY for the 'sync' area.
    // chrome.storage.onChanged fires for both local and sync areas.
    // Without the areaName check, local writes would incorrectly trigger
    // this sync hook's re-renders.
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'sync' && changes[key] !== undefined) {
        setValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  const updateValue = async (newValue: T): Promise<void> => {
    setValue(newValue);
    await chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, updateValue];
}

/**
 * Initializes chrome.storage.sync with default values on first install.
 *
 * Only sets keys that are not already present — preserves any existing user
 * preferences. Call this from the service worker's `runtime.onInstalled` handler.
 *
 * @example
 * // In background.ts onInstalled handler:
 * import { DEFAULT_SETTINGS } from '../storage/types';
 * await initSyncDefaults(DEFAULT_SETTINGS as unknown as Record<string, unknown>);
 *
 * @param defaults - Object whose keys/values to write if absent in sync storage
 */
export async function initSyncDefaults(defaults: Record<string, unknown>): Promise<void> {
  const existing = await new Promise<Record<string, unknown>>((resolve) =>
    chrome.storage.sync.get(null, (result) => resolve(result))
  );
  const toSet: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }
  if (Object.keys(toSet).length > 0) {
    await new Promise<void>((resolve) => chrome.storage.sync.set(toSet, resolve));
  }
}
