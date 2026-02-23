---
status: diagnosed
trigger: "Simplify button not appearing on text selection"
created: 2026-02-23T00:00:00Z
updated: 2026-02-23T00:00:00Z
---

## Current Focus

hypothesis: Race condition between showPopover() call and React component rendering the popover element
test: Traced the full execution flow from selectionchange -> message -> storage -> render -> showPopover
expecting: showPopover() is called before FloatingButton renders the DOM element
next_action: Report diagnosis

## Symptoms

expected: User selects 10+ characters on any webpage, a floating "Simplify" button appears
actual: No button ever appears regardless of text selection
errors: None reported (silent failure)
reproduction: Select any text on any webpage with the extension loaded
started: Has never worked (Phase 01 initial implementation)

## Eliminated

- hypothesis: Content script not registered in manifest
  evidence: Built manifest.json includes content_scripts entry with matches ["<all_urls>"] and js ["content-scripts/content.js"]. Build output confirms content.js exists.
  timestamp: 2026-02-23

- hypothesis: Content script code not compiled correctly
  evidence: Built content.js (70k+ tokens) contains selectionchange listener, showPopover, hidePopover, and FloatingButton code.
  timestamp: 2026-02-23

- hypothesis: Missing permissions
  evidence: Manifest has "storage" permission. content_scripts with <all_urls> does not require host_permissions.
  timestamp: 2026-02-23

## Evidence

- timestamp: 2026-02-23
  checked: content.ts line 73-74 -- showPopover() call timing
  found: showPopover() is called inside the chrome.runtime.sendMessage callback, AFTER background responds with { status: 'received' }
  implication: showPopover runs after the background has written to storage but BEFORE the storage onChanged event propagates to the content script React component

- timestamp: 2026-02-23
  checked: FloatingButton.tsx lines 26-28 -- conditional rendering
  found: Component returns null when selectedText is empty/falsy. The popover div with id="twelvify-floating-btn" only exists in the DOM when selectedText is truthy.
  implication: showPopover() looks for #twelvify-floating-btn which does not exist yet because React has not re-rendered

- timestamp: 2026-02-23
  checked: useStorage.ts -- chrome.storage.onChanged listener
  found: Hook listens to chrome.storage.onChanged and calls setValue on change. This is async and triggers a React state update + re-render cycle.
  implication: There is no synchronization between the sendMessage response callback (which calls showPopover) and the storage change event (which triggers React re-render to create the DOM element)

- timestamp: 2026-02-23
  checked: content.ts showPopover() function (lines 34-39)
  found: getElementById('twelvify-floating-btn') returns null because React component has not rendered the element yet. The if-check silently swallows this (no error logged).
  implication: Silent failure -- no error, no button, no indication of what went wrong

- timestamp: 2026-02-23
  checked: The overall architecture of state flow
  found: Two separate state channels are used without synchronization. Channel 1: message passing (content -> background -> content callback -> showPopover). Channel 2: storage (background writes -> storage.onChanged -> React state -> re-render -> DOM element created). showPopover depends on Channel 2 completing but is triggered by Channel 1 completing.
  implication: This is the root cause -- an architectural race condition

## Resolution

root_cause: |
  **Race condition between popover show and React render.**

  The FloatingButton component conditionally renders -- it returns `null` when
  `selectedText` is empty (FloatingButton.tsx:26-28). The popover DOM element
  (`#twelvify-floating-btn`) only exists after React re-renders with a truthy
  `selectedText` value from chrome.storage.

  The execution sequence is:
  1. User selects text
  2. content.ts sends TEXT_SELECTED message to background
  3. background.ts writes selectedText to chrome.storage.local
  4. background.ts sends response { status: 'received' }
  5. content.ts receives response, calls showPopover()       <-- HERE
  6. showPopover() does getElementById('twelvify-floating-btn') -- returns NULL
  7. (Later) chrome.storage.onChanged fires in content script
  8. useStorageValue hook updates React state
  9. React re-renders FloatingButton with the popover element
  10. But showPopover() already ran and found nothing

  Step 5 always executes before steps 7-9 because the sendMessage callback
  fires from the same event that triggers the storage write, while the
  onChanged event must round-trip through Chrome's storage event system
  and then trigger a React re-render cycle.

  **Secondary issue:** Even if the timing were fixed, the architecture has a
  fundamental mismatch -- using two separate async channels (message response
  for flow control, storage for UI state) without any synchronization between
  them.

fix: (not applied -- diagnosis only)
verification: (not applied -- diagnosis only)
files_changed: []
