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

    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Beranda' }).length).toBe(1);
    expect(screen.getByRole('button', { name: 'Beranda' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Beranda' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Transaksi' })[0]!);
    await userEvent.click(screen.getAllByRole('button', { name: 'Rencana' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Insight' }));
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
