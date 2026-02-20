# Features Research Summary: Twelveify

**Date:** 2026-02-20
**Status:** COMPLETE
**Confidence:** HIGH

---

## Key Findings

### 1. Table Stakes Are Commoditized
Text simplification extensions (Rewordify, Text Simplifier, Simplify AI) all offer basic core functionality:
- Select text → click → get simplified version
- Work on any website
- Free or freemium tier

**Implication:** Twelveify must launch with these basics or lose to existing tools. No competitive advantage here.

### 2. Personalization Is The Market Gap
**None of the competitors offer personalization based on user profile.**
- Rewordify: Fixed output, select difficulty level upfront
- Text Simplifier: One mode, no user preferences
- Simplify: 3 preset modes (Simplify/Explain/Summarize), not personalized
- QuillBot: General paraphrasing, not simplification-specific

Twelveify's differentiator: Adjusting tone (casual/formal), explanation depth, and background-specific analogies based on learned user preferences.

**Implication:** Personalization is NOT table stakes yet; it's a competitive moat. Invest heavily here.

### 3. UX Matters More Than Simplification Quality
- Rewordify's simplification is excellent but loses users because:
  - Pop-up display (read rewrite in modal, switch context back)
  - Upfront difficulty selection (friction)
  - No web extension (bookmarklet only)
- Text Simplifier has simpler quality but wins on UX (in-page replacement, keyboard shortcut)

**Implication:** In-page text replacement as default is non-negotiable for v1. Quality ≥ Display, but display < UI friction.

### 4. Progressive Onboarding Beats Upfront Setup
Users don't want to fill out a preference form before using the extension. They want:
1. Use the tool with defaults (e.g., casual tone, medium depth)
2. Refine preferences gradually over first 5 uses
3. Trust learned preferences because they came from their own behavior

This is a key differentiator vs. Rewordify's "pick your reading level now" approach.

**Implication:** Invest in onboarding UX. It's not "nice to have"; it directly impacts activation and retention.

### 5. Accessibility Market Demands Domain-Specific Simplification
Research on ESL learners, dyslexic readers, and ADHD users shows:
- One-size-fits-all simplification fails
- Learners need vocabulary choices matched to their proficiency
- Explanation structure varies by cognitive style (ADHD users prefer shorter sentences; ESL learners prefer idiom explanation)

None of the competitors address this explicitly.

**Implication:** High-value market segment. Twelveify's "personalized by background" positioning is aligned with accessibility research. This is a defensible differentiator.

### 6. Learning Integration Is Rewordify's Moat (Not Ours)
Rewordify offers:
- Flashcards from simplified text
- Vocabulary quizzes
- Learning Sessions (interactive vocab teaching)
- Educator dashboards

This is a complete learning platform, not a simplification tool. Twelveify doesn't need to compete here for v1.

**Implication:** Don't build learning integration in MVP. It's a v1.x+ feature. Compete on personalization instead.

### 7. Click-to-Define Closes the Loop
Users simplify text but encounter unfamiliar words in the rewrite. Competitors don't offer inline dictionary access within the simplified output.

Quick feature win: Hover over word in simplified text → see definition tooltip.

**Implication:** Add to v1.1. Validates that personalized rewrites work. Bridges gap between simplification and understanding.

### 8. Rate Limiting Is User-Acceptable
Freemium models:
- Rewordify: Completely free
- Text Simplifier: 5/day free
- Simplify: 20/month free
- Twelveify: 10-20/day is reasonable

Users expect some limit on free tier; paywall too early loses adoption.

**Implication:** Rate limit is cost control and growth lever, not a friction point (at 10-20/day).

### 9. PDF Support Is High-Demand but Deferred
Users ask for it; Text Simplifier supports it via OCR. But:
- Adds complexity (OCR, text extraction)
- Most MVP usage will be web articles/docs
- Prioritize only if 15%+ of demand

**Implication:** Measure PDF requests in v1. Prioritize for v1.1 only if demand is clear.

### 10. Privacy-First Is Table Stakes for Accessibility Tools
Accessibility users (dyslexic, ADHD, ESL learners) are sensitive to privacy. They expect:
- "Your text is not saved on our servers"
- Anonymous usage analytics only
- No user accounts required

Twelveify's positioning as privacy-first is an explicit differentiator.

**Implication:** Make this clear in onboarding. It's a trust-building message, not a technical feature.

---

## Roadmap Implications

### Phase 1: MVP Launch (Core Loop)
**What to build:**
1. Text selection + click-to-simplify (P0)
2. In-page text replacement (P0)
3. One personalized rewrite mode with tone adjustment (P1)
4. Progressive onboarding (learn tone over 3-5 uses) (P1)
5. Rate limiting + free tier (P1)

**What NOT to build:**
- Learning integration
- PDF support
- Summarization mode
- Multiple simultaneous rewrite modes
- User accounts/cloud sync

**Why this order:** Core loop must work first. Personalization (tone) is the differentiator. Progressive onboarding is UX polish that boosts retention. Everything else is premature.

### Phase 2: Validation & Differentiation (v1.1)
**Trigger:** Core loop is live, 500+ beta users, usage metrics show personalization demand.

**What to build:**
1. Click-to-define within simplified text (validates learning loop)
2. Explanation depth adjustment (light/detailed) (if tone is popular)
3. Profession/interest-based analogies (if personalization data is rich)
4. Dark mode UI

**Why this order:** These features compound on personalization. Only build them if v1 metrics show they're valued.

### Phase 3+: Market Expansion (v2+)
- Learning integration (post-product-market-fit)
- PDF support (if 15%+ demand)
- User accounts & cloud sync (if monetization strategy emerges)
- Multilingual support (v2)
- Summarization (if separate product)

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| **Table Stakes** | HIGH | Verified against 6 competitors; consistent across all products |
| **Personalization Gap** | HIGH | Zero competitors offer user-profile-based personalization; research confirms demand (accessibility literature) |
| **In-Page Display** | MEDIUM-HIGH | UX researchers note it reduces context switching; Text Simplifier shows adoption benefits; not measured vs. popup directly |
| **Progressive Onboarding** | MEDIUM | Not explicitly researched; inferred from Rewordify's friction point. Validate with early users. |
| **Profession-based Analogies** | MEDIUM | High differentiator potential but complex. No competitor data. Validate demand before heavy investment. |
| **PDF Support** | MEDIUM | Users ask for it; feasibility confirmed (Text Simplifier does it). Demand level unknown. |
| **Learning Integration** | HIGH | Rewordify owns this; research confirms demand. Not a Twelveify differentiator for v1. |
| **ESL/Accessibility Segment** | HIGH | Peer-reviewed research confirms. Market gap clear. Twelveify positioned well. |

---

## Questions for Phase-Specific Research

1. **Personalization depth:** How many user preferences before simplification quality suffers? (Does 2 preferences beat 5?)
2. **Tone space:** Beyond casual/formal, what other tone dimensions matter? (Supportive/direct, technical/everyday?)
3. **Explanation depth:** Light vs. detailed—what's the performance sweet spot for retention?
4. **ESL market:** Is ESL-specific personalization a v1 or v1.x feature? (Might require separate linguistic tuning.)
5. **Profession/interest analogies:** Can LLMs generate these reliably, or do they need curated examples?
6. **Rate limiting UX:** Do users notice / complain about 10 vs. 20 vs. unlimited per day?
7. **PDF demand:** What % of MVP usage would be PDFs if supported?

---

## Risk Factors

1. **AI model quality risk:** Simplification quality depends entirely on AI provider. Poor model = product failure regardless of UX.
   - Mitigation: Evaluate Claude, GPT-4, and open models early. Have fallback plan.

2. **Privacy vs. personalization tension:** Profiling users = collecting data. How to personalize without violating privacy commitment?
   - Mitigation: Local storage only. Don't send profile data to backend. Personalization happens on client side.

3. **Personalization backfire:** Incorrect preference learning = bad rewrites. Users blame product, not themselves.
   - Mitigation: Show users what profile you've learned; let them override. Measure satisfaction by persona.

4. **Competitor commoditization:** If QuillBot adds simplification or Text Simplifier adds tone, gap closes.
   - Mitigation: Speed to market. Personalization is hard to copy. Lock in early users.

5. **ESL/accessibility segment niche:** If Twelveify positions too narrowly, total addressable market shrinks.
   - Mitigation: Launch as general simplification tool. ESL/accessibility is enrichment, not pivot. Position as "simplification for everyone."

---

## Next Steps for Roadmap

1. **Validate P0 features:** Confirm in-page replacement is preferred UX (vs. popup/side panel).
2. **Estimate API costs:** Model cost per simplification at 10/day free tier + 100K beta users.
3. **Define AI evaluation criteria:** What makes a "good" simplification? Rubric for comparing models.
4. **Design onboarding flow:** Sketch progressive preference learning (tone learned how? After how many uses?).
5. **Plan Phase 1 scope:** Core loop only. Set explicit P1, P2, P3 cutoffs to avoid scope creep.

---

*Research completed: 2026-02-20*
*Full details in: .planning/research/FEATURES.md*
