import type { PersistenceEnvelope } from 'src/features/finance/domain';

import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import { useFinance } from 'src/features/finance/state';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { PlanOverview } from './plan-overview';

vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('PlanOverview creation flow', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot({ obligations: [], goals: [] }),
        corruptRawValue: null,
      },
      dispatch,
      persistence: {
        reset: vi.fn(),
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

  it('creates an obligation only after confirmation', async () => {
    const user = userEvent.setup();
    render(<PlanOverview />);

    await user.click(screen.getByRole('button', { name: 'Tambah tanggungan' }));
    await user.type(screen.getByRole('textbox', { name: 'Nama tanggungan' }), 'Sewa');
    await user.type(screen.getByRole('spinbutton', { name: 'Nominal tanggungan' }), '1000000');
    await user.click(screen.getByRole('button', { name: 'Simpan tanggungan' }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'add-obligation' }));
  });

  it('creates a goal only after confirmation', async () => {
    const user = userEvent.setup();
    render(<PlanOverview />);

    await user.click(screen.getByRole('button', { name: 'Tambah tujuan' }));
    await user.type(screen.getByRole('textbox', { name: 'Nama tujuan' }), 'Dana darurat');
    await user.type(screen.getByRole('spinbutton', { name: 'Target nominal' }), '5000000');
    await user.click(screen.getByRole('button', { name: 'Simpan tujuan' }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'add-goal' }));
  });

  it('persists a validated safety buffer from the plan screen', async () => {
    const user = userEvent.setup();
    render(<PlanOverview />);

    await user.clear(screen.getByRole('spinbutton', { name: 'Dana jaga-jaga' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Dana jaga-jaga' }), '750000');
    await user.click(screen.getByRole('button', { name: 'Simpan alokasi' }));

    expect(dispatch).toHaveBeenCalledWith({ type: 'update-allocation', bufferAmount: 750000 });
  });

  it('cancels goal contribution without mutating', async () => {
    const user = userEvent.setup();
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot({ obligations: [] }),
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
    render(<PlanOverview />);

    await user.click(screen.getByRole('button', { name: 'Nabung' }));
    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.queryByText('Konfirmasi tabungan')).not.toBeInTheDocument();
  });

  it('validates and confirms a goal contribution exactly once', async () => {
    const user = userEvent.setup();
    vi.mocked(useFinance).mockReturnValue({
      state: {
        hydration: 'ready',
        snapshot: makeFinanceSnapshot({ obligations: [] }),
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
    render(<PlanOverview />);

    await user.click(screen.getByRole('button', { name: 'Nabung' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Nominal tabungan' }), '200000');
    await user.click(screen.getByRole('button', { name: 'Lanjutkan' }));
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText('Konfirmasi tabungan')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Konfirmasi nabung' }));
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'contribute-to-goal' }));
  });
});
