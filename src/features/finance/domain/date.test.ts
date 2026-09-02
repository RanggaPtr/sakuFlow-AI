import { it, expect, describe } from 'vitest';

import { isIsoDate, isYyyyMmDd, clampIncomeDay, daysUntilIncome, toLocalYyyyMmDd } from './date';

describe('date domain functions', () => {
  it('validates ISO dates correctly', () => {
    expect(isIsoDate('2026-08-01T00:00:00.000Z')).toBe(true);
    expect(isIsoDate('2026-08-01')).toBe(false);
  });

  it('validates YYYY-MM-DD correctly', () => {
    expect(isYyyyMmDd('2026-08-01')).toBe(true);
    expect(isYyyyMmDd('2026-8-1')).toBe(false);
  });

  it('calculates days until income correctly', () => {
    expect(daysUntilIncome('2026-08-01', '2026-08-11')).toBe(10);
    // Same day is clamped to 1
    expect(daysUntilIncome('2026-08-11', '2026-08-11')).toBe(1);
    // Past date is clamped to 1
    expect(daysUntilIncome('2026-08-12', '2026-08-11')).toBe(1);
    // Leap year (2024 is a leap year)
    expect(daysUntilIncome('2024-02-28', '2024-03-01')).toBe(2); // 28, 29 = 2 days
  });

  it('clamps income day to month ends', () => {
    // 2026-02 has 28 days
    expect(clampIncomeDay(2026, 1, 30)).toBe(28);
    // 2024-02 has 29 days
    expect(clampIncomeDay(2024, 1, 30)).toBe(29);
    // Normal day
    expect(clampIncomeDay(2026, 7, 11)).toBe(11); // August 11
  });

  it('formats date-only values from local calendar fields', () => {
    expect(toLocalYyyyMmDd(new Date(2026, 7, 9, 23, 59, 59))).toBe('2026-08-09');
  });
});
