---
phase: quick-3
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - landing/src/constants.ts
autonomous: true
requirements:
  - QUICK-3
must_haves:
  truths:
    - "Landing page CTA buttons link to the actual Chrome Web Store listing"
    - "Nav, Hero, and CallToAction all use the real store URL"
  artifacts:
    - path: "landing/src/constants.ts"
      provides: "CHROME_STORE_URL pointing to real Chrome Web Store listing"
      contains: "chromewebstore.google.com/detail/twelveify"
  key_links:
    - from: "landing/src/constants.ts"
      to: "landing/src/components/Nav.tsx, Hero.tsx, CallToAction.tsx"
      via: "CHROME_STORE_URL import"
      pattern: "CHROME_STORE_URL"
---

<objective>
Update the CHROME_STORE_URL constant to the real Chrome Web Store listing URL now that the extension has been submitted and approved.

Purpose: The landing page CTA buttons currently link to a generic Chrome Web Store placeholder. Replacing this with the actual extension listing URL enables visitors to install Twelvify directly.
Output: Updated constants.ts with the real store URL; no other files need to change since all components import from this single constant.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update CHROME_STORE_URL to real listing URL</name>
  <files>landing/src/constants.ts</files>
  <action>
    Replace the placeholder value with the actual Chrome Web Store listing URL.

    Current value:
      export const CHROME_STORE_URL = 'https://chrome.google.com/webstore';

    New value:
      export const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/twelveify/afgdlnnljnnjdkjbfbdlfgpkadifkcig';

    No other files need updating — Nav.tsx, Hero.tsx, and CallToAction.tsx all import CHROME_STORE_URL from this file.
  </action>
  <verify>grep "afgdlnnljnnjdkjbfbdlfgpkadifkcig" landing/src/constants.ts</verify>
  <done>constants.ts contains the full chromewebstore.google.com URL with the correct extension ID; grep returns the updated line</done>
</task>

</tasks>

<verification>
After the task completes:
1. grep "afgdlnnljnnjdkjbfbdlfgpkadifkcig" landing/src/constants.ts — should return the updated constant
2. Confirm no other hardcoded chrome.google.com/webstore references remain in landing/src/: grep -r "chrome.google.com/webstore" landing/src/ should return nothing
</verification>

<success_criteria>
- CHROME_STORE_URL equals "https://chromewebstore.google.com/detail/twelveify/afgdlnnljnnjdkjbfbdlfgpkadifkcig"
- All three consumer components (Nav, Hero, CallToAction) inherit the updated URL with no changes required
- No residual placeholder URL in source files
</success_criteria>

<output>
After completion, create `.planning/quick/3-update-landing-page-with-chrome-web-stor/3-SUMMARY.md`
</output>
