export interface OnboardingPromptDef {
  id: 'tone' | 'depth' | 'profession';
  title: string;
  description: string;
  triggerAt: number;  // simplifyCount threshold to first show
}

export const PROMPTS: OnboardingPromptDef[] = [
  {
    id: 'tone',
    title: 'How old should I talk?',
    description: 'Set the age-level you prefer. We default to 12 — that\'s our thing.',
    triggerAt: 3,
  },
  {
    id: 'depth',
    title: 'How deep should I go?',
    description: 'Light = quick overview. Medium = balanced. Detailed = full explanation.',
    triggerAt: 6,
  },
  {
    id: 'profession',
    title: 'What\'s your background?',
    description: 'Tell me what you do — I\'ll use relatable analogies. ("I\'m a nurse", "I do marketing")',
    triggerAt: 9,
  },
];

/**
 * Returns the next onboarding prompt to show, or null if none are pending.
 * A prompt is shown if: simplifyCount >= prompt.triggerAt AND prompt.id not in dismissedPrompts.
 * Returns the FIRST eligible prompt (respects PROMPTS order: tone → depth → profession).
 */
export function getNextOnboardingPrompt(
  simplifyCount: number,
  dismissedPrompts: string[]
): OnboardingPromptDef | null {
  const eligible = PROMPTS.filter(
    (p) => simplifyCount >= p.triggerAt && !dismissedPrompts.includes(p.id)
  );
  return eligible[0] ?? null;
}
