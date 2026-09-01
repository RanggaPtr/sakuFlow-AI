import type { FinanceSnapshot, PersistenceEnvelope } from 'src/features/finance/domain';

import {
  financeSnapshotSchema,
  CURRENT_SCHEMA_VERSION,
  createEmptyFinanceSnapshot,
} from 'src/features/finance/domain';

import { migrateEnvelope } from './migrations';

export const STORAGE_KEY = 'sakuflow.finance.v1';

export type LoadFinanceResult =
  | { status: 'empty'; snapshot: FinanceSnapshot }
  | { status: 'ready'; snapshot: FinanceSnapshot }
  | { status: 'corrupt'; snapshot: FinanceSnapshot; rawValue: string };

export type PersistenceErrorCode = 'quota' | 'unavailable' | 'invalid-data';
export type SaveFinanceResult = { ok: true } | { ok: false; code: PersistenceErrorCode };

export interface FinanceRepository {
  load(): LoadFinanceResult;
  save(snapshot: FinanceSnapshot): SaveFinanceResult;
  clear(): void;
  exportJson(snapshot: FinanceSnapshot): string;
  importJson(raw: string): FinanceSnapshot;
}

export function createFinanceRepository(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): FinanceRepository {
  return {
    load() {
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) {
          return { status: 'empty', snapshot: createEmptyFinanceSnapshot() };
        }
        try {
          const parsed = JSON.parse(raw);
          const envelope = migrateEnvelope(parsed);
          financeSnapshotSchema.parse(envelope.data);
          return { status: 'ready', snapshot: envelope.data };
        } catch {
          return { status: 'corrupt', snapshot: createEmptyFinanceSnapshot(), rawValue: raw };
        }
      } catch {
        return { status: 'corrupt', snapshot: createEmptyFinanceSnapshot(), rawValue: '' };
      }
    },
    save(snapshot: FinanceSnapshot) {
      try {
        financeSnapshotSchema.parse(snapshot);
      } catch {
        return { ok: false, code: 'invalid-data' };
      }
      try {
        const envelope: PersistenceEnvelope = {
          schemaVersion: CURRENT_SCHEMA_VERSION,
          savedAt: new Date().toISOString(),
          data: snapshot,
        };
        storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
        return { ok: true };
      } catch (e) {
        if (
          e instanceof DOMException &&
          (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ) {
          return { ok: false, code: 'quota' };
        }
        return { ok: false, code: 'unavailable' };
      }
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
      financeSnapshotSchema.parse(envelope.data);
      return envelope.data;
    },
  };
}
