'use client';

import type { ReactNode } from 'react';
import type { FinanceState, FinanceAction } from './finance-reducer';
import type { FinanceRepository } from 'src/features/finance/storage/repository';
import type { FinanceSnapshot, PersistenceEnvelope } from 'src/features/finance/domain';

import { useRef, useState, useEffect, useReducer, createContext } from 'react';

import { createFinanceRepository } from 'src/features/finance/storage/repository';
import { toLocalYyyyMmDd, createEmptyFinanceSnapshot } from 'src/features/finance/domain';

import { selectIsOnboarded } from './selectors';
import { financeReducer } from './finance-reducer';

export interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  persistence: {
    reset(): Promise<boolean>;
    replace(snapshot: FinanceSnapshot): Promise<boolean>;
    exportJson(): string;
    parseImport(raw: string): PersistenceEnvelope;
    confirmImport(envelope: PersistenceEnvelope): void;
  };
  persistenceError?: string;
}

export const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, {
    hydration: 'idle',
    snapshot: createEmptyFinanceSnapshot(),
    corruptRawValue: null,
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  const repoRef = useRef<FinanceRepository | null>(null);

  useEffect(() => {
    repoRef.current = createFinanceRepository(window.localStorage);
    const result = repoRef.current.load();
    dispatch({ type: 'hydrate', result });
  }, []);

  useEffect(() => {
    if (state.hydration === 'ready' && selectIsOnboarded(state)) {
      const res = repoRef.current?.save(state.snapshot);
      if (res && !res.ok) {
        if (res.code === 'quota') {
          setSaveError('Penyimpanan lokal penuh. Mohon ekspor data Anda agar tidak hilang.');
        } else {
          setSaveError('Gagal menyimpan perubahan. Data mungkin tidak valid.');
        }
      } else {
        setSaveError(null);
      }
    }
  }, [state]);

  const handleExport = () => {
    if (!repoRef.current) return;
    const json = repoRef.current.exportJson(state.snapshot);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakuflow-backup-${toLocalYyyyMmDd(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRepository = () => {
    if (!repoRef.current) throw new Error('Penyimpanan belum siap');
    return repoRef.current;
  };

  const persistence: FinanceContextValue['persistence'] = {
    async reset() {
      try {
        await getRepository().clear();
      } catch {
        setPersistenceError('Gagal menghapus data tersimpan. Data lama dipertahankan.');
        return false;
      }
      setPersistenceError(null);
      dispatch({ type: 'reset' });
      return true;
    },
    async replace(snapshot) {
      const result = getRepository().save(snapshot);
      if (!result.ok) {
        setPersistenceError(
          result.code === 'quota'
            ? 'Penyimpanan lokal penuh. Hapus ruang atau ekspor data lalu coba lagi.'
            : 'Gagal menyimpan onboarding. Periksa data lalu coba lagi.'
        );
        return false;
      }
      setPersistenceError(null);
      dispatch({ type: 'replace-from-import', snapshot });
      return true;
    },
    exportJson() {
      return getRepository().exportJson(state.snapshot);
    },
    parseImport(raw) {
      return getRepository().importJson(raw);
    },
    confirmImport(envelope) {
      dispatch({ type: 'replace-from-import', snapshot: envelope.data });
    },
  };

  return (
    <FinanceContext.Provider
      value={{ state, dispatch, persistence, persistenceError: persistenceError ?? undefined }}
    >
      {persistenceError && (
        <div role="alert" style={{ padding: 12, backgroundColor: '#fef2f2', color: '#991b1b' }}>
          {persistenceError}
        </div>
      )}
      {saveError && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            textAlign: 'center',
            borderBottom: '1px solid #f87171',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>⚠️ {saveError}</p>
          <button
            onClick={handleExport}
            style={{
              padding: '4px 12px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Ekspor JSON
          </button>
        </div>
      )}
      {children}
    </FinanceContext.Provider>
  );
}
