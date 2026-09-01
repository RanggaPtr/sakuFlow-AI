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
});
