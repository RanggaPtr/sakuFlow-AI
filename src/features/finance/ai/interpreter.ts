import type { FinanceIntent } from './schema';

import { fallbackInterpretation } from './fallback';
import { financeIntentSchema, financeTextRequestSchema } from './schema';

export type InterpretationSource = 'external' | 'fallback';
export type InterpretationConfidence = 'high' | 'medium';
export type InterpretedFinanceIntent = FinanceIntent & {
  source?: InterpretationSource;
  confidence?: InterpretationConfidence;
};

function fallback(text: string): InterpretedFinanceIntent {
  return { ...fallbackInterpretation(text), source: 'fallback', confidence: 'medium' };
}

export async function interpretTransactionText(text: string): Promise<InterpretedFinanceIntent> {
  const input = financeTextRequestSchema.safeParse({ text });
  if (!input.success)
    return {
      type: 'unknown',
      reason: 'Input must be 1..500 characters',
      source: 'fallback',
      confidence: 'medium',
    };

  try {
    const response = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
    });

    if (!response.ok) {
      return fallback(input.data.text);
    }

    const data: unknown = await response.json();
    const parsed = financeIntentSchema.safeParse(data);
    return parsed.success
      ? { ...parsed.data, source: 'external', confidence: 'high' }
      : fallback(input.data.text);
  } catch {
    return fallback(input.data.text);
  }
}
