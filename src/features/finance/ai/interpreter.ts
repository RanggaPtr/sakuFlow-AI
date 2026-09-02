import type { FinanceIntent } from './schema';

import { fallbackInterpretation } from './fallback';
import { financeIntentSchema, financeTextRequestSchema } from './schema';

export async function interpretTransactionText(text: string): Promise<FinanceIntent> {
  const input = financeTextRequestSchema.safeParse({ text });
  if (!input.success) return { type: 'unknown', reason: 'Input must be 1..500 characters' };

  try {
    const response = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.data),
    });

    if (!response.ok) {
      return fallbackInterpretation(input.data.text);
    }

    const data: unknown = await response.json();
    const parsed = financeIntentSchema.safeParse(data);
    return parsed.success ? parsed.data : fallbackInterpretation(input.data.text);
  } catch {
    return fallbackInterpretation(input.data.text);
  }
}
