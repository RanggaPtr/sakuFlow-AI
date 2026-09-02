import { it, vi, expect, describe } from 'vitest';

import { requestOpenAiCompatibleIntent } from './provider';

describe('requestOpenAiCompatibleIntent', () => {
  it('uses the documented chat-completions adapter and bearer authentication', async () => {
    const fetcher = vi.fn(
      async (_url: string, _init: RequestInit) =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    type: 'expense',
                    amount: 50000,
                    category: 'food',
                    note: 'Makan siang',
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );

    const result = await requestOpenAiCompatibleIntent(
      'makan siang 50k',
      {
        apiUrl: 'https://ai.example.test/v1',
        apiKey: 'server-secret',
        model: 'finance-model',
        timeoutMs: 1000,
      },
      fetcher
    );

    expect(result).toEqual({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan siang',
    });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe('https://ai.example.test/v1/chat/completions');
    expect(url).not.toContain('server-secret');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer server-secret' });
    expect(JSON.parse(String(init.body))).toMatchObject({ model: 'finance-model' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('rejects malformed provider output at the boundary', async () => {
    const fetcher = vi.fn(
      async (_url: string, _init: RequestInit) =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: '{"type":"expense","amount":-1}' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    );

    await expect(
      requestOpenAiCompatibleIntent(
        'makan 50k',
        { apiUrl: 'https://ai.example.test/v1', model: 'finance-model', timeoutMs: 1000 },
        fetcher
      )
    ).rejects.toThrow();
  });
});
