import { it, expect, describe } from 'vitest';

import { isTransactionType } from './transaction-dialog';

describe('isTransactionType', () => {
  it('accepts only transaction types supported by the finance domain', () => {
    expect(isTransactionType('expense')).toBe(true);
    expect(isTransactionType('income')).toBe(true);
    expect(isTransactionType('transfer')).toBe(false);
  });
});
