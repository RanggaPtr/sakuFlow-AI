import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { useFinance } from 'src/features/finance/state';

import { FinanceGuard } from './finance-guard';

vi.mock('src/features/finance/state', () => ({
  useFinance: vi.fn(),
  selectIsOnboarded: vi.fn(() => false),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock('./recovery-view', () => ({ RecoveryView: () => <div>Recovery</div> }));

describe('FinanceGuard', () => {
  it('shows branded loading state while local data hydrates', () => {
    vi.mocked(useFinance).mockReturnValue({
      state: { hydration: 'idle', snapshot: {} as never, corruptRawValue: null },
      dispatch: vi.fn(),
      persistence: {} as never,
    });

    render(<FinanceGuard>Konten</FinanceGuard>);

    expect(screen.getByRole('status')).toHaveTextContent('Memuat SakuFlow');
  });
});
