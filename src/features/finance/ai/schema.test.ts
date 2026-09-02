import { it, expect, describe } from 'vitest';

import { financeIntentSchema } from './schema';

describe('financeIntentSchema', () => {
  it.each([
    {
      type: 'add_obligation',
      name: 'Sewa',
      amount: 1000000,
      dueOn: '2026-08-10',
      category: 'housing',
    },
    { type: 'create_goal', name: 'Laptop', targetAmount: 5000000, category: 'device' },
    { type: 'simulate_purchase', amount: 250000, note: 'Sepatu' },
    { type: 'ask_summary', question: 'Bagaimana kondisi saya?' },
    { type: 'mark_obligation_paid', obligationName: 'Sewa', amount: 1000000 },
  ])('accepts supported non-transaction intent %s', (intent) => {
    expect(financeIntentSchema.parse(intent)).toEqual(intent);
  });
});
