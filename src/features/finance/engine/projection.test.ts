import type { Transaction } from 'src/features/finance/domain';

import { it, expect, describe } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { projectBudget } from './projection';

describe('projectBudget', () => {
  it('calculates the baseline default fixture correctly', () => {
    const snapshot = makeFinanceSnapshot();
    const result = projectBudget(snapshot, '2026-08-01');

    expect(result).toMatchObject({
      recordedIncome: 4000000,
      spent: 0,
      liquidBalance: 4000000,
      unpaidObligationReserve: 1350000,
      remainingGoalReserve: 500000,
      bufferReserve: 200000,
      safePool: 1950000,
      remainingDays: 10,
      safeToSpendPerDay: 195000,
      health: 'safe',
    });
    expect(result.reasonCodes).toContain('healthy-buffer');
  });

  it('calculates correctly with one expense', () => {
    const snapshot = makeFinanceSnapshot();
    const expense: Transaction = {
      id: '66666666-6666-4666-8666-666666666666',
      type: 'expense',
      amount: 450000,
      category: 'food',
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Makan',
      occurredOn: '2026-08-01',
      source: 'manual',
    };
    snapshot.transactions.push(expense);

    const result = projectBudget(snapshot, '2026-08-01');
    expect(result).toMatchObject({
      spent: 450000,
      safePool: 1500000,
      safeToSpendPerDay: 150000,
    });
  });

  it('does not reserve paid obligations and completed goals', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.obligations[0]!.status = 'paid';
    snapshot.goals[0]!.status = 'completed';

    const result = projectBudget(snapshot, '2026-08-01');
    expect(result).toMatchObject({
      unpaidObligationReserve: 350000,
      remainingGoalReserve: 0,
    });
  });

  it('clamps negative pool to zero', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.transactions.push({
      id: '77777777-7777-4777-8777-777777777777',
      type: 'expense',
      amount: 5000000,
      category: 'other',
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Big expense',
      occurredOn: '2026-08-01',
      source: 'manual',
    });

    const result = projectBudget(snapshot, '2026-08-01');
    expect(result.safePool).toBe(0);
    expect(result.safeToSpendPerDay).toBe(0);
    expect(result.health).toBe('risk');
  });

  it('increases liquid with income transaction', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.transactions.push({
      id: '88888888-8888-4888-8888-888888888888',
      type: 'income',
      amount: 1000000,
      category: 'allowance',
      createdAt: '2026-08-01T00:00:00Z',
      note: 'Bonus',
      occurredOn: '2026-08-01',
      source: 'manual',
    });

    const result = projectBudget(snapshot, '2026-08-01');
    expect(result.recordedIncome).toBe(5000000);
    expect(result.liquidBalance).toBe(5000000);
    expect(result.safePool).toBe(2950000);
  });

  it('exposes recurring income as a forecast without adding it to current liquid balance', () => {
    const snapshot = makeFinanceSnapshot();
    snapshot.cycle = { ...snapshot.cycle!, recurringIncome: 6000000 };

    const result = projectBudget(snapshot, '2026-08-01');

    expect(result.recurringIncome).toBe(6000000);
    expect(result.recordedIncome).toBe(4000000);
    expect(result.liquidBalance).toBe(4000000);
  });

  it('uses divisor 1 and adds cycle-stale reason after next income date', () => {
    const snapshot = makeFinanceSnapshot();
    const result = projectBudget(snapshot, '2026-08-12');

    expect(result.remainingDays).toBe(1);
    expect(result.safeToSpendPerDay).toBe(1950000); // safePool 1950000 / 1
    expect(result.reasonCodes).toContain('cycle-stale');
  });
});
