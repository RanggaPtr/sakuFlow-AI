import type { FinanceSnapshot } from './schemas';

export function createEmptyFinanceSnapshot(): FinanceSnapshot {
  return {
    profile: null,
    cycle: null,
    transactions: [],
    obligations: [],
    goals: [],
    allocation: { bufferMode: 'fixed', bufferAmount: 0 },
  };
}
