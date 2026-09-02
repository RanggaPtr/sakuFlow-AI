import { it, vi, expect, describe } from 'vitest';

import { POST } from './route';

const { requestIntent } = vi.hoisted(() => ({ requestIntent: vi.fn() }));

vi.mock('src/global-config', () => ({
  CONFIG: {
    aiApiUrl: 'https://provider.test',
    aiApiKey: undefined,
    aiModel: 'test',
    aiTimeoutMs: 100,
  },
}));
vi.mock('src/features/finance/ai/provider', () => ({
  requestOpenAiCompatibleIntent: requestIntent,
}));

describe('POST /api/ai/parse', () => {
  it('returns validated external provenance on provider success', async () => {
    requestIntent.mockResolvedValue({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan',
    });
    const response = await POST(
      new Request('http://localhost/api/ai/parse', {
        method: 'POST',
        body: JSON.stringify({ text: 'makan 50k' }),
      })
    );
    expect(await response.json()).toEqual({
      intent: { type: 'expense', amount: 50000, category: 'food', note: 'Makan' },
      source: 'external',
      confidence: 'high',
      degraded: false,
    });
  });

  it('returns validated local degraded provenance when provider fails', async () => {
    requestIntent.mockRejectedValue(new Error('offline'));
    const response = await POST(
      new Request('http://localhost/api/ai/parse', {
        method: 'POST',
        body: JSON.stringify({ text: 'makan 50k' }),
      })
    );
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.degraded).toBe(true);
    expect(body.intent).toMatchObject({ type: 'expense', amount: 50000 });
  });
});
