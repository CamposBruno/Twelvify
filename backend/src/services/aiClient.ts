import OpenAI from 'openai';
import { env } from '../config/env';
import { OPENAI_TIMEOUT_MS } from '../config/constants';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT_MS,
});

const SYSTEM_PROMPT = `You are a text simplification assistant. When given text, rewrite it so it's clear and easy to understand:
- Match the source language — simplify in whatever language the input is written in
- Preserve structure: paragraphs, bullet points, and headings stay intact
- Replace jargon with plain language (e.g. "myocardial infarction" → "heart attack")
- Keep numbers, dates, proper nouns (names, places, brands) unchanged
- Preserve code snippets, formulas, and technical notation exactly — only simplify surrounding prose
- Preserve rich formatting hints (bolded words, links) where possible
- Always use casual, friendly tone regardless of source formality
- Adjust simplification intensity based on source complexity — light edits for simple text, heavy rewrite for dense text
- Output ONLY the simplified text — no preamble, no explanations, no quotes`;

export async function* streamSimplification(text: string): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Cost-efficient; upgrade to gpt-4-turbo if quality insufficient
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
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
