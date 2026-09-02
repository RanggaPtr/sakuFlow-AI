import type { FinanceIntent } from './schema';

import { z } from 'zod';

import { SYSTEM_PROMPT } from './prompt';
import { financeIntentSchema, financeTextRequestSchema } from './schema';

export interface OpenAiCompatibleConfig {
  apiUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export type AiFetcher = (url: string, init: RequestInit) => Promise<Response>;

const providerResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().min(1) }) })).min(1),
});

function chatCompletionsUrl(apiUrl: string): string {
  const normalized = apiUrl.replace(/\/+$/, '');
  return normalized.endsWith('/chat/completions') ? normalized : `${normalized}/chat/completions`;
}

export async function requestOpenAiCompatibleIntent(
  text: string,
  config: OpenAiCompatibleConfig,
  fetcher: AiFetcher = (url, init) => fetch(url, init)
): Promise<FinanceIntent> {
  const input = financeTextRequestSchema.parse({ text });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  try {
    const response = await fetcher(chatCompletionsUrl(config.apiUrl), {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input.text },
        ],
      }),
    });

    if (!response.ok) throw new Error('AI provider request failed');

    const providerPayload: unknown = await response.json();
    const content = providerResponseSchema.parse(providerPayload).choices[0]!.message.content;
    const providerIntent: unknown = JSON.parse(content);
    return financeIntentSchema.parse(providerIntent);
  } finally {
    clearTimeout(timeout);
  }
}
