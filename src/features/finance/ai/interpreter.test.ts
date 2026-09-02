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

  it.each([
    ['tagihan listrik 200rb', 'add_obligation'],
    ['target laptop 5jt', 'create_goal'],
    ['simulasi beli sepatu 750rb', 'simulate_purchase'],
    ['ringkas kondisi keuangan', 'ask_summary'],
    ['tandai sewa lunas 1jt', 'mark_obligation_paid'],
  ])('recognizes supported action %s', (text, type) => {
    expect(fallbackInterpretation(text)).toMatchObject({ type });
  });
});

describe('interpretTransactionText', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls /api/ai/parse and returns parsed JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          type: 'expense',
          amount: 50000,
          category: 'food',
          note: 'Makan',
        }),
    });

    const result = await interpretTransactionText('makan 50k');
    expect(global.fetch).toHaveBeenCalledWith('/api/ai/parse', expect.any(Object));
    expect(result).toMatchObject({
      type: 'expense',
      amount: 50000,
      category: 'food',
    });
  });

  it('falls back if API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await interpretTransactionText('makan 50k');
    expect(result).toMatchObject({
      type: 'expense',
      amount: 50000,
    });
  });

  it('validates the internal API response before returning it', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          type: 'expense',
          amount: -50000,
          category: 'provider-invented-category',
          note: '',
        }),
    });

    const result = await interpretTransactionText('makan 50k');

    expect(result).toMatchObject({ type: 'expense', amount: 50000, category: 'other' });
  });

  it('rejects text longer than 500 characters without calling the server', async () => {
    global.fetch = vi.fn();

    const result = await interpretTransactionText('x'.repeat(501));

    expect(result).toEqual({ type: 'unknown', reason: 'Input must be 1..500 characters' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
