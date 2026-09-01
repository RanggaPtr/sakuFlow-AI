import { FinanceProvider } from 'src/features/finance/state';
import { FinanceShell } from 'src/features/finance/components/finance-shell';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <FinanceShell>{children}</FinanceShell>
    </FinanceProvider>
  );
}
