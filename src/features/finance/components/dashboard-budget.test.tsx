import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DashboardBudget } from './dashboard-budget';

describe('DashboardBudget', () => {
  it('shows liquid balance and each reserve category', () => {
    render(
      <DashboardBudget
        liquidBalance={4000000}
        safePool={2000000}
        spent={500000}
        unpaidObligationReserve={1000000}
        remainingGoalReserve={500000}
        bufferReserve={500000}
      />
    );

    expect(screen.getByText('Saldo cair')).toBeInTheDocument();
    expect(screen.getByText('Cadangan tanggungan')).toBeInTheDocument();
    expect(screen.getByText('Cadangan tujuan')).toBeInTheDocument();
    expect(screen.getByText('Dana jaga-jaga')).toBeInTheDocument();
    expect(screen.getByText('Dana aman')).toBeInTheDocument();
  });
});
