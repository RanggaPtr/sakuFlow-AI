import { z } from 'zod';

import { TRANSACTION_CATEGORIES } from 'src/features/finance/domain';

const parsedTransactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  category: z.enum(TRANSACTION_CATEGORIES),
  note: z.string().trim().min(1).max(120),
});

export const financeIntentSchema = z.discriminatedUnion('type', [
  parsedTransactionSchema.extend({ type: z.literal('expense') }),
  parsedTransactionSchema.extend({ type: z.literal('income') }),
  z.object({ type: z.literal('unknown'), reason: z.string().trim().min(1).max(120) }),
]);

export const financeTextRequestSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export type FinanceIntent = z.infer<typeof financeIntentSchema>;
