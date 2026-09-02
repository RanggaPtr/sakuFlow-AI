export class UnsupportedFinanceDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFinanceDataError';
  }
}

import type { PersistenceEnvelope } from 'src/features/finance/domain';

import { z } from 'zod';

import {
  legacyBudgetCycleSchema,
  financeSnapshotBaseSchema,
  persistenceEnvelopeSchema,
} from 'src/features/finance/domain';

const legacyFinanceSnapshotSchema = financeSnapshotBaseSchema.extend({
  cycle: legacyBudgetCycleSchema.nullable(),
});

const legacyPersistenceEnvelopeSchema = persistenceEnvelopeSchema.extend({
  schemaVersion: z.literal(1),
  data: legacyFinanceSnapshotSchema,
});

export function migrateEnvelope(input: unknown): PersistenceEnvelope {
  if (typeof input !== 'object' || input === null) {
    throw new UnsupportedFinanceDataError('Invalid envelope structure');
  }

  const asObj = input as Record<string, unknown>;
  const version = asObj.schemaVersion;

  if (version === 1) {
    const legacy = legacyPersistenceEnvelopeSchema.parse(input);
    return persistenceEnvelopeSchema.parse({
      ...legacy,
      schemaVersion: 2,
      data: {
        ...legacy.data,
        cycle: legacy.data.cycle ? { ...legacy.data.cycle, recurringIncome: 0 } : null,
      },
    });
  }

  if (version !== 2) {
    throw new UnsupportedFinanceDataError(`Unsupported schema version: ${version}`);
  }

  return persistenceEnvelopeSchema.parse(input);
}
