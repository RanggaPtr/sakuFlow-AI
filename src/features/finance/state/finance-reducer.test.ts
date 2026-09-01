import type { FinanceState, FinanceAction } from './finance-reducer';

import { it, expect, describe } from 'vitest';

import { createEmptyFinanceSnapshot } from 'src/features/finance/domain';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { financeReducer } from './finance-reducer';

describe('financeReducer', () => {
  const getInitialState = (): FinanceState => ({
    hydration: 'idle',
    snapshot: createEmptyFinanceSnapshot(),
    corruptRawValue: null,
  });

  it('hydrates ready state', () => {
    const snapshot = makeFinanceSnapshot();
    const action: FinanceAction = { type: 'hydrate', result: { status: 'ready', snapshot } };
    const nextState = financeReducer(getInitialState(), action);
    expect(nextState.hydration).toBe('ready');
    expect(nextState.snapshot.profile?.id).toBe(snapshot.profile?.id);
  });

  it('adds transaction without mutating', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot(),
      corruptRawValue: null,
    };
    Object.freeze(state.snapshot);
    Object.freeze(state.snapshot.transactions);

    const action: FinanceAction = {
      type: 'add-transaction',
      transaction: {
        id: '99999999-9999-4999-8999-999999999999',
        type: 'expense',
        amount: 100,
        category: 'other',
        createdAt: '2026-08-01T00:00:00Z',
        note: 'test',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };
    const nextState = financeReducer(state, action);
    expect(nextState.snapshot.transactions).toHaveLength(1);
    expect(state.snapshot.transactions).toHaveLength(0); // prove immutability
  });

  it('marks obligation paid and attaches transaction', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot(),
      corruptRawValue: null,
    };
    const obligationId = state.snapshot.obligations[0]!.id; // Rent 1.000.000
    const action: FinanceAction = {
      type: 'mark-obligation-paid',
      obligationId,
      transaction: {
        id: '99999999-9999-4999-8999-999999999999',
        type: 'expense',
        amount: 1000000,
        category: 'housing',
        createdAt: '2026-08-01T00:00:00Z',
        note: 'Pay rent',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };
    const nextState = financeReducer(state, action);
    const ob = nextState.snapshot.obligations.find((o) => o.id === obligationId);
    expect(ob?.status).toBe('paid');
    expect(ob?.paidTransactionId).toBe(action.transaction.id);
    expect(nextState.snapshot.transactions).toContainEqual(action.transaction);
  });

  it('goal contribution reduces remaining goal reserve and liquid balance equally', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot(),
      corruptRawValue: null,
    };
    const goalId = state.snapshot.goals[0]!.id; // Laptop goal, 500k target
    const action: FinanceAction = {
      type: 'contribute-to-goal',
      goalId,
      amount: 200000,
      transaction: {
        id: '99999999-9999-4999-8999-999999999999',
        type: 'expense',
        amount: 200000,
        category: 'savings',
        createdAt: '2026-08-01T00:00:00Z',
        note: 'Savings',
        occurredOn: '2026-08-01',
        source: 'manual',
      },
    };
    const nextState = financeReducer(state, action);
    const goal = nextState.snapshot.goals.find((g) => g.id === goalId);
    expect(goal?.contributedAmount).toBe(200000);
    expect(goal?.status).toBe('active');
    expect(nextState.snapshot.transactions).toContainEqual(action.transaction);
  });
});
