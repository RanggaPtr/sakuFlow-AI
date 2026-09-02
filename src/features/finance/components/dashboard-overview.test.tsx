import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DashboardOverview } from './dashboard-overview';

describe('DashboardOverview', () => {
  it('shows balance health, reason, and next income alongside the daily allowance', () => {
    render(
      <DashboardOverview
        safeToSpendPerDay={125000}
        remainingDays={5}
        health="watch"
        reasonCodes={['daily-limit-low']}
        nextIncomeOn="2026-08-11"
        recurringIncome={6000000}
      />
    );

    expect(screen.getByText(/Perlu perhatian/i)).toBeInTheDocument();
    expect(screen.getByText(/Batas harian cukup rendah/i)).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('Pemasukan berikutnya:'))).toBeInTheDocument();
    expect(screen.getByText(/Rp6.000.000/i)).toBeInTheDocument();
  });
});
