import { z } from 'zod';

import {
  GOAL_CATEGORIES,
  OBLIGATION_CATEGORIES,
  TRANSACTION_CATEGORIES,
} from 'src/features/finance/domain';

const parsedTransactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  category: z.enum(TRANSACTION_CATEGORIES),
  note: z.string().trim().min(1).max(120),
});

const positiveAmountSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const addObligationIntentSchema = z.object({
  type: z.literal('add_obligation'),
  name: z.string().trim().min(1).max(80),
  amount: positiveAmountSchema,
  dueOn: z.iso.date(),
  category: z.enum(OBLIGATION_CATEGORIES),
});
const createGoalIntentSchema = z.object({
  type: z.literal('create_goal'),
  name: z.string().trim().min(1).max(80),
  targetAmount: positiveAmountSchema,
  targetDate: z.iso.date().optional(),
  category: z.enum(GOAL_CATEGORIES),
});
const simulatePurchaseIntentSchema = z.object({
  type: z.literal('simulate_purchase'),
  amount: positiveAmountSchema,
  note: z.string().trim().min(1).max(120),
});
const askSummaryIntentSchema = z.object({
  type: z.literal('ask_summary'),
  question: z.string().trim().min(1).max(500),
});
const markObligationPaidIntentSchema = z.object({
  type: z.literal('mark_obligation_paid'),
  obligationName: z.string().trim().min(1).max(80),
  amount: positiveAmountSchema,
});

export const financeIntentSchema = z.discriminatedUnion('type', [
  parsedTransactionSchema.extend({ type: z.literal('expense') }),
  parsedTransactionSchema.extend({ type: z.literal('income') }),
  z.object({ type: z.literal('unknown'), reason: z.string().trim().min(1).max(120) }),
  addObligationIntentSchema,
  createGoalIntentSchema,
  simulatePurchaseIntentSchema,
  askSummaryIntentSchema,
  markObligationPaidIntentSchema,
]);

export const financeTextRequestSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export type FinanceIntent = z.infer<typeof financeIntentSchema>;
