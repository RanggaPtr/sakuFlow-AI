import { NextResponse } from 'next/server';

import { CONFIG } from 'src/global-config';
import { fallbackInterpretation } from 'src/features/finance/ai/fallback';
import { requestOpenAiCompatibleIntent } from 'src/features/finance/ai/provider';
import { financeAiResponseSchema, financeTextRequestSchema } from 'src/features/finance/ai/schema';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        intent: { type: 'unknown', reason: 'Input must be 1..500 characters' },
        source: 'local',
        confidence: 'medium',
        degraded: true,
      },
      { status: 400 }
    );
  }

  const input = financeTextRequestSchema.safeParse(payload);
  if (!input.success) {
    return NextResponse.json(
      {
        intent: { type: 'unknown', reason: 'Input must be 1..500 characters' },
        source: 'local',
        confidence: 'medium',
        degraded: true,
      },
      { status: 400 }
    );
  }

  const localFallback = fallbackInterpretation(input.data.text);
  if (!CONFIG.aiApiUrl)
    return NextResponse.json(
      financeAiResponseSchema.parse({
        intent: localFallback,
        source: 'local',
        confidence: 'medium',
        degraded: true,
      })
    );

  try {
    const intent = await requestOpenAiCompatibleIntent(input.data.text, {
      apiUrl: CONFIG.aiApiUrl,
      apiKey: CONFIG.aiApiKey,
      model: CONFIG.aiModel,
      timeoutMs: CONFIG.aiTimeoutMs,
    });
    return NextResponse.json(
      financeAiResponseSchema.parse({
        intent,
        source: 'external',
        confidence: 'high',
        degraded: false,
      })
    );
  } catch {
    return NextResponse.json(
      financeAiResponseSchema.parse({
        intent: localFallback,
        source: 'local',
        confidence: 'medium',
        degraded: true,
      })
    );
  }
}
