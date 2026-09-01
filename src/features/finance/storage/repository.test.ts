import { it, expect, describe, beforeEach } from 'vitest';

import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

import { createFinanceRepository } from './repository';

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
    expect(result.status).toBe('empty');
    expect(result.snapshot).toBeDefined();
  });

  it('performs valid round-trip', () => {
    const snapshot = makeFinanceSnapshot();
    repo.save(snapshot);
    const result = repo.load();
    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.snapshot.profile?.id).toBe(snapshot.profile?.id);
    }
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
});
