import type { Transaction } from 'src/features/finance/domain';
import type { FinanceState, FinanceAction } from './finance-reducer';

import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { financeReducer } from './finance-reducer';

function reduceMalformed(state: FinanceState, action: unknown) {
  return financeReducer(state, action as FinanceAction);
}

describe('financeReducer validations', () => {
  const getInitialState = (): FinanceState => ({
    hydration: 'ready',
    snapshot: makeFinanceSnapshot(),
    corruptRawValue: null,
  });

  const validTransaction: Transaction = {
    id: '99999999-9999-4999-8999-999999999999',
    type: 'expense',
    amount: 100,
    category: 'other',
    createdAt: '2026-08-01T00:00:00.000Z',
    note: 'test',
    occurredOn: '2026-08-01',
    source: 'manual',
  };

  it('rejects duplicate transaction ID', () => {
    const state = getInitialState();
    state.snapshot.transactions.push(validTransaction);
    const action: FinanceAction = {
      type: 'add-transaction',
      transaction: { ...validTransaction, amount: 200 },
    };

    expect(financeReducer(state, action)).toBe(state);
  });

  it('rejects duplicate obligation ID', () => {
    const state = getInitialState();
    const existingObligation = state.snapshot.obligations[0]!;
    const action: FinanceAction = {
      type: 'add-obligation',
      obligation: { ...existingObligation, amount: 200 },
    };

    expect(financeReducer(state, action)).toBe(state);
  });

  it('rejects unknown transaction ID for delete', () => {
    const state = getInitialState();
    const action: FinanceAction = {
      type: 'delete-transaction',
      transactionId: '99999999-9999-4999-8999-999999999999',
    };

    expect(financeReducer(state, action)).toBe(state);
  });

  it.each([
    ['UUID', { ...validTransaction, id: 'not-a-uuid' }],
    ['fractional money', { ...validTransaction, amount: 10.5 }],
    ['unsafe money', { ...validTransaction, amount: Number.MAX_SAFE_INTEGER + 1 }],
    ['category', { ...validTransaction, category: 'invented' }],
    ['note', { ...validTransaction, note: '' }],
    ['source', { ...validTransaction, source: 'provider' }],
    ['date', { ...validTransaction, occurredOn: '2026-02-30' }],
  ])('rejects a transaction with malformed %s without mutating state', (_field, transaction) => {
    const state = getInitialState();
    const before = structuredClone(state);

    const nextState = reduceMalformed(state, { type: 'add-transaction', transaction });

    expect(nextState).toBe(state);
    expect(state).toEqual(before);
  });

  it('rejects malformed obligation and goal candidates without mutating state', () => {
    const state = getInitialState();
    const before = structuredClone(state);
    const obligation = { ...state.snapshot.obligations[0]!, dueOn: 'tomorrow' };
    const goal = { ...state.snapshot.goals[0]!, targetAmount: 50.5 };

    expect(reduceMalformed(state, { type: 'add-obligation', obligation })).toBe(state);
    expect(reduceMalformed(state, { type: 'add-goal', goal })).toBe(state);
    expect(state).toEqual(before);
  });

  it('rejects over-contribution to goal', () => {
    const state = getInitialState();
    const goal = state.snapshot.goals[0]!;
    const amount = goal.targetAmount - goal.contributedAmount + 1;
    const action: FinanceAction = {
      type: 'contribute-to-goal',
      goalId: goal.id,
      amount,
      transaction: { ...validTransaction, amount, category: 'savings' },
    };

    expect(financeReducer(state, action)).toBe(state);
  });

  it('rejects obligation category mismatch', () => {
    const state = getInitialState();
    const obligation = state.snapshot.obligations.find((item) => item.category === 'housing')!;
    const action: FinanceAction = {
      type: 'mark-obligation-paid',
      obligationId: obligation.id,
      transaction: { ...validTransaction, amount: obligation.amount, category: 'education' },
    };

    expect(financeReducer(state, action)).toBe(state);
  });
});
