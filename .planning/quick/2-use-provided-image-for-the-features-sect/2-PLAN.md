---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - landing/src/components/Features.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "The Features section right column shows the plant image instead of a grey placeholder"
    - "The zine-box styling and rotation animation are preserved"
  artifacts:
    - path: "landing/src/components/Features.tsx"
      provides: "Features section with real plant image"
      contains: "img"
  key_links:
    - from: "landing/src/components/Features.tsx"
      to: "landing/public/images/features-plant.png"
      via: "img src attribute"
      pattern: "/images/features-plant\\.png"
---

<objective>
Replace the placeholder icon in the Features section right column with the actual plant image.

Purpose: The features-plant.png image is ready in public/images/ and should be shown to visitors instead of a grey box with a placeholder icon.
Output: Features.tsx updated — img tag renders the plant image inside the existing zine-box wrapper.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@landing/src/components/Features.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace placeholder with plant image</name>
  <files>landing/src/components/Features.tsx</files>
  <action>
    In Features.tsx, replace lines 67-69 (the inner placeholder div containing the Icon):

    FROM:
    ```tsx
    <div className="w-full h-64 bg-slate-100 border-2 border-slate-900 flex items-center justify-center">
      <Icon name="image" className="w-24 h-24 text-slate-300" />
    </div>
    ```

    TO:
    ```tsx
    <img
      src="/images/features-plant.png"
      alt="Twelvify features illustration"
      className="w-full h-64 object-cover border-2 border-slate-900"
    />
    ```

    Keep the outer `<div className="zine-box p-2 bg-white rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500">` wrapper unchanged.

    After the replacement, check whether the Icon import (line 1) is still used elsewhere in the file. If the only usage was the removed placeholder, remove the import line to avoid an unused import warning.

    Looking at the file: Icon is also used in the three feature list items (lines 28, 39, 49), so keep the import.
  </action>
  <verify>
    1. Run `cd /Users/brunocampos/Twelvify/landing && npm run build` — should complete with no TypeScript or Vite errors.
    2. Inspect the built output or dev server to confirm the img tag is present in the Features section HTML.
  </verify>
  <done>
    Features.tsx renders an img pointing to /images/features-plant.png inside the zine-box wrapper. The placeholder div and Icon name="image" are removed. Build succeeds with no errors.
  </done>
</task>

</tasks>

<verification>
- `npm run build` exits 0 with no errors
- Features.tsx contains `src="/images/features-plant.png"` and no longer contains `Icon name="image"`
- The zine-box outer div and rotation classes are unchanged
</verification>

<success_criteria>
The plant image is displayed in the Features section right column. The zine-box tilt/hover animation still works. Build passes cleanly.
</success_criteria>

<output>
After completion, create `.planning/quick/2-use-provided-image-for-the-features-sect/2-SUMMARY.md` with what was changed and the commit hash.
</output>
