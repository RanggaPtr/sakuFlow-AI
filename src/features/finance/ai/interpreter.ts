import type { FinanceIntent } from './schema';

import { fallbackInterpretation } from './fallback';
import { financeAiResponseSchema, financeTextRequestSchema } from './schema';

export type InterpretationSource = 'external' | 'fallback';
export type InterpretationConfidence = 'high' | 'medium';
export type InterpretedFinanceIntent = FinanceIntent & {
  source?: InterpretationSource;
  confidence?: InterpretationConfidence;
  degraded?: boolean;
};

function fallback(text: string): InterpretedFinanceIntent {
  return {
    ...fallbackInterpretation(text),
    source: 'fallback',
    confidence: 'medium',
    degraded: true,
  };
}

export async function interpretTransactionText(text: string): Promise<InterpretedFinanceIntent> {
  const input = financeTextRequestSchema.safeParse({ text });
  if (!input.success)
    return {
      type: 'unknown',
      reason: 'Input must be 1..500 characters',
      source: 'fallback',
      confidence: 'medium',
      degraded: true,
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
    const responseData = financeAiResponseSchema.safeParse(data);
    if (!responseData.success) return fallback(input.data.text);
    return {
      ...responseData.data.intent,
      source: responseData.data.source === 'external' ? 'external' : 'fallback',
      confidence: responseData.data.confidence,
      degraded: responseData.data.degraded,
    };
  } catch {
    return fallback(input.data.text);
  }
}
