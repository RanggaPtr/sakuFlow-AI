import type { FinanceSnapshot, PersistenceEnvelope } from 'src/features/finance/domain';

import { EMPTY_FINANCE_SNAPSHOT, CURRENT_SCHEMA_VERSION } from 'src/features/finance/domain';

import { migrateEnvelope } from './migrations';

export const STORAGE_KEY = 'sakuflow.finance.v1';

export type LoadFinanceResult =
  | { status: 'empty'; snapshot: FinanceSnapshot }
  | { status: 'ready'; snapshot: FinanceSnapshot }
  | { status: 'corrupt'; snapshot: FinanceSnapshot; rawValue: string };

export interface FinanceRepository {
  load(): LoadFinanceResult;
  save(snapshot: FinanceSnapshot): void;
  clear(): void;
  exportJson(snapshot: FinanceSnapshot): string;
  importJson(raw: string): FinanceSnapshot;
}

export function createFinanceRepository(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): FinanceRepository {
  return {
    load() {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return { status: 'empty', snapshot: EMPTY_FINANCE_SNAPSHOT };
      }
      try {
        const parsed = JSON.parse(raw);
        const envelope = migrateEnvelope(parsed);
        return { status: 'ready', snapshot: envelope.data };
      } catch {
        return { status: 'corrupt', snapshot: EMPTY_FINANCE_SNAPSHOT, rawValue: raw };
      }
    },
    save(snapshot: FinanceSnapshot) {
      const envelope: PersistenceEnvelope = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      };
      storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    },
    clear() {
      storage.removeItem(STORAGE_KEY);
    },
    exportJson(snapshot: FinanceSnapshot) {
      const envelope: PersistenceEnvelope = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        data: snapshot,
      };
      return JSON.stringify(envelope, null, 2);
    },
    importJson(raw: string) {
      const parsed = JSON.parse(raw);
      const envelope = migrateEnvelope(parsed);
      return envelope.data;
    },
  };
}
