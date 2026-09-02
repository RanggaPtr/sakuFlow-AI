import { act, render, screen, cleanup } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { CURRENT_SCHEMA_VERSION } from 'src/features/finance/domain';
import { STORAGE_KEY } from 'src/features/finance/storage/repository';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { useFinance } from './use-finance';
import { FinanceProvider } from './finance-provider';

function TestConsumer() {
  const { state, dispatch, persistence } = useFinance();

  if (state.hydration === 'idle') return <div data-testid="status">idle</div>;
  if (state.hydration === 'corrupt') return <div data-testid="status">corrupt</div>;

  return (
    <div>
      <div data-testid="status">ready</div>
      <div data-testid="tx-count">{state.snapshot.transactions.length}</div>
      <button
        data-testid="add-tx"
        onClick={() =>
          dispatch({
            type: 'add-transaction',
            transaction: {
              id: '99999999-9999-4999-8999-999999999999',
              type: 'expense',
              amount: 100,
              category: 'other',
              createdAt: '2026-08-01T00:00:00Z',
              note: 'test',
              occurredOn: '2026-08-01',
              source: 'manual',
            },
          })
        }
      >
        Add Tx
      </button>
      <button data-testid="reset" onClick={persistence.reset}>
        Reset
      </button>
    </div>
  );
}

describe('FinanceProvider', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('hydrates empty state when storage is empty', async () => {
    const { unmount } = render(
      <FinanceProvider>
        <TestConsumer />
      </FinanceProvider>
    );

    expect(await screen.findByTestId('status')).toHaveTextContent('ready');
    unmount();
  });

  it('hydrates from storage and saves on state change', async () => {
    const snapshot = makeFinanceSnapshot();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      })
    );

    const { unmount } = render(
      <FinanceProvider>
        <TestConsumer />
      </FinanceProvider>
    );

    expect(await screen.findByTestId('status')).toHaveTextContent('ready');

    // Original snapshot has 0 transactions
    expect(screen.getByTestId('tx-count')).toHaveTextContent('0');

    // Add transaction
    act(() => {
      screen.getByTestId('add-tx').click();
    });

    expect(screen.getByTestId('tx-count')).toHaveTextContent('1');

    // Wait for effect to save to local storage
    await new Promise((resolve) => setTimeout(resolve, 0));

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.data.transactions).toHaveLength(1);

    unmount();
  });

  it('shows warning when quota exceeded on save', async () => {
    const snapshot = makeFinanceSnapshot();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      })
    );

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { unmount } = render(
      <FinanceProvider>
        <TestConsumer />
      </FinanceProvider>
    );

    expect(await screen.findByTestId('status')).toHaveTextContent('ready');

    act(() => {
      screen.getByTestId('add-tx').click();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText(/Penyimpanan lokal penuh/)).toBeInTheDocument();
    expect(screen.getByText('Ekspor JSON')).toBeInTheDocument();

    setItemSpy.mockRestore();
    unmount();
  });

  it('clears persisted data before resetting in-memory state', async () => {
    const snapshot = makeFinanceSnapshot();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      })
    );
    render(
      <FinanceProvider>
        <TestConsumer />
      </FinanceProvider>
    );
    expect(await screen.findByTestId('status')).toHaveTextContent('ready');

    act(() => screen.getByTestId('reset').click());

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('tx-count')).toHaveTextContent('0');
  });

  it('keeps state and reports a warning when persistent clear fails', async () => {
    const snapshot = makeFinanceSnapshot();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      })
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    render(
      <FinanceProvider>
        <TestConsumer />
      </FinanceProvider>
    );
    expect(await screen.findByTestId('status')).toHaveTextContent('ready');

    act(() => screen.getByTestId('reset').click());

    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(screen.getByText(/Gagal menghapus data tersimpan/)).toBeInTheDocument();
  });
});
