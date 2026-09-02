import { it, expect, describe, beforeEach } from 'vitest';

import { createEmptyFinanceSnapshot } from 'src/features/finance/domain';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { STORAGE_KEY, MAX_IMPORT_BYTES, createFinanceRepository } from './repository';

class StorageFake {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

describe('FinanceRepository', () => {
  let storage: StorageFake;
  let repo: ReturnType<typeof createFinanceRepository>;

  beforeEach(() => {
    storage = new StorageFake();
    repo = createFinanceRepository(storage);
  });

  it('loads empty when storage is empty', () => {
    const result = repo.load();
    expect(result).toEqual({ status: 'empty', snapshot: createEmptyFinanceSnapshot() });
  });

  it('performs valid round-trip', () => {
    const snapshot = makeFinanceSnapshot();
    const saveResult = repo.save(snapshot);
    expect(saveResult).toEqual({ ok: true });

    const result = repo.load();
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.snapshot.profile?.id).toBe(snapshot.profile?.id);
    }
  });

  it('handles quota exceeded error on save', () => {
    const snapshot = makeFinanceSnapshot();
    storage.setItem = () => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw err;
    };
    const saveResult = repo.save(snapshot);
    expect(saveResult).toEqual({ ok: false, code: 'quota' });
  });

  it('rejects invalid snapshot on save', () => {
    const invalidSnapshot = {
      ...makeFinanceSnapshot(),
      transactions: [
        {
          id: '99999999-9999-4999-8999-999999999999',
          type: 'expense',
          amount: -100,
          category: 'other',
          createdAt: '2026-08-01T00:00:00Z',
          note: 'test',
          occurredOn: '2026-08-01',
          source: 'manual',
        },
      ],
    };
    const saveResult = repo.save(invalidSnapshot);
    expect(saveResult).toEqual({ ok: false, code: 'invalid-data' });
  });

  it('handles malformed JSON', () => {
    storage.setItem('sakuflow.finance.v1', '{ invalid json ');
    const result = repo.load();
    expect(result.status).toBe('corrupt');
    if (result.status === 'corrupt') {
      expect(result.rawValue).toBe('{ invalid json ');
      expect(result.snapshot.profile).toBeNull(); // Empty snapshot
    }
  });

  it('handles invalid schema', () => {
    storage.setItem('sakuflow.finance.v1', JSON.stringify({ schemaVersion: 99, data: {} }));
    const result = repo.load();
    expect(result.status).toBe('corrupt');
  });

  it('clears storage', () => {
    repo.save(makeFinanceSnapshot());
    repo.clear();
    expect(repo.load().status).toBe('empty');
  });

  it('clears corrupt raw storage', () => {
    storage.setItem(STORAGE_KEY, '{not-json');
    expect(repo.load().status).toBe('corrupt');

    repo.clear();

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(repo.load().status).toBe('empty');
  });

  it('exports stable json', () => {
    const snapshot = makeFinanceSnapshot();
    const json = repo.exportJson(snapshot);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.data.profile.id).toBe(snapshot.profile?.id);
  });

  it('rejects invalid import', () => {
    expect(() => repo.importJson('{ foo }')).toThrow();
  });

  it('imports the same versioned envelope produced by export', () => {
    const snapshot = makeFinanceSnapshot();
    const envelope = repo.importJson(repo.exportJson(snapshot));

    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.data).toEqual(snapshot);
  });

  it('rejects imports larger than one MiB before parsing', () => {
    const oversized = 'x'.repeat(MAX_IMPORT_BYTES + 1);

    expect(() => repo.importJson(oversized)).toThrow(/1 MiB/);
  });
});
