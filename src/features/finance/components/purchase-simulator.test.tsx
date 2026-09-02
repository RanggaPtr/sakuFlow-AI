import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { useFinance } from 'src/features/finance/state';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { PurchaseSimulator } from './purchase-simulator';

vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('PurchaseSimulator', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot(),
        corruptRawValue: null,
      },
      dispatch,
      persistence: {
        reset: vi.fn(),
        replace: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(
          (_raw: string): PersistenceEnvelope => ({
            schemaVersion: 2,
            savedAt: '2026-08-01T00:00:00.000Z',
            data: makeFinanceSnapshot(),
          })
        ),
        confirmImport: vi.fn(),
      },
    });
  });

  afterEach(cleanup);

  it('persists only a separately confirmed normal manual transaction', async () => {
    const user = userEvent.setup();
    render(<PurchaseSimulator />);

    await user.type(screen.getByLabelText('Nominal Pengeluaran'), '100000');
    await user.click(screen.getByRole('button', { name: 'Cek Dulu' }));

    expect(dispatch).not.toHaveBeenCalled();
    await user.click(await screen.findByRole('button', { name: 'Catat sebagai pengeluaran' }));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add-transaction',
        transaction: expect.objectContaining({ source: 'manual' }),
      })
    );
  });

  it('rechecks the latest snapshot before recording a stale simulation', async () => {
    const user = userEvent.setup();
    render(<PurchaseSimulator />);
    await user.type(screen.getByLabelText('Nominal Pengeluaran'), '100000');
    await user.click(screen.getByRole('button', { name: 'Cek Dulu' }));

    const latestState = vi.mocked(useFinance).mock.results[0]!.value.state;
    latestState.snapshot.transactions.push({
      id: '77777777-7777-4777-8777-777777777777',
      type: 'expense',
      category: 'food',
      amount: 1900000,
      occurredOn: '2026-08-01',
      note: 'Pengeluaran baru',
      source: 'manual',
      createdAt: '2026-08-01T01:00:00.000Z',
    });

    await user.click(screen.getByRole('button', { name: 'Catat sebagai pengeluaran' }));
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText(/Data keuangan berubah/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Catat sebagai pengeluaran' }));
    expect(dispatch).toHaveBeenCalledOnce();
  });
});
import type { PersistenceEnvelope } from 'src/features/finance/domain';
