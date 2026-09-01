'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useFinance, selectIsOnboarded } from 'src/features/finance/state';

export function FinanceGuard({ children }: { children: React.ReactNode }) {
  const { state } = useFinance();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (state.hydration === 'ready' && !selectIsOnboarded(state)) {
      router.replace('/onboarding');
    }
  }, [state.hydration, state.snapshot, router]);

  if (!isClient || state.hydration === 'idle') {
    return null; // Or a nice splash screen loading state
  }

  if (state.hydration === 'corrupt') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>Data Terkorupsi</h2>
        <p>Maaf, data penyimpanan lokal tidak dapat dibaca.</p>
      </div>
    );
  }

  if (state.hydration === 'ready' && !selectIsOnboarded(state)) {
    return null;
  }

  return <>{children}</>;
}
