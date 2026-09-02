import type { ReactNode } from 'react';

import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { paths } from 'src/routes/paths';

import { FinanceShell } from './finance-shell';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push }),
}));

vi.mock('./finance-guard', () => ({
  FinanceGuard: ({ children }: { children: ReactNode }) => children,
}));

describe('FinanceShell', () => {
  it('renders Indonesian navigation backed by centralized paths', async () => {
    render(
      <FinanceShell>
        <main>Konten</main>
      </FinanceShell>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dasbor' }));
    await userEvent.click(screen.getByRole('button', { name: 'Transaksi' }));
    await userEvent.click(screen.getByRole('button', { name: 'Rencana' }));
    await userEvent.click(screen.getByRole('button', { name: 'Wawasan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pengaturan' }));
    expect(push.mock.calls).toEqual([
      [paths.dashboard],
      [paths.transactions],
      [paths.plan],
      [paths.insights],
      [paths.settings],
    ]);
  });
});
