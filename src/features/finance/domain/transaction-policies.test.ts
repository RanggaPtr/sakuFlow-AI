import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from '../test/fixtures';
import { canDeleteTransaction, canModifyTransaction } from './transaction-policies';

describe('transaction mutation policies', () => {
  it('blocks linked obligation payments with a visible reason', () => {
    const snapshot = makeFinanceSnapshot();
    const payment = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      type: 'expense' as const,
      category: 'housing' as const,
      amount: 1000000,
      occurredOn: '2026-08-05',
      note: 'Rent',
      source: 'manual' as const,
      createdAt: '2026-08-05T00:00:00.000Z',
    };
    const linked = {
      ...snapshot,
      transactions: [payment],
      obligations: [
        { ...snapshot.obligations[0]!, status: 'paid' as const, paidTransactionId: payment.id },
      ],
    };
    expect(canModifyTransaction(payment, linked)).toMatchObject({ allowed: false });
    expect(canDeleteTransaction(payment, linked)).toMatchObject({
      allowed: false,
      reason: expect.stringContaining('tanggungan'),
    });
  });

  it('blocks savings mutations while a goal has contribution', () => {
    const snapshot = makeFinanceSnapshot({
      goals: [{ ...makeFinanceSnapshot().goals[0]!, contributedAmount: 100000 }],
    });
    const savings = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      type: 'expense' as const,
      category: 'savings' as const,
      amount: 100000,
      occurredOn: '2026-08-05',
      note: 'Nabung',
      source: 'manual' as const,
      createdAt: '2026-08-05T00:00:00.000Z',
    };
    expect(canModifyTransaction(savings, { ...snapshot, transactions: [savings] })).toMatchObject({
      allowed: false,
    });
    expect(canDeleteTransaction(savings, { ...snapshot, transactions: [savings] })).toMatchObject({
      allowed: false,
    });
  });
});
