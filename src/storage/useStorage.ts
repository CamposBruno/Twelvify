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
