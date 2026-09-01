import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { simulatePurchase } from './simulate-purchase';

describe('simulatePurchase', () => {
  it('simulates a safe purchase', () => {
    const snapshot = makeFinanceSnapshot();
    const result = simulatePurchase({ snapshot, today: '2026-08-01', amount: 100000 });

    expect(result.verdict).toBe('safe');
    expect(result.before.safePool).toBe(1950000);
    expect(result.after.safePool).toBe(1850000);
    expect(result.impact.safePoolChange).toBe(-100000);
  });

  it('simulates a tight purchase leaving less than half of daily limit', () => {
    const snapshot = makeFinanceSnapshot();
    const result = simulatePurchase({ snapshot, today: '2026-08-01', amount: 1800000 });

    expect(result.verdict).toBe('tight');
    expect(result.after.safeToSpendPerDay).toBe(15000);
    expect(result.impact.dailyLimitChange).toBe(-180000);
  });

  it('simulates an unsafe purchase crossing safe pool', () => {
    const snapshot = makeFinanceSnapshot();
    const result = simulatePurchase({ snapshot, today: '2026-08-01', amount: 2000000 });

    expect(result.verdict).toBe('unsafe');
    expect(result.after.safePool).toBe(0);
  });

  it('throws an error for zero or negative amount', () => {
    const snapshot = makeFinanceSnapshot();
    expect(() => simulatePurchase({ snapshot, today: '2026-08-01', amount: 0 })).toThrow();
    expect(() => simulatePurchase({ snapshot, today: '2026-08-01', amount: -100000 })).toThrow();
  });
});
