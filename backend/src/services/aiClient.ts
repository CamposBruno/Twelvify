import OpenAI from 'openai';
import { env } from '../config/env';
import { OPENAI_TIMEOUT_MS } from '../config/constants';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT_MS,
});

type ToneLevel = 'baby' | 5 | 12 | 18 | 'big_boy';

interface SimplifyOptions {
  tone: ToneLevel;
  depth: 'light' | 'medium' | 'detailed';
  profession: string;
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  baby: 'Rewrite for a toddler. Use the simplest words possible, very short sentences. Explain everything like the reader has never heard of any of these concepts. Use analogies to everyday objects a small child would know.',
  '5': 'Rewrite for a 5-year-old. Use simple everyday words, short sentences, and fun comparisons. Avoid any technical terms — explain concepts through things a kindergartner would understand.',
  '12': 'Rewrite for a 12-year-old. Use clear, straightforward language a middle schooler would understand. Replace jargon with plain language (e.g. "myocardial infarction" → "heart attack"). Keep it conversational.',
  '18': 'Rewrite for an 18-year-old / young adult. Simplify dense or academic language but keep moderate complexity. Technical terms are fine if they are common knowledge — only replace truly obscure jargon.',
  big_boy: 'Light rewrite for an educated adult. Keep most terminology intact but improve clarity and readability. Untangle convoluted sentences, remove unnecessary filler, but preserve technical precision.',
};

const DEPTH_INSTRUCTIONS: Record<string, string> = {
  light: 'Make minimal changes — only clarify the most confusing parts. Keep as close to the original as possible.',
  medium: 'Moderate rewrite — simplify throughout but preserve the overall structure and key details.',
  detailed: 'Thorough rewrite — restructure for maximum clarity. Break down complex ideas step by step. Add brief explanations for concepts that might be unfamiliar.',
};

function buildSystemPrompt(options: SimplifyOptions): string {
  const toneKey = String(options.tone);
  const toneInstruction = TONE_INSTRUCTIONS[toneKey] ?? TONE_INSTRUCTIONS['12'];
  const depthInstruction = DEPTH_INSTRUCTIONS[options.depth] ?? DEPTH_INSTRUCTIONS['medium'];
  const professionLine = options.profession
    ? `\n- The reader's background: "${options.profession}" — use familiar terms from their field when helpful, and explain concepts outside their expertise more carefully.`
    : '';

  return `You are a text simplification assistant.

**Tone:** ${toneInstruction}

**Depth:** ${depthInstruction}
${professionLine}
**Rules:**
- Match the source language — simplify in whatever language the input is written in
- Preserve structure: paragraphs, bullet points, and headings stay intact
- Keep numbers, dates, proper nouns (names, places, brands) unchanged
- Preserve code snippets, formulas, and technical notation exactly — only simplify surrounding prose
- Preserve rich formatting hints (bolded words, links) where possible
- Output ONLY the simplified text — no preamble, no explanations, no quotes`;
}

export async function* streamSimplification(text: string, options: SimplifyOptions): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(options) },
      { role: 'user', content: text },
    ],
    stream: true,
    max_tokens: 2000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}
