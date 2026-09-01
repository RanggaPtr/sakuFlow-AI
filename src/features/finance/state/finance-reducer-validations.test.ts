import type { FinanceState } from './finance-reducer';

import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { financeReducer } from './finance-reducer';

describe('financeReducer validations', () => {
  const getInitialState = (): FinanceState => ({
    hydration: 'ready',
    snapshot: makeFinanceSnapshot(),
    corruptRawValue: null,
  });

  it('rejects duplicate transaction ID', () => {
    const state = getInitialState();
    const existingTx = {
      id: 'existing-id',
      type: 'expense' as const,
      amount: 100,
      category: 'other' as const,
      createdAt: '2026-08-01T00:00:00Z',
      note: 'test',
      occurredOn: '2026-08-01',
      source: 'manual' as const,
    };
    state.snapshot.transactions.push(existingTx);

    const action: any = {
      type: 'add-transaction',
      transaction: { ...existingTx, amount: 200 },
    };

    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });

  it('rejects duplicate obligation ID', () => {
    const state = getInitialState();
    const existingOb = state.snapshot.obligations[0]!;

    const action: any = {
      type: 'add-obligation',
      obligation: { ...existingOb, amount: 200 },
    };

    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });

  it('rejects unknown transaction ID for delete', () => {
    const state = getInitialState();
    const action: any = { type: 'delete-transaction', transactionId: 'unknown-id' };
    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });

  it('rejects invalid transaction amount (<= 0)', () => {
    const state = getInitialState();
    const action: any = {
      type: 'add-transaction',
      transaction: {
        id: 'new-id',
        type: 'expense',
        amount: 0,
        category: 'other',
        createdAt: '2026-08-01T00:00:00Z',
        note: 'test',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };

    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });

  it('rejects over-contribution to goal', () => {
    const state = getInitialState();
    const goal = state.snapshot.goals[0]!;

    const amount = goal.targetAmount - goal.contributedAmount + 1; // over-contribute

    const action: any = {
      type: 'contribute-to-goal',
      goalId: goal.id,
      amount,
      transaction: {
        id: 'new-id',
        type: 'expense',
        amount,
        category: 'savings',
        createdAt: '2026-08-01T00:00:00Z',
        note: 'test',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };

    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });

  it('rejects obligation category mismatch', () => {
    const state = getInitialState();
    // Assuming obligations[0] is 'housing'
    const ob = state.snapshot.obligations.find((o) => o.category === 'housing')!;

    const action: any = {
      type: 'mark-obligation-paid',
      obligationId: ob.id,
      transaction: {
        id: 'new-id',
        type: 'expense',
        amount: ob.amount,
        category: 'education', // mismatch
        createdAt: '2026-08-01T00:00:00Z',
        note: 'test',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };

    const nextState = financeReducer(state, action);
    expect(nextState).toBe(state);
  });
});
