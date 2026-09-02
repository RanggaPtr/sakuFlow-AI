import { it, expect, describe } from 'vitest';

import { buildOnboardingSnapshot } from './onboarding';

const NOW = new Date(2026, 7, 1, 9, 30, 0);
const IDS = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];

function build(overrides: Partial<Parameters<typeof buildOnboardingSnapshot>[0]> = {}) {
  let index = 0;
  return buildOnboardingSnapshot(
    {
      currentBalance: '4000000',
      recurringIncome: '6000000',
      nextPayday: '2026-08-25',
      fixedBuffer: '500000',
      ...overrides,
    },
    NOW,
    () => IDS[index++]!
  );
}

describe('buildOnboardingSnapshot', () => {
  it('builds a new snapshot without inheriting an old or demo ledger', () => {
    const snapshot = build();

    expect(snapshot.profile?.incomeDay).toBe(25);
    expect(snapshot.cycle).toMatchObject({
      startsOn: '2026-08-01',
      nextIncomeOn: '2026-08-25',
      openingBalance: 4000000,
      recurringIncome: 6000000,
      bufferAmount: 500000,
    });
    expect(snapshot.allocation.bufferAmount).toBe(500000);
    expect(snapshot.transactions).toEqual([]);
    expect(snapshot.obligations).toEqual([]);
    expect(snapshot.goals).toEqual([]);
  });

  it.each([
    ['negative balance', { currentBalance: '-1000' }],
    ['fractional balance', { currentBalance: '1000.5' }],
    ['formatted balance that would be silently stripped', { currentBalance: 'Rp 1.000' }],
    ['unsafe recurring income', { recurringIncome: String(Number.MAX_SAFE_INTEGER + 1) }],
    ['fractional fixed buffer', { fixedBuffer: '10.5' }],
  ])('rejects %s', (_label, invalidInput) => {
    expect(() => build(invalidInput)).toThrow();
  });

  it.each(['2026-08-01', '2026-07-31', '01-08-2026', '2026-02-30'])(
    'requires a real future local payday instead of %s',
    (nextPayday) => {
      expect(() => build({ nextPayday })).toThrow();
    }
  );
});
