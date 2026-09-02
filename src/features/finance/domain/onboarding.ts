import type { FinanceSnapshot } from './schemas';

import { z } from 'zod';

import { toLocalYyyyMmDd } from './date';
import { financeSnapshotSchema } from './schemas';

const integerIdrInput = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, 'Gunakan Rupiah bulat tanpa tanda atau pemisah')
  .transform(Number)
  .pipe(z.number().int().min(0).max(Number.MAX_SAFE_INTEGER));

export const onboardingInputSchema = z.object({
  currentBalance: integerIdrInput,
  recurringIncome: integerIdrInput.refine((amount) => amount > 0, {
    message: 'Pemasukan rutin harus lebih dari nol',
  }),
  nextPayday: z.string(),
  fixedBuffer: integerIdrInput,
});

export type OnboardingInput = z.input<typeof onboardingInputSchema>;

export function buildOnboardingSnapshot(
  input: OnboardingInput,
  now: Date,
  idFactory: () => string
): FinanceSnapshot {
  const parsed = onboardingInputSchema.parse(input);
  const startsOn = toLocalYyyyMmDd(now);
  const nextPayday = z.iso.date().parse(parsed.nextPayday);

  if (nextPayday <= startsOn) {
    throw new Error('Tanggal gajian berikutnya harus setelah hari ini');
  }

  return financeSnapshotSchema.parse({
    profile: {
      id: idFactory(),
      incomeDay: Number(nextPayday.slice(-2)),
      currency: 'IDR',
      onboardingCompletedAt: now.toISOString(),
    },
    cycle: {
      id: idFactory(),
      startsOn,
      nextIncomeOn: nextPayday,
      openingBalance: parsed.currentBalance,
      recurringIncome: parsed.recurringIncome,
      bufferAmount: parsed.fixedBuffer,
    },
    allocation: { bufferMode: 'fixed', bufferAmount: parsed.fixedBuffer },
    transactions: [],
    obligations: [],
    goals: [],
  });
}
