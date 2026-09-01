import type { FinanceSnapshot } from 'src/features/finance/domain';

import { daysUntilIncome } from 'src/features/finance/domain/date';

export type FinanceHealth = 'safe' | 'watch' | 'risk';

export type ProjectionReasonCode =
  | 'healthy-buffer'
  | 'daily-limit-low'
  | 'reserves-exceed-liquid'
  | 'overdue-obligation'
  | 'cycle-stale'
  | 'missing-cycle-data';

export interface FinanceProjection {
  recordedIncome: number;
  spent: number;
  liquidBalance: number;
  unpaidObligationReserve: number;
  remainingGoalReserve: number;
  bufferReserve: number;
  safePool: number;
  remainingDays: number;
  safeToSpendPerDay: number;
  health: FinanceHealth;
  reasonCodes: ProjectionReasonCode[];
}

export function projectBudget(snapshot: FinanceSnapshot, today: string): FinanceProjection {
  if (!snapshot.cycle) {
    return {
      recordedIncome: 0,
      spent: 0,
      liquidBalance: 0,
      unpaidObligationReserve: 0,
      remainingGoalReserve: 0,
      bufferReserve: 0,
      safePool: 0,
      remainingDays: 1,
      safeToSpendPerDay: 0,
      health: 'risk',
      reasonCodes: ['missing-cycle-data'],
    };
  }

  const { cycle, transactions, obligations, goals, allocation } = snapshot;

  const incomeTransactions = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const recordedIncome = cycle.openingBalance + incomeTransactions;
  const liquidBalance = recordedIncome - spent;

  const unpaidObligations = obligations.filter((o) => o.status === 'unpaid');
  const unpaidObligationReserve = unpaidObligations.reduce((sum, o) => sum + o.amount, 0);

  const remainingGoalReserve = goals
    .filter((g) => g.status === 'active')
    .reduce((sum, g) => sum + Math.max(g.targetAmount - g.contributedAmount, 0), 0);

  const bufferReserve = allocation.bufferAmount;

  const safePool = Math.max(
    liquidBalance - unpaidObligationReserve - remainingGoalReserve - bufferReserve,
    0
  );

  const remainingDays = daysUntilIncome(today, cycle.nextIncomeOn);
  const safeToSpendPerDay = Math.floor(safePool / remainingDays);

  const reservesTotal = unpaidObligationReserve + remainingGoalReserve + bufferReserve;
  const reservesExceedLiquid = reservesTotal > liquidBalance;

  const hasOverdueObligation = unpaidObligations.some((o) => o.dueOn < today);
  const isCycleStale = today >= cycle.nextIncomeOn;

  let health: FinanceHealth = 'safe';
  const reasonCodes: ProjectionReasonCode[] = [];

  if (recordedIncome === 0 || safePool === 0 || reservesExceedLiquid || hasOverdueObligation) {
    health = 'risk';
  } else if (safeToSpendPerDay < 0.02 * recordedIncome || safePool < bufferReserve) {
    health = 'watch';
  }

  if (reservesExceedLiquid) reasonCodes.push('reserves-exceed-liquid');
  if (hasOverdueObligation) reasonCodes.push('overdue-obligation');
  if (isCycleStale) reasonCodes.push('cycle-stale');

  if (health === 'safe') reasonCodes.push('healthy-buffer');
  if (health === 'watch' && safeToSpendPerDay < 0.02 * recordedIncome)
    reasonCodes.push('daily-limit-low');

  return {
    recordedIncome,
    spent,
    liquidBalance,
    unpaidObligationReserve,
    remainingGoalReserve,
    bufferReserve,
    safePool,
    remainingDays,
    safeToSpendPerDay,
    health,
    reasonCodes,
  };
}
