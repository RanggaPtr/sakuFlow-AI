import { FinanceProvider } from 'src/features/finance/state';
import { OnboardingWizard } from 'src/features/finance/components';

export default function OnboardingPage() {
  return (
    <FinanceProvider>
      <OnboardingWizard />
    </FinanceProvider>
  );
}
