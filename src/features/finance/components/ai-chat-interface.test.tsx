import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

import { useFinance } from 'src/features/finance/state';
import { interpretTransactionText } from 'src/features/finance/ai';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { AiChatInterface } from './ai-chat-interface';

vi.mock('src/features/finance/state', () => ({
  useFinance: vi.fn(),
}));

vi.mock('src/features/finance/ai', () => ({
  interpretTransactionText: vi.fn(),
}));

describe('AiChatInterface Draft Flow', () => {
  const dispatchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot(),
        corruptRawValue: null,
      },
      dispatch: dispatchMock,
      persistence: {
        reset: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(
          (_raw: string): PersistenceEnvelope => ({
            schemaVersion: 1,
            savedAt: '2026-08-01T00:00:00.000Z',
            data: makeFinanceSnapshot(),
          })
        ),
        confirmImport: vi.fn(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('allows user to confirm draft and dispatches action', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan',
    });

    render(<AiChatInterface />);

    // Type in input
    const input = screen.getByPlaceholderText('Tulis pengeluaran...');
    await userEvent.type(input, 'Makan 50k');

    // Submit
    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Wait for draft UI
    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Draft')).toBeInTheDocument();
    });

    const simpanBtn = screen.getByText('Simpan');
    await userEvent.click(simpanBtn);

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add-transaction',
        transaction: expect.objectContaining({
          amount: 50000,
          type: 'expense',
        }),
      })
    );

    // Draft UI should disappear
    expect(screen.queryByText('Konfirmasi Draft')).not.toBeInTheDocument();
  });

  it('allows user to cancel draft', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan',
    });

    render(<AiChatInterface />);

    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'Makan 50k');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Draft')).toBeInTheDocument();
    });

    const batalBtn = screen.getByText('Batal');
    await userEvent.click(batalBtn);

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Konfirmasi Draft')).not.toBeInTheDocument();
    expect(screen.getByText('Pencatatan dibatalkan.')).toBeInTheDocument();
  });

  it('allows user to edit draft before confirming', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan',
    });

    render(<AiChatInterface />);

    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'Makan 50k');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Konfirmasi Draft')).toBeInTheDocument();
    });

    // The amount is in a spinbutton
    const amountInput = screen.getByRole('spinbutton');
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, '60000');

    // The note is in a textbox placeholder="Catatan..."
    const noteInput = screen.getByPlaceholderText('Catatan...');
    await userEvent.clear(noteInput);
    await userEvent.type(noteInput, 'Makan mewah');

    await userEvent.click(screen.getByText('Simpan'));

    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add-transaction',
        transaction: expect.objectContaining({
          amount: 60000,
          note: 'Makan mewah',
        }),
      })
    );
  });
});
import type { PersistenceEnvelope } from 'src/features/finance/domain';
