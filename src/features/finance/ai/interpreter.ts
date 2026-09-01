import { fallbackInterpretation } from './fallback';

export type FinanceIntent =
  | { type: 'expense'; amount: number; category: string; note: string }
  | { type: 'income'; amount: number; category: string; note: string }
  | { type: 'unknown'; reason: string };

export async function interpretTransactionText(text: string): Promise<FinanceIntent> {
  if (!text || text.trim() === '') {
    return { type: 'unknown', reason: 'Empty input' };
  }

  try {
    const response = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      return fallbackInterpretation(text);
    }

    const data = await response.json();
    return data as FinanceIntent;
  } catch {
    return fallbackInterpretation(text);
  }
}
