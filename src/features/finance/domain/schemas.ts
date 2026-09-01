import { z } from 'zod';

import { isIsoDate, isYyyyMmDd } from './date';
import {
  GOAL_CATEGORIES,
  TRANSACTION_TYPES,
  OBLIGATION_CATEGORIES,
  TRANSACTION_CATEGORIES,
} from './categories';

export const CURRENT_SCHEMA_VERSION = 1;

export const moneySchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positiveMoneySchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const uuidSchema = z.string().uuid();
const isoDateSchema = z.string().refine(isIsoDate, { message: 'Invalid ISO Date' });
const yyyyMmDdSchema = z.string().refine(isYyyyMmDd, { message: 'Must be YYYY-MM-DD' });

export const financeProfileSchema = z.object({
  id: uuidSchema,
  displayName: z.string().max(40).optional(),
  incomeDay: z.number().int().min(1).max(31),
  currency: z.literal('IDR'),
  onboardingCompletedAt: isoDateSchema,
});
export type FinanceProfile = z.infer<typeof financeProfileSchema>;

export const budgetCycleSchema = z
  .object({
    id: uuidSchema,
    startsOn: yyyyMmDdSchema,
    nextIncomeOn: yyyyMmDdSchema,
    openingBalance: moneySchema,
    bufferAmount: moneySchema,
  })
  .refine((data) => data.nextIncomeOn >= data.startsOn, {
    message: 'nextIncomeOn must be >= startsOn',
  });
export type BudgetCycle = z.infer<typeof budgetCycleSchema>;

export const transactionSchema = z.object({
  id: uuidSchema,
  type: z.enum(TRANSACTION_TYPES),
  category: z.enum(TRANSACTION_CATEGORIES),
  amount: positiveMoneySchema,
  occurredOn: yyyyMmDdSchema,
  note: z.string().trim().min(1).max(120),
  source: z.enum(['manual', 'natural-language', 'simulation', 'system']),
  createdAt: isoDateSchema,
});
export type Transaction = z.infer<typeof transactionSchema>;

export const obligationSchema = z
  .object({
    id: uuidSchema,
    name: z.string().trim().min(1).max(80),
    amount: positiveMoneySchema,
    dueOn: yyyyMmDdSchema,
    category: z.enum(OBLIGATION_CATEGORIES),
    status: z.enum(['unpaid', 'paid']),
    paidTransactionId: uuidSchema.optional(),
    createdAt: isoDateSchema,
  })
  .refine(
    (data) => {
      if (data.status === 'paid') return !!data.paidTransactionId;
      return !data.paidTransactionId;
    },
    { message: 'paidTransactionId must exist if and only if status is paid' }
  );
export type Obligation = z.infer<typeof obligationSchema>;

export const savingsGoalSchema = z
  .object({
    id: uuidSchema,
    name: z.string().trim().min(1).max(80),
    targetAmount: positiveMoneySchema,
    contributedAmount: moneySchema,
    targetDate: yyyyMmDdSchema.optional(),
    category: z.enum(GOAL_CATEGORIES),
    status: z.enum(['active', 'completed']),
    createdAt: isoDateSchema,
  })
  .refine((data) => data.contributedAmount <= data.targetAmount, {
    message: 'contributedAmount must be <= targetAmount',
  });
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

export const allocationSettingsSchema = z.object({
  bufferMode: z.literal('fixed'),
  bufferAmount: moneySchema,
});
export type AllocationSettings = z.infer<typeof allocationSettingsSchema>;

export const financeSnapshotSchema = z.object({
  profile: financeProfileSchema.nullable(),
  cycle: budgetCycleSchema.nullable(),
  transactions: z.array(transactionSchema),
  obligations: z.array(obligationSchema),
  goals: z.array(savingsGoalSchema),
  allocation: allocationSettingsSchema,
});
export type FinanceSnapshot = z.infer<typeof financeSnapshotSchema>;

export const persistenceEnvelopeSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  savedAt: isoDateSchema,
  data: financeSnapshotSchema,
});
export type PersistenceEnvelope = z.infer<typeof persistenceEnvelopeSchema>;

export const EMPTY_FINANCE_SNAPSHOT: FinanceSnapshot = {
  profile: null,
  cycle: null,
  transactions: [],
  obligations: [],
  goals: [],
  allocation: { bufferMode: 'fixed', bufferAmount: 0 },
};
Object.freeze(EMPTY_FINANCE_SNAPSHOT);
