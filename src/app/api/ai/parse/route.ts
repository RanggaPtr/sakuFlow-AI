import type { FinanceIntent } from 'src/features/finance/ai/interpreter';

import { NextResponse } from 'next/server';

// Note: In Next.js App Router, we can't easily reuse the exact interpretTransactionText
// if it's strictly a client/server agnostic function, but since it's just a function,
// we can move the actual fetch to the server.
// Actually, let's implement the Gemini call directly here so we can use process.env.GEMINI_API_KEY.
import { SYSTEM_PROMPT } from 'src/features/finance/ai/prompt';
import { fallbackInterpretation } from 'src/features/finance/ai/fallback';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ type: 'unknown', reason: 'Empty input' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(fallbackInterpretation(text));
    }

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
      return NextResponse.json(fallbackInterpretation(text));
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return NextResponse.json(fallbackInterpretation(text));
    }

    const parsed = JSON.parse(resultText);
    if (parsed.type === 'expense' || parsed.type === 'income' || parsed.type === 'unknown') {
      return NextResponse.json(parsed as FinanceIntent);
    }

    return NextResponse.json(fallbackInterpretation(text));
  } catch (error) {
    return NextResponse.json({ type: 'unknown', reason: 'Server error' });
  }
}
