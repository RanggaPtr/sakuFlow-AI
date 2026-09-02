import { it, expect, describe } from 'vitest';

import { obligationCategoryToTransactionCategory } from './categories';

describe('obligationCategoryToTransactionCategory', () => {
  it.each([
    ['housing', 'housing'],
    ['utilities', 'housing'],
    ['debt', 'debt'],
    ['subscription', 'other'],
    ['education', 'education'],
    ['other', 'other'],
  ] as const)('maps %s obligations to the %s transaction category', (obligation, transaction) => {
    expect(obligationCategoryToTransactionCategory(obligation)).toBe(transaction);
  });
});
