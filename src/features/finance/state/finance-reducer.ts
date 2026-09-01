import type { LoadFinanceResult } from 'src/features/finance/storage/repository';
import type {
  Obligation,
  Transaction,
  SavingsGoal,
  FinanceSnapshot,
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
      return {
        hydration: action.result.status === 'empty' ? 'ready' : action.result.status,
        snapshot: action.result.snapshot,
        corruptRawValue: action.result.status === 'corrupt' ? action.result.rawValue : null,
      };
    }
    case 'complete-onboarding':
    case 'replace-from-import': {
      return {
        ...state,
        hydration: 'ready',
        snapshot: action.snapshot,
        corruptRawValue: null,
      };
    }
    case 'add-transaction': {
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, action.transaction],
        },
      };
    }
    case 'delete-transaction': {
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: state.snapshot.transactions.filter((t) => t.id !== action.transactionId),
        },
      };
    }
    case 'add-obligation': {
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          obligations: [...state.snapshot.obligations, action.obligation],
        },
      };
    }
    case 'mark-obligation-paid': {
      const obligation = state.snapshot.obligations.find((o) => o.id === action.obligationId);
      if (!obligation || obligation.status === 'paid') return state;
      if (action.transaction.type !== 'expense') return state;
      if (action.transaction.amount !== obligation.amount) return state;

      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, action.transaction],
          obligations: state.snapshot.obligations.map((o) =>
            o.id === action.obligationId
              ? { ...o, status: 'paid', paidTransactionId: action.transaction.id }
              : o
          ),
        },
      };
    }
    case 'add-goal': {
      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          goals: [...state.snapshot.goals, action.goal],
        },
      };
    }
    case 'contribute-to-goal': {
      const goal = state.snapshot.goals.find((g) => g.id === action.goalId);
      if (!goal || goal.status === 'completed') return state;
      if (action.transaction.type !== 'expense' || action.transaction.category !== 'savings')
        return state;
      if (action.transaction.amount !== action.amount) return state;
      if (goal.contributedAmount + action.amount > goal.targetAmount) return state;

      const newContributed = goal.contributedAmount + action.amount;
      const newStatus = newContributed === goal.targetAmount ? 'completed' : 'active';

      return {
        ...state,
        snapshot: {
          ...state.snapshot,
          transactions: [...state.snapshot.transactions, action.transaction],
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
        snapshot: {
          profile: null,
          cycle: null,
          transactions: [],
          obligations: [],
          goals: [],
          allocation: { bufferMode: 'fixed', bufferAmount: 0 },
        },
        corruptRawValue: null,
      };
    }
    default:
      return state;
  }
}
