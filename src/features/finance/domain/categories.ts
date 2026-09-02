export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export const TRANSACTION_CATEGORIES = [
  'salary',
  'allowance',
  'food',
  'transport',
  'housing',
  'education',
  'entertainment',
  'shopping',
  'health',
  'savings',
  'debt',
  'other',
] as const;
export const OBLIGATION_CATEGORIES = [
  'housing',
  'utilities',
  'debt',
  'subscription',
  'education',
  'other',
] as const;
export const GOAL_CATEGORIES = [
  'emergency',
  'education',
  'device',
  'travel',
  'lifestyle',
  'other',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];
export type ObligationCategory = (typeof OBLIGATION_CATEGORIES)[number];
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

const OBLIGATION_TRANSACTION_CATEGORY: Record<ObligationCategory, TransactionCategory> = {
  housing: 'housing',
  utilities: 'housing',
  debt: 'debt',
  subscription: 'other',
  education: 'education',
  other: 'other',
};

export function obligationCategoryToTransactionCategory(
  category: ObligationCategory
): TransactionCategory {
  return OBLIGATION_TRANSACTION_CATEGORY[category];
}
