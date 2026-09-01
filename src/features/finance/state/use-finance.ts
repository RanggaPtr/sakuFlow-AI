'use client';

import type { FinanceContextValue } from './finance-provider';

import { useContext } from 'react';

import { FinanceContext } from './finance-provider';

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
