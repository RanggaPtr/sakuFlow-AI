import { it, expect, describe } from 'vitest';

import { createEmptyFinanceSnapshot } from './empty-snapshot';

describe('createEmptyFinanceSnapshot', () => {
  it('should return a fresh instance on each call', () => {
    const snapshot1 = createEmptyFinanceSnapshot();
    const snapshot2 = createEmptyFinanceSnapshot();

    expect(snapshot1).not.toBe(snapshot2);
    expect(snapshot1.transactions).not.toBe(snapshot2.transactions);
    expect(snapshot1.obligations).not.toBe(snapshot2.obligations);
    expect(snapshot1.goals).not.toBe(snapshot2.goals);
    expect(snapshot1.allocation).not.toBe(snapshot2.allocation);
  });
});
