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

  it('rejects deleting a transaction linked to a paid obligation', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot(),
      corruptRawValue: null,
    };
    const obligationId = state.snapshot.obligations[0]!.id;
    const payment = {
      id: '99999999-9999-4999-8999-999999999999',
      type: 'expense' as const,
      amount: 1000000,
      category: 'housing' as const,
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Pay rent',
      occurredOn: '2026-08-01',
      source: 'manual' as const,
    };
    const paidState = financeReducer(state, {
      type: 'mark-obligation-paid',
      obligationId,
      transaction: payment,
    });

    expect(
      financeReducer(paidState, { type: 'delete-transaction', transactionId: payment.id })
    ).toBe(paidState);
  });

  it('rejects deleting a savings transaction to avoid losing goal linkage', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot({
        goals: [{ ...makeFinanceSnapshot().goals[0]!, contributedAmount: 200000 }],
        transactions: [
          {
            id: '99999999-9999-4999-8999-999999999999',
            type: 'expense',
            amount: 200000,
            category: 'savings',
            createdAt: '2026-08-01T00:00:00Z',
            note: 'Savings',
            occurredOn: '2026-08-01',
            source: 'manual',
          },
        ],
      }),
      corruptRawValue: null,
    };

    expect(
      financeReducer(state, {
        type: 'delete-transaction',
        transactionId: '99999999-9999-4999-8999-999999999999',
      })
    ).toBe(state);
  });

  it('updates a transaction while preserving its identity and creation time', () => {
    const original = {
      id: '99999999-9999-4999-8999-999999999999',
      type: 'expense' as const,
      amount: 200000,
      category: 'food' as const,
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Makan lama',
      occurredOn: '2026-08-01',
      source: 'manual' as const,
    };
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot({ transactions: [original] }),
      corruptRawValue: null,
    };

    const nextState = financeReducer(state, {
      type: 'update-transaction',
      transactionId: original.id,
      transaction: {
        ...original,
        id: '88888888-8888-4888-8888-888888888888',
        amount: 300000,
        note: 'Makan baru',
      },
    });

    expect(nextState.snapshot.transactions).toEqual([
      { ...original, amount: 300000, note: 'Makan baru' },
    ]);
  });

  it('rejects editing savings transactions while goal contributions exist', () => {
    const savings = {
      id: '99999999-9999-4999-8999-999999999999',
      type: 'expense' as const,
      amount: 200000,
      category: 'savings' as const,
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Savings',
      occurredOn: '2026-08-01',
      source: 'manual' as const,
    };
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot({
        transactions: [savings],
        goals: [{ ...makeFinanceSnapshot().goals[0]!, contributedAmount: 200000 }],
      }),
      corruptRawValue: null,
    };

    expect(
      financeReducer(state, {
        type: 'update-transaction',
        transactionId: savings.id,
        transaction: { ...savings, note: 'Edited savings' },
      })
    ).toBe(state);
  });

  it('advances a due cycle atomically and records recurring income once', () => {
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: makeFinanceSnapshot({
        profile: { ...makeFinanceSnapshot().profile!, incomeDay: 11 },
        cycle: { ...makeFinanceSnapshot().cycle!, nextIncomeOn: '2026-08-11' },
      }),
      corruptRawValue: null,
    };
    const action: FinanceAction = {
      type: 'advance-cycle',
      cycleId: '88888888-8888-4888-8888-888888888888',
      today: '2026-08-11',
      transaction: {
        id: '99999999-9999-4999-8999-999999999999',
        type: 'income',
        category: 'salary',
        amount: 6000000,
        occurredOn: '2026-08-11',
        note: 'Pemasukan rutin',
        source: 'system',
        createdAt: '2026-08-11T00:00:00.000Z',
      },
    };

    const next = financeReducer(state, action);

    expect(next.snapshot.cycle).toMatchObject({
      id: action.cycleId,
      startsOn: '2026-08-11',
      nextIncomeOn: '2026-09-11',
      openingBalance: 4000000,
    });
    expect(next.snapshot.transactions).toContainEqual(action.transaction);
    expect(financeReducer(next, action)).toBe(next);
  });

  it('rejects early cycle advancement and clamps the next date at month end', () => {
    const base = makeFinanceSnapshot();
    const state: FinanceState = {
      hydration: 'ready',
      snapshot: {
        ...base,
        profile: { ...base.profile!, incomeDay: 31 },
        cycle: { ...base.cycle!, nextIncomeOn: '2026-08-31' },
      },
      corruptRawValue: null,
    };
    const early: FinanceAction = {
      type: 'advance-cycle',
      cycleId: '88888888-8888-4888-8888-888888888888',
      today: '2026-08-30',
      transaction: {
        id: '99999999-9999-4999-8999-999999999999',
        type: 'income',
        category: 'salary',
        amount: 6000000,
        occurredOn: '2026-08-30',
        note: 'Pemasukan rutin',
        source: 'system',
        createdAt: '2026-08-30T00:00:00.000Z',
      },
    };
    expect(financeReducer(state, early)).toBe(state);

    const due = {
      ...early,
      today: '2026-08-31',
      transaction: { ...early.transaction, occurredOn: '2026-08-31' },
    };
    expect(financeReducer(state, due).snapshot.cycle?.nextIncomeOn).toBe('2026-09-30');
  });
});
