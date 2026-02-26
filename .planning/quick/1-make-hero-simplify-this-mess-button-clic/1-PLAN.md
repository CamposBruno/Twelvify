---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - landing/src/components/Hero.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Clicking SIMPLIFY THIS MESS button triggers a typing animation"
    - "Original text is replaced character-by-character with the simplified version"
    - "Animation starts fresh on each click"
  artifacts:
    - path: "landing/src/components/Hero.tsx"
      provides: "Hero with interactive simplify button"
      contains: "useState"
  key_links:
    - from: "SIMPLIFY THIS MESS button"
      to: "typing animation state"
      via: "onClick handler sets isSimplified and triggers char-by-char interval"
      pattern: "setInterval.*charAt"
---

<objective>
Make the "SIMPLIFY THIS MESS" button in the Hero browser mockup interactive with a typing animation effect.

Purpose: Demonstrates the core Twelvify value proposition directly on the landing page — visitors see the product working before they install it.
Output: Hero.tsx with useState, onClick handler, and character-by-character typing animation.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add typing animation to the SIMPLIFY THIS MESS button in Hero.tsx</name>
  <files>landing/src/components/Hero.tsx</files>
  <action>
    Convert Hero from a stateless function to one that uses `useState` and `useRef` (import both from 'react').

    Add state:
    ```ts
    const [displayText, setDisplayText] = useState(
      'The wave function is a mathematical description of the quantum state of an isolated quantum system.'
    );
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    ```

    Define constants at the top of the component (inside the function):
    ```ts
    const ORIGINAL_TEXT = 'The wave function is a mathematical description of the quantum state of an isolated quantum system.';
    const SIMPLIFIED_TEXT = 'A wave function is just math that describes how tiny particles behave when left alone.';
    ```

    Add a `handleSimplify` function:
    ```ts
    const handleSimplify = () => {
      if (isAnimating) return;
      // Clear any leftover interval
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAnimating(true);
      setDisplayText('');
      let i = 0;
      intervalRef.current = setInterval(() => {
        i += 1;
        setDisplayText(SIMPLIFIED_TEXT.slice(0, i));
        if (i >= SIMPLIFIED_TEXT.length) {
          clearInterval(intervalRef.current!);
          setIsAnimating(false);
        }
      }, 30);
    };
    ```

    Update the JSX:
    - Replace the hardcoded text inside the red `<div>` with `{displayText}`.
    - Add `onClick={handleSimplify}` to the "SIMPLIFY THIS MESS" button `<div>`.
    - Change the button cursor: add `cursor-pointer` Tailwind class to the button `<div>` (the one with `absolute -bottom-8 -right-4`).
    - Optionally add `select-none` to the button `<div>` to prevent text selection on rapid clicks.
    - Do NOT add any hover animation or visual change beyond what already exists — keep the existing `rotate-6` etc.

    Typing interval is 30ms per character (fast, snappy feel). The function guard `if (isAnimating) return` prevents double-click re-triggering mid-animation.
  </action>
  <verify>
    Run the landing dev server:
    ```
    cd /Users/brunocampos/Twelvify/landing && npm run dev
    ```
    Then visit http://localhost:5173, observe the browser mockup on the right, click "SIMPLIFY THIS MESS" and confirm the text types out character by character replacing the original quantum text.
  </verify>
  <done>
    - Clicking the button replaces "The wave function is a mathematical description..." with "A wave function is just math that describes how tiny particles behave when left alone." via a 30ms/char typing effect.
    - Clicking again while animation is in progress does nothing (guarded).
    - No TypeScript errors (npm run build passes).
  </done>
</task>

</tasks>

<verification>
```bash
cd /Users/brunocampos/Twelvify/landing && npm run build
```
Build must complete with zero TypeScript errors. The Hero component must compile cleanly with the new state and animation logic.
</verification>

<success_criteria>
- Hero.tsx imports `useState` and `useRef` from 'react'
- SIMPLIFY THIS MESS button has `onClick={handleSimplify}` and `cursor-pointer`
- Text in red mockup block is driven by `displayText` state
- Typing animation plays at 30ms/char on click
- `npm run build` passes with no errors
</success_criteria>

<output>
After completion, create `.planning/quick/1-make-hero-simplify-this-mess-button-clic/1-SUMMARY.md` with what was built, files modified, and any notes.
</output>
