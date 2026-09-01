export class UnsupportedFinanceDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFinanceDataError';
  }
}

import type { PersistenceEnvelope } from 'src/features/finance/domain';

import { persistenceEnvelopeSchema } from 'src/features/finance/domain';

export function migrateEnvelope(input: unknown): PersistenceEnvelope {
  if (typeof input !== 'object' || input === null) {
    throw new UnsupportedFinanceDataError('Invalid envelope structure');
  }

  const asObj = input as Record<string, unknown>;
  const version = asObj.schemaVersion;

  if (version !== 1) {
    throw new UnsupportedFinanceDataError(`Unsupported schema version: ${version}`);
  }

  return persistenceEnvelopeSchema.parse(input);
}
