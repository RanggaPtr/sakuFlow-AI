import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useFinance } from 'src/features/finance/state';

import { TransactionDialog } from './transaction-dialog';

vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('TransactionDialog validation', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinance).mockReturnValue({
      state: {} as never,
      dispatch,
      persistence: {} as never,
    });
  });
  afterEach(cleanup);

  it('keeps the dialog open and reports invalid amount, date, or note', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TransactionDialog open onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Nominal'), {
      target: { value: '', valueAsNumber: Number.NaN },
    });
    await user.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(dispatch).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Nominal'), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText('Tanggal'), { target: { value: '2026-02-30' } });
    await user.type(screen.getByLabelText('Catatan'), 'Belanja');
    await user.click(screen.getByRole('button', { name: 'Simpan' }));
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText(/Nominal, tanggal, kategori, dan catatan/i)).toBeInTheDocument();
  });
});
