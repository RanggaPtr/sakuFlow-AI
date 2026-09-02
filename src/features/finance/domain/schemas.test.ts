import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';
import {
  moneySchema,
  financeSnapshotSchema,
  persistenceEnvelopeSchema,
} from 'src/features/finance/domain';

describe('finance domain schemas', () => {
  it('accepts a valid snapshot', () => {
    expect(financeSnapshotSchema.parse(makeFinanceSnapshot())).toBeDefined();
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid rupiah value %s',
    (value) => expect(() => moneySchema.parse(value)).toThrow()
  );

  it('rejects an unknown schema version', () => {
    const envelope = {
      schemaVersion: 99,
      savedAt: new Date().toISOString(),
      data: makeFinanceSnapshot(),
    };
    expect(() => persistenceEnvelopeSchema.parse(envelope)).toThrow();
  });

  it('rejects duplicate entity IDs in a snapshot', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.transactions.push({
      id: snapshot.obligations[0]!.id,
      type: 'expense',
      amount: 100,
      category: 'other',
      occurredOn: '2026-08-01',
      note: 'Duplikat',
      source: 'manual',
      createdAt: '2026-08-01T00:00:00.000Z',
    });

    expect(() => financeSnapshotSchema.parse(snapshot)).toThrow();
  });

  it('requires a paid obligation to reference an existing transaction', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.obligations[0] = {
      ...snapshot.obligations[0]!,
      status: 'paid',
      paidTransactionId: '99999999-9999-4999-8999-999999999999',
    };

    expect(() => financeSnapshotSchema.parse(snapshot)).toThrow();
  });

  it('accepts a paid obligation when its payment transaction exists', () => {
    const snapshot = makeFinanceSnapshot();
    const paymentId = '99999999-9999-4999-8999-999999999999';
    snapshot.transactions.push({
      id: paymentId,
      type: 'expense',
      amount: snapshot.obligations[0]!.amount,
      category: 'housing',
      occurredOn: '2026-08-01',
      note: 'Bayar sewa',
      source: 'manual',
      createdAt: '2026-08-01T00:00:00.000Z',
    });
    snapshot.obligations[0] = {
      ...snapshot.obligations[0]!,
      status: 'paid',
      paidTransactionId: paymentId,
    };

    expect(financeSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });
});
