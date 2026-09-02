import type { Obligation, SavingsGoal } from './schemas';

import { z } from 'zod';

import { obligationSchema, savingsGoalSchema } from './schemas';
import { goalCategorySchema, obligationCategorySchema } from './categories';

const integerAmountInput = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, 'Gunakan Rupiah bulat tanpa tanda atau pemisah')
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));

const dateInput = z.iso.date();

export const obligationDraftSchema = z.object({
  name: z.string().trim().min(1).max(80),
  amount: integerAmountInput,
  dueOn: dateInput,
  category: obligationCategorySchema,
});

export const goalDraftSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetAmount: integerAmountInput,
  targetDate: z.union([dateInput, z.literal('')]),
  category: goalCategorySchema,
});

export type ObligationDraftInput = z.input<typeof obligationDraftSchema>;
export type GoalDraftInput = z.input<typeof goalDraftSchema>;

export function buildObligation(
  input: ObligationDraftInput,
  now: Date,
  idFactory: () => string
): Obligation {
  const parsed = obligationDraftSchema.parse(input);
  return obligationSchema.parse({
    id: idFactory(),
    ...parsed,
    status: 'unpaid',
    createdAt: now.toISOString(),
  });
}

export function buildGoal(input: GoalDraftInput, now: Date, idFactory: () => string): SavingsGoal {
  const parsed = goalDraftSchema.parse(input);
  return savingsGoalSchema.parse({
    id: idFactory(),
    name: parsed.name,
    targetAmount: parsed.targetAmount,
    contributedAmount: 0,
    ...(parsed.targetDate ? { targetDate: parsed.targetDate } : {}),
    category: parsed.category,
    status: 'active',
    createdAt: now.toISOString(),
  });
}
