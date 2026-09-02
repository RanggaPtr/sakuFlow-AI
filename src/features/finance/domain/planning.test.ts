import { it, expect, describe } from 'vitest';

import { buildGoal, buildObligation } from './planning';

const NOW = new Date('2026-08-01T09:30:00.000Z');
const IDS = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];

describe('planning builders', () => {
  it('builds a valid unpaid obligation from strict integer input', () => {
    expect(
      buildObligation(
        { name: 'Sewa', amount: '1000000', dueOn: '2026-08-10', category: 'housing' },
        NOW,
        () => IDS[0]!
      )
    ).toMatchObject({ name: 'Sewa', amount: 1000000, status: 'unpaid' });
  });

  it.each(['Rp 1000000', '1000000.5', '-100', '0'])(
    'rejects unsafe obligation amount %s',
    (amount) => {
      expect(() =>
        buildObligation(
          { name: 'Sewa', amount, dueOn: '2026-08-10', category: 'housing' },
          NOW,
          () => IDS[0]!
        )
      ).toThrow();
    }
  );

  it('builds a valid active savings goal', () => {
    expect(
      buildGoal(
        { name: 'Laptop', targetAmount: '5000000', targetDate: '2027-01-01', category: 'device' },
        NOW,
        () => IDS[1]!
      )
    ).toMatchObject({
      name: 'Laptop',
      targetAmount: 5000000,
      contributedAmount: 0,
      status: 'active',
    });
  });
});
