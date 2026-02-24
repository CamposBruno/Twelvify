// src/utils/undoStack.ts
// In-memory undo stack for text simplification reversals.
//
// IMPORTANT: This stack is intentionally NOT persisted to chrome.storage.
// It lives entirely in memory, scoped to a single content script instance.
// All entries are lost on page navigation — content scripts are destroyed when
// the user navigates away, so there is nothing to persist.
//
// Usage: Create ONE instance per page load in content.ts, then push entries
// as each text node is simplified. Call revertLast() on undo action.

/**
 * A single simplification operation that can be undone.
 * Holds a direct reference to the live DOM Text node that was mutated during
 * SSE streaming (the `textNode` variable in content.ts). This avoids needing
 * Range serialization — the node reference remains valid as long as the page
 * has not navigated.
 */
export interface UndoEntry {
  /** The text that existed in the DOM before simplification */
  originalText: string;
  /** The simplified text that replaced the original */
  simplifiedText: string;
  /** Direct reference to the DOM Text node that was replaced */
  textNode: Text;
}

/**
 * LIFO stack of simplification operations for a single page load.
 *
 * Design constraints:
 * - In-memory only — MUST NOT be persisted to chrome.storage
 * - One instance per content script (per page load)
 * - Thread-safe is not a concern in content scripts (single JS thread)
 */
export class UndoStack {
  private stack: UndoEntry[] = [];

  /**
   * Push a new simplification entry onto the stack.
   * Called immediately after each text node replacement completes.
   */
  push(entry: UndoEntry): void {
    this.stack.push(entry);
  }

  /**
   * Remove and return the most recent entry, or undefined if empty.
   */
  pop(): UndoEntry | undefined {
    return this.stack.pop();
  }

  /**
   * Return the most recent entry without removing it, or undefined if empty.
   */
  peek(): UndoEntry | undefined {
    return this.stack[this.stack.length - 1];
  }

  /**
   * Return true if no entries are present.
   */
  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  /**
   * Return the number of entries currently on the stack.
   */
  size(): number {
    return this.stack.length;
  }

  /**
   * Remove all entries from the stack without reverting any DOM changes.
   * Call this when the user navigates (though content scripts are destroyed
   * on navigation so this is mainly useful for testing or explicit resets).
   */
  clear(): void {
    this.stack = [];
  }

  /**
   * Revert the most recent simplification by restoring the original text
   * directly in the DOM Text node.
   *
   * @returns true if a simplification was reverted, false if the stack was empty
   *          (safe to call unconditionally — no-op on empty stack)
   */
  revertLast(): boolean {
    const entry = this.pop();
    if (!entry) return false;
    // Restore original text directly in the live DOM node.
    // The textNode reference is valid for the lifetime of the page.
    entry.textNode.textContent = entry.originalText;
    return true;
  }

  /**
   * Check if the current DOM selection overlaps with any simplified text node
   * in the stack. Used to decide whether to show the level-down label
   * (re-simplify) vs the default "Simplify" label.
   */
  selectionContainsSimplified(): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().trim().length <= 3) return false;
    const range = sel.getRangeAt(0);
    for (const entry of this.stack) {
      if (range.intersectsNode(entry.textNode)) return true;
    }
    return false;
  }
}
