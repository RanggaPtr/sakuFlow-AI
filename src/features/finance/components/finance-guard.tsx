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
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#164e63' }}
      >
        <div>
          <strong>SakuFlow</strong>
          <div>Memuat SakuFlow…</div>
        </div>
      </div>
    );
  }

  if (state.hydration === 'corrupt') {
    return <RecoveryView />;
  }

  if (state.hydration === 'ready' && !selectIsOnboarded(state)) {
    return null;
  }

  return <>{children}</>;
}
