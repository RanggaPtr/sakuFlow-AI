'use client';

import type { ReactNode } from 'react';
import type { FinanceState, FinanceAction } from './finance-reducer';
import type { FinanceRepository } from 'src/features/finance/storage/repository';

import { useRef, useEffect, useReducer, createContext } from 'react';

import { EMPTY_FINANCE_SNAPSHOT } from 'src/features/finance/domain';
import { createFinanceRepository } from 'src/features/finance/storage/repository';

import { selectIsOnboarded } from './selectors';
import { financeReducer } from './finance-reducer';

export interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
}

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, {
    hydration: 'idle',
    snapshot: EMPTY_FINANCE_SNAPSHOT,
    corruptRawValue: null,
  });

  const repoRef = useRef<FinanceRepository | null>(null);

  useEffect(() => {
    repoRef.current = createFinanceRepository(window.localStorage);
    const result = repoRef.current.load();
    dispatch({ type: 'hydrate', result });
  }, []);

  useEffect(() => {
    if (state.hydration === 'ready' && selectIsOnboarded(state)) {
      repoRef.current?.save(state.snapshot);
    }
  }, [state]);

  return <FinanceContext.Provider value={{ state, dispatch }}>{children}</FinanceContext.Provider>;
}
