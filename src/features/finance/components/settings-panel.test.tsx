import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';
import { render, screen, cleanup } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useFinance } from 'src/features/finance/state';

import { SettingsPanel } from './settings-panel';

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('SettingsPanel reset', () => {
  const reset = vi.fn();
  const replace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useFinance).mockReturnValue({
      state: { hydration: 'ready', snapshot: {} as never, corruptRawValue: null },
      dispatch: vi.fn(),
      persistence: {
        reset,
        replace: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(),
        confirmImport: vi.fn(),
      },
    });
  });

  afterEach(cleanup);

  it('navigates to onboarding only after reset succeeds', async () => {
    reset.mockResolvedValue(false);
    render(<SettingsPanel />);
    await userEvent.type(screen.getByPlaceholderText('HAPUS DATA'), 'HAPUS DATA');
    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(replace).not.toHaveBeenCalled();
    expect(await screen.findByText(/Data lama dipertahankan/i)).toBeInTheDocument();
  });
});
