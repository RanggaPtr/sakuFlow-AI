import type { FinanceProjection } from './projection';
import type { Transaction, FinanceSnapshot } from 'src/features/finance/domain';

import { projectBudget } from './projection';

export type SimulationReasonCode = 'daily-limit-impacted' | 'pool-depleted' | 'safe-purchase';

export interface PurchaseSimulationInput {
  snapshot: FinanceSnapshot;
  today: string;
  amount: number;
}

export interface PurchaseSimulationResult {
  verdict: 'safe' | 'tight' | 'unsafe';
  before: FinanceProjection;
  after: FinanceProjection;
  impact: {
    safePoolChange: number;
    dailyLimitChange: number;
  };
  reasonCodes: SimulationReasonCode[];
}

export function simulatePurchase(input: PurchaseSimulationInput): PurchaseSimulationResult {
  const { snapshot, today, amount } = input;

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('Purchase amount must be a positive integer');
  }

  const before = projectBudget(snapshot, today);
  const simulationTransaction: Transaction = {
    id: '99999999-9999-4999-8999-999999999999',
    type: 'expense',
    category: 'other',
    amount,
    occurredOn: today,
    note: 'Simulation',
    source: 'simulation',
    createdAt: `${today}T00:00:00.000Z`,
  };

  const simulatedSnapshot: FinanceSnapshot = {
    ...snapshot,
    transactions: [...snapshot.transactions, simulationTransaction],
  };

  const after = projectBudget(simulatedSnapshot, today);

  const impact = {
    safePoolChange: after.safePool - before.safePool,
    dailyLimitChange: after.safeToSpendPerDay - before.safeToSpendPerDay,
  };

  let verdict: 'safe' | 'tight' | 'unsafe' = 'safe';

  if (after.safePool === 0 || amount > before.safePool) {
    verdict = 'unsafe';
  } else if (after.safeToSpendPerDay < Math.floor(before.safeToSpendPerDay * 0.5)) {
    verdict = 'tight';
  }

  const reasonCodes: SimulationReasonCode[] = [];
  if (verdict === 'safe') reasonCodes.push('safe-purchase');
  if (verdict === 'tight') reasonCodes.push('daily-limit-impacted');
  if (verdict === 'unsafe') reasonCodes.push('pool-depleted');

  return {
    verdict,
    before,
    after,
    impact,
    reasonCodes,
  };
}
