import { SYSTEM_PROMPT } from './prompt';
import { fallbackInterpretation } from './fallback';

export type FinanceIntent =
  | { type: 'expense'; amount: number; category: string; note: string }
  | { type: 'income'; amount: number; category: string; note: string }
  | { type: 'unknown'; reason: string };

export async function interpretTransactionText(
  text: string,
  apiKey?: string
): Promise<FinanceIntent> {
  if (!text || text.trim() === '') {
    return { type: 'unknown', reason: 'Empty input' };
  }

  if (!apiKey) {
    return fallbackInterpretation(text);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return fallbackInterpretation(text);
    }

    const parsed = JSON.parse(resultText);
    if (parsed.type === 'expense' || parsed.type === 'income' || parsed.type === 'unknown') {
      return parsed as FinanceIntent;
    }

    return fallbackInterpretation(text);
  } catch {
    return fallbackInterpretation(text);
  }
}
