import { NextResponse } from 'next/server';

import { CONFIG } from 'src/global-config';
import { fallbackInterpretation } from 'src/features/finance/ai/fallback';
import { financeTextRequestSchema } from 'src/features/finance/ai/schema';
import { requestOpenAiCompatibleIntent } from 'src/features/finance/ai/provider';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { type: 'unknown', reason: 'Input must be 1..500 characters' },
      { status: 400 }
    );
  }

  const input = financeTextRequestSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      { type: 'unknown', reason: 'Input must be 1..500 characters' },
      { status: 400 }
    );
  }

  const localFallback = fallbackInterpretation(input.data.text);
  if (!CONFIG.aiApiUrl) return NextResponse.json(localFallback);

  try {
    const intent = await requestOpenAiCompatibleIntent(input.data.text, {
      apiUrl: CONFIG.aiApiUrl,
      apiKey: CONFIG.aiApiKey,
      model: CONFIG.aiModel,
      timeoutMs: CONFIG.aiTimeoutMs,
    });
    return NextResponse.json(intent);
  } catch {
    return NextResponse.json(localFallback);
  }
}
