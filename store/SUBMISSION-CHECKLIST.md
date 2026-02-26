# Twelvify Chrome Web Store Submission Checklist

**Generated:** 2026-02-26
**Extension version:** 0.1.0 (manifest) / v1.2.0 product milestone

## Pre-Submission Validation

- [x] Extension builds successfully (`npm run build`)
- [x] Manifest permissions: `storage` only (+ `host_permissions` for backend URL)
- [x] No `<all_urls>` in host_permissions (content_scripts.matches is separate — expected)
- [x] Icons: 16, 32, 48, 128px PNGs confirmed in build output (`.output/chrome-mv3/assets/icons/`)
- [x] Extension ZIP created: `store/twelvify-v1.2.0.zip` (102KB)
- [x] 5 screenshots at 1280x800px confirmed: `store/screenshots/*.png`
- [ ] Privacy policy live at https://twelvify.com/privacy (HTTP 200) — **PREREQUISITE: deploy landing site first**
- [x] Store listing copy ready: `store/listing.md`

> **Note:** Privacy policy returned HTTP 404 at time of checklist generation. The landing site must be deployed
> to Vercel before submission. Run `git push origin main` from the landing directory, then verify
> https://twelvify.com/privacy returns HTTP 200 before uploading to Chrome Developer Dashboard.

## Store Listing Information

**Title:** Twelvify — Big words, simplified. AI text simplifier.
**Summary:** Highlight any confusing text, click the wand — AI rewrites it in plain English. Instantly.
**Privacy Policy URL:** https://twelvify.com/privacy
**Category:** Productivity
**Language:** English

## Chrome Developer Dashboard Steps

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload ZIP: `store/twelvify-v1.2.0.zip`
4. Fill in "Store listing" tab:
   - Title: (copy from listing.md)
   - Summary: (copy from listing.md)
   - Description: (copy full description block from listing.md)
   - Category: Productivity
   - Language: English
   - Upload 5 screenshots from store/screenshots/*.png (in order 1-5)
   - Upload 128px icon from src/assets/icons/icon128.png (for store listing icon)
5. Fill in "Privacy" tab:
   - Privacy Policy URL: https://twelvify.com/privacy
   - Single purpose: "Simplify selected text on any webpage using AI"
   - Data usage: User activity (text selection) — processed transiently, not stored
6. Fill in "Payments" tab:
   - Free
7. Click "Submit for review"

## Post-Submission Actions

- [ ] Monitor review status in Chrome Developer Dashboard (1-3 business days)
- [ ] After approval: Note the assigned extension ID (chrome-extension://[ID])
- [ ] After approval: Update Render env var ALLOWED_ORIGINS to include `chrome-extension://[assigned-ID]`
  See: STATE.md blocker note — current ALLOWED_ORIGINS is wildcard `*`
- [ ] After approval: Update CHROME_STORE_URL constant in landing/src/constants.ts with the actual store URL
- [ ] Publish within 30 days of approval (submissions revert to draft after 30 days)
