// Analytics helper — Plausible script injected via index.html (see Task 2)
// Plausible exposes window.plausible for custom events.

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export function trackPageView(): void {
  // Plausible auto-tracks page views when the script loads.
  // This function exists as a hook for future SPA-style navigation tracking.
  // For now it is a no-op — Plausible handles initial page view automatically.
}

export function trackEvent(
  eventName: string,
  props?: Record<string, string>
): void {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(eventName, props ? { props } : undefined);
  }
}
