import type { FinanceSnapshot } from 'src/features/finance/domain';

export function makeFinanceSnapshot(overrides?: Partial<FinanceSnapshot>): FinanceSnapshot {
  const base: FinanceSnapshot = {
    profile: {
      id: '11111111-1111-4111-8111-111111111111',
      incomeDay: 11,
      currency: 'IDR',
      onboardingCompletedAt: '2026-08-01T00:00:00.000Z',
    },
    cycle: {
      id: '22222222-2222-4222-8222-222222222222',
      startsOn: '2026-08-01',
      nextIncomeOn: '2026-08-11',
      openingBalance: 4000000,
      bufferAmount: 200000,
    },
    transactions: [],
    obligations: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Rent',
        amount: 1000000,
        dueOn: '2026-08-05',
        category: 'housing',
        status: 'unpaid',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Internet',
        amount: 350000,
        dueOn: '2026-08-08',
        category: 'subscription',
        status: 'unpaid',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    goals: [
      {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Laptop',
        targetAmount: 500000,
        contributedAmount: 0,
        category: 'device',
        status: 'active',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    allocation: {
      bufferMode: 'fixed',
      bufferAmount: 200000,
    },
  };

  return {
    ...base,
    ...overrides,
  };
}
