'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { paths } from 'src/routes/paths';

import { useFinance, selectIsOnboarded } from 'src/features/finance/state';

import { RecoveryView } from './recovery-view';

export function FinanceGuard({ children }: { children: React.ReactNode }) {
  const { state } = useFinance();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (state.hydration === 'ready' && !selectIsOnboarded(state)) {
      router.replace(paths.onboarding);
    }
  }, [state, router]);

  if (!isClient || state.hydration === 'idle') {
    return null; // Or a nice splash screen loading state
  }

  if (state.hydration === 'corrupt') {
    return <RecoveryView />;
  }

  if (state.hydration === 'ready' && !selectIsOnboarded(state)) {
    return null;
  }

  return <>{children}</>;
}
