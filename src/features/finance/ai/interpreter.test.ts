import { it, vi, expect, describe, afterEach } from 'vitest';

import { fallbackInterpretation } from './fallback';
import { interpretTransactionText } from './interpreter';

describe('fallbackInterpretation', () => {
  it('extracts juta correctly', () => {
    expect(fallbackInterpretation('beli laptop 1.5jt')).toMatchObject({
      type: 'expense',
      amount: 1500000,
    });
  });

  it('extracts ribu correctly', () => {
    expect(fallbackInterpretation('makan 50k dong')).toMatchObject({
      type: 'expense',
      amount: 50000,
    });
  });

  it('detects income', () => {
    expect(fallbackInterpretation('dapat gaji 10jt')).toMatchObject({
      type: 'income',
      amount: 10000000,
    });
  });

  it('returns unknown for unparseable amount', () => {
    expect(fallbackInterpretation('beli makan')).toMatchObject({
      type: 'unknown',
    });
  });
});

describe('interpretTransactionText', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses fallback if API key is missing', async () => {
    const result = await interpretTransactionText('makan 50k');
    expect(result).toMatchObject({
      type: 'expense',
      amount: 50000,
    });
  });

  it('calls Gemini API and parses JSON response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  { text: '{"type":"expense","amount":50000,"category":"food","note":"makan"}' },
                ],
              },
            },
          ],
        }),
    });

    const result = await interpretTransactionText('makan 50k', 'fake-key');
    expect(global.fetch).toHaveBeenCalled();
    expect(result).toMatchObject({
      type: 'expense',
      amount: 50000,
      category: 'food',
    });
  });

  it('falls back if API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await interpretTransactionText('makan 50k', 'fake-key');
    expect(result).toMatchObject({
      type: 'expense',
      amount: 50000,
    });
  });
});
