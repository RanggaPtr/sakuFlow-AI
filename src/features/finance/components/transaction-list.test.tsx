import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useFinance } from 'src/features/finance/state';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { TransactionList } from './transaction-list';

vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('TransactionList', () => {
  const dispatch = vi.fn();
  const transactions = [
    {
      id: '66666666-6666-4666-8666-666666666666',
      type: 'income' as const,
      category: 'salary' as const,
      amount: 6000000,
      occurredOn: '2026-08-11',
      note: 'Gaji Agustus',
      source: 'manual' as const,
      createdAt: '2026-08-11T01:00:00.000Z',
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      type: 'expense' as const,
      category: 'food' as const,
      amount: 50000,
      occurredOn: '2026-08-10',
      note: 'Makan siang',
      source: 'manual' as const,
      createdAt: '2026-08-10T01:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot({ transactions }),
        corruptRawValue: null,
      },
      dispatch,
      persistence: {
        reset: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(),
        confirmImport: vi.fn(),
      },
    });
  });

  afterEach(cleanup);

  it('filters by income or expense and searches notes', async () => {
    render(<TransactionList />);
    expect(screen.getByText('Gaji Agustus')).toBeInTheDocument();
    expect(screen.getByText('Makan siang')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Filter jenis'), 'income');
    expect(screen.getByText('Gaji Agustus')).toBeInTheDocument();
    expect(screen.queryByText('Makan siang')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Filter jenis'), 'all');
    await userEvent.type(screen.getByPlaceholderText('Cari transaksi'), 'siang');
    expect(screen.getByText('Makan siang')).toBeInTheDocument();
    expect(screen.queryByText('Gaji Agustus')).not.toBeInTheDocument();
  });

  it('opens edit form and dispatches an update for the selected transaction', async () => {
    render(<TransactionList />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit Makan siang' }));
    expect(screen.getByText('Edit Transaksi')).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Nominal'));
    await userEvent.type(screen.getByLabelText('Nominal'), '75000');
    await userEvent.click(screen.getByText('Simpan'));

    expect(dispatch).toHaveBeenCalledWith({
      type: 'update-transaction',
      transactionId: transactions[1]!.id,
      transaction: expect.objectContaining({
        id: transactions[1]!.id,
        createdAt: transactions[1]!.createdAt,
        amount: 75000,
      }),
    });
  });
});
