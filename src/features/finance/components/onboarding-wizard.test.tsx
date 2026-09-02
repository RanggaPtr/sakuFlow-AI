import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useFinance } from 'src/features/finance/state';

import { OnboardingWizard } from './onboarding-wizard';

const replaceRoute = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceRoute }) }));
vi.mock('src/features/finance/state', () => ({ useFinance: vi.fn() }));

describe('OnboardingWizard persistence', () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinance).mockReturnValue({
      state: { hydration: 'ready', snapshot: {} as never, corruptRawValue: null },
      dispatch: vi.fn(),
      persistence: {
        replace,
        reset: vi.fn(),
        exportJson: vi.fn(() => ''),
        parseImport: vi.fn(),
        confirmImport: vi.fn(),
      },
    });
  });

  afterEach(cleanup);

  async function fillAndSubmit() {
    const user = userEvent.setup();
    const numbers = screen.getAllByRole('spinbutton');
    await user.type(numbers[0]!, '4000000');
    await user.type(numbers[1]!, '6000000');
    fireEvent.change(document.querySelector<HTMLInputElement>('input[type="date"]')!, {
      target: { value: '2026-12-11' },
    });
    await user.type(numbers[2]!, '200000');
    await user.click(screen.getByRole('button', { name: 'Konfirmasi & mulai' }));
  }

  it('navigates only after persistence replacement succeeds', async () => {
    replace.mockResolvedValue(true);
    render(<OnboardingWizard />);
    await fillAndSubmit();
    expect(replace).toHaveBeenCalledOnce();
    expect(replaceRoute).toHaveBeenCalledWith('/dashboard');
  });

  it('keeps an actionable error and does not navigate when persistence fails', async () => {
    replace.mockResolvedValue(false);
    render(<OnboardingWizard />);
    await fillAndSubmit();
    expect(replaceRoute).not.toHaveBeenCalled();
    expect(screen.getByText(/Gagal menyimpan data onboarding/i)).toBeInTheDocument();
  });
});
