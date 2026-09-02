import type { LoadFinanceResult } from 'src/features/finance/storage/repository';
import type {
  Obligation,
  Transaction,
  SavingsGoal,
  FinanceSnapshot,
} from 'src/features/finance/domain';

import {
  obligationSchema,
  savingsGoalSchema,
  transactionSchema,
  financeSnapshotSchema,
  createEmptyFinanceSnapshot,
  obligationCategoryToTransactionCategory,
} from 'src/features/finance/domain';

export interface FinanceState {
  hydration: 'idle' | 'ready' | 'corrupt';
  snapshot: FinanceSnapshot;
  corruptRawValue: string | null;
}

export type FinanceAction =
  | { type: 'hydrate'; result: LoadFinanceResult }
  | { type: 'complete-onboarding'; snapshot: FinanceSnapshot }
  | { type: 'add-transaction'; transaction: Transaction }
  | { type: 'delete-transaction'; transactionId: string }
  | { type: 'add-obligation'; obligation: Obligation }
  | { type: 'mark-obligation-paid'; obligationId: string; transaction: Transaction }
  | { type: 'add-goal'; goal: SavingsGoal }
  | { type: 'contribute-to-goal'; goalId: string; amount: number; transaction: Transaction }
  | { type: 'replace-from-import'; snapshot: FinanceSnapshot }
  | { type: 'reset' };

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'hydrate': {
      const snapshot = financeSnapshotSchema.safeParse(action.result.snapshot);
      if (!snapshot.success) return state;
      return {
        hydration: action.result.status === 'empty' ? 'ready' : action.result.status,
        snapshot: snapshot.data,
        corruptRawValue: action.result.status === 'corrupt' ? action.result.rawValue : null,
      };
    }
    case 'complete-onboarding':
    case 'replace-from-import': {
      const snapshot = financeSnapshotSchema.safeParse(action.snapshot);
      if (!snapshot.success) return state;
      return {
        ...state,
        hydration: 'ready',
        snapshot: snapshot.data,
        corruptRawValue: null,
      };
    }
    case 'add-transaction': {
      const candidate = transactionSchema.safeParse(action.transaction);
      if (!candidate.success) return state;
      if (state.snapshot.transactions.some((t) => t.id === candidate.data.id)) return state;
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, candidate.data],
        },
      };
    }
    case 'delete-transaction': {
      if (!state.snapshot.transactions.some((t) => t.id === action.transactionId)) return state;
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: state.snapshot.transactions.filter((t) => t.id !== action.transactionId),
        },
      };
    }
    case 'add-obligation': {
      const candidate = obligationSchema.safeParse(action.obligation);
      if (!candidate.success) return state;
      if (state.snapshot.obligations.some((o) => o.id === candidate.data.id)) return state;
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          obligations: [...state.snapshot.obligations, candidate.data],
        },
      };
    }
    case 'mark-obligation-paid': {
      const obligation = state.snapshot.obligations.find((o) => o.id === action.obligationId);
      const candidate = transactionSchema.safeParse(action.transaction);
      if (!obligation || obligation.status === 'paid') return state;
      if (!candidate.success) return state;
      if (candidate.data.type !== 'expense') return state;
      if (candidate.data.amount !== obligation.amount) return state;
      if (state.snapshot.transactions.some((t) => t.id === candidate.data.id)) return state;
      if (candidate.data.category !== obligationCategoryToTransactionCategory(obligation.category))
        return state;

      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, candidate.data],
          obligations: state.snapshot.obligations.map((o) =>
            o.id === action.obligationId
              ? { ...o, status: 'paid', paidTransactionId: candidate.data.id }
              : o
          ),
        },
      };
    }
    case 'add-goal': {
      const candidate = savingsGoalSchema.safeParse(action.goal);
      if (!candidate.success) return state;
      if (state.snapshot.goals.some((g) => g.id === candidate.data.id)) return state;
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          goals: [...state.snapshot.goals, candidate.data],
        },
      };
    }
    case 'contribute-to-goal': {
      const goal = state.snapshot.goals.find((g) => g.id === action.goalId);
      const candidate = transactionSchema.safeParse(action.transaction);
      if (!goal || goal.status === 'completed') return state;
      if (!Number.isSafeInteger(action.amount) || action.amount <= 0) return state;
      if (!candidate.success) return state;
      if (candidate.data.type !== 'expense' || candidate.data.category !== 'savings') return state;
      if (candidate.data.amount !== action.amount) return state;
      if (goal.contributedAmount + action.amount > goal.targetAmount) return state;
      if (state.snapshot.transactions.some((t) => t.id === candidate.data.id)) return state;

      const newContributed = goal.contributedAmount + action.amount;
      const newStatus = newContributed === goal.targetAmount ? 'completed' : 'active';

      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, candidate.data],
          goals: state.snapshot.goals.map((g) =>
            g.id === action.goalId
              ? { ...g, contributedAmount: newContributed, status: newStatus }
              : g
          ),
        },
      };
    }
    case 'reset': {
      return {
        hydration: 'ready',
        snapshot: createEmptyFinanceSnapshot(),
        corruptRawValue: null,
      };
    }
    default:
      return state;
  }
}
