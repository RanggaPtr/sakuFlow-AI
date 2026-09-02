import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

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

  it('shows simulation result without mutating until the user records the purchase', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'simulate_purchase',
      amount: 50000,
      note: 'Beli kopi',
    });

    render(<AiChatInterface />);
    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'simulasi kopi 50k');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Konfirmasi tindakan'));

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Sisa jatah harian/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Catat sebagai pengeluaran'));
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add-transaction',
        transaction: expect.objectContaining({ amount: 50000 }),
      })
    );
  });

  it('renders a deterministic summary without reporting a mutation confirmation', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'ask_summary',
      question: 'Bagaimana kondisi saya?',
    });

    render(<AiChatInterface />);
    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'ringkas kondisi');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Konfirmasi tindakan'));

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Ringkasan:/i)).toBeInTheDocument();
    expect(screen.queryByText('Tindakan dikonfirmasi.')).not.toBeInTheDocument();
  });

  it('shows provenance and confidence for every action preview', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'add_obligation',
      name: 'Listrik',
      amount: 250000,
      dueOn: '2026-09-05',
      category: 'utilities',
      source: 'external',
      confidence: 'high',
    });
    render(<AiChatInterface />);
    await userEvent.type(
      screen.getByPlaceholderText('Tulis pengeluaran...'),
      'tagihan listrik 250rb'
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    expect(screen.getByText(/Sumber: AI eksternal/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyakinan: tinggi/i)).toBeInTheDocument();
  });

  it('reports an actionable error when the requested obligation is unavailable', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'mark_obligation_paid',
      obligationName: 'Listrik',
      amount: 250000,
    });

    render(<AiChatInterface />);
    await userEvent.type(
      screen.getByPlaceholderText('Tulis pengeluaran...'),
      'tandai listrik lunas 250rb'
    );
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Konfirmasi tindakan'));

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/tidak ditemukan atau sudah lunas/i)).toBeInTheDocument();
  });

  it('does not report success when the requested obligation is already paid', async () => {
    const snapshot = makeFinanceSnapshot();
    const payment = {
      id: '66666666-6666-4666-8666-666666666666',
      type: 'expense' as const,
      category: 'housing' as const,
      amount: 1000000,
      occurredOn: '2026-08-05',
      note: 'Bayar Rent',
      source: 'manual' as const,
      createdAt: '2026-08-05T00:00:00.000Z',
    };
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: {
          ...snapshot,
          transactions: [payment],
          obligations: [
            { ...snapshot.obligations[0]!, status: 'paid', paidTransactionId: payment.id },
            snapshot.obligations[1]!,
          ],
        },
        corruptRawValue: null,
      },
      dispatch: dispatchMock,
      persistence: {
        reset: vi.fn(),
        replace: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(),
        confirmImport: vi.fn(),
      },
    });
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'mark_obligation_paid',
      obligationName: 'Rent',
      amount: 1000000,
    });

    render(<AiChatInterface />);
    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'tandai rent lunas');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Konfirmasi tindakan'));

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/tidak ditemukan atau sudah lunas/i)).toBeInTheDocument();
    expect(screen.queryByText('Tindakan dikonfirmasi.')).not.toBeInTheDocument();
  });

  it('re-runs a simulation and requires fresh confirmation after snapshot changes', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'simulate_purchase',
      amount: 50000,
      note: 'Beli kopi',
    });

    render(<AiChatInterface />);
    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'simulasi kopi 50k');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Pratinjau tindakan')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Konfirmasi tindakan'));

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

    await userEvent.click(screen.getByText('Catat sebagai pengeluaran'));
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Data keuangan berubah/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText('Catat sebagai pengeluaran'));
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'add-transaction' }));
  });

  it('keeps an AI transaction draft open when edited fields fail schema validation', async () => {
    vi.mocked(interpretTransactionText).mockResolvedValue({
      type: 'expense',
      amount: 50000,
      category: 'food',
      note: 'Makan',
    });

    render(<AiChatInterface />);
    await userEvent.type(screen.getByPlaceholderText('Tulis pengeluaran...'), 'Makan 50k');
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Konfirmasi Draft')).toBeInTheDocument());

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Nominal' }), {
      target: { value: '', valueAsNumber: Number.NaN },
    });
    await userEvent.click(screen.getByText('Simpan'));
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Periksa nominal, tanggal, dan catatan/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Nominal' }), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText('Tanggal'), { target: { value: '2026-02-30' } });
    await userEvent.click(screen.getByText('Simpan'));
    expect(dispatchMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Tanggal'), { target: { value: '2026-08-01' } });
    await userEvent.clear(screen.getByPlaceholderText('Catatan...'));
    await userEvent.click(screen.getByText('Simpan'));
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Konfirmasi Draft')).toBeInTheDocument();
  });
});
import type { PersistenceEnvelope } from 'src/features/finance/domain';
