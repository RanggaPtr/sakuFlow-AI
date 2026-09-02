import type { FinanceState } from './finance-reducer';
import type { FinanceProjection } from 'src/features/finance/engine';

import { projectBudget } from 'src/features/finance/engine';
import { compareTransactionsByDateDesc } from 'src/features/finance/domain';

export function selectIsOnboarded(state: FinanceState): boolean {
  return state.snapshot.profile !== null && state.snapshot.cycle !== null;
}

export function selectProjection(state: FinanceState, today: string): FinanceProjection | null {
  if (!selectIsOnboarded(state)) return null;
  return projectBudget(state.snapshot, today);
}

export function selectRecentTransactions(state: FinanceState, limit: number) {
  return [...state.snapshot.transactions].sort(compareTransactionsByDateDesc).slice(0, limit);
}

export function selectUnpaidObligations(state: FinanceState) {
  return state.snapshot.obligations.filter((o) => o.status === 'unpaid');
}

export function selectActiveGoals(state: FinanceState) {
  return state.snapshot.goals.filter((g) => g.status === 'active');
}
