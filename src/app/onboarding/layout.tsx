import { FinanceProvider } from 'src/features/finance/state';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}
