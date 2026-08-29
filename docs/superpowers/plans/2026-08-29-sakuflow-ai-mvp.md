# SakuFlow AI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun MVP web SakuFlow AI yang membantu mahasiswa dan first-jobber Indonesia mencatat arus kas lewat kalimat natural, mengetahui batas aman belanja per hari, dan menyimulasikan pembelian tanpa login atau integrasi bank.

**Architecture:** Pertahankan Next.js App Router dan pola page → view → section milik Venturo. Data keuangan hidup di `FinanceProvider` berbasis reducer dan disimpan melalui repository `localStorage` berversi. Kalkulasi dilakukan oleh pure deterministic domain engine; Gemini hanya melakukan structured extraction dan penjelasan, dengan parser/ringkasan lokal sebagai fallback.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, MUI 9, React Hook Form, Zod 4, Vitest, React Testing Library, Google Gen AI SDK (`@google/genai`), Yarn 1.

## Global Constraints

- Source of truth produk: `docs/superpowers/specs/2026-08-29-sakuflow-ai-design.md`.
- Kerjakan tepat satu checkpoint dalam satu sesi. Setelah gate lulus dan commit dibuat, berhenti dan serahkan checkpoint report untuk review mandor.
- Jangan mengerjakan checkpoint berikutnya meskipun terlihat mudah.
- Mulai setiap checkpoint hanya ketika `git status --short` kosong. Bila ada perubahan yang tidak dikenal, berhenti dan laporkan; jangan reset atau hapus.
- Gunakan Yarn saja. Jangan membuat `package-lock.json` dan jangan menjalankan npm.
- Ikuti pola repository: route page tipis, logika tampilan di `src/sections`, komponen reusable di `src/components`, konfigurasi env hanya dibaca di `src/lib/env.ts` lalu diekspos melalui `CONFIG`.
- Semua nama file baru memakai kebab-case. Gunakan alias `src/...`, bukan import relatif yang dalam.
- Semua jumlah uang disimpan sebagai integer rupiah. Tolak `NaN`, angka negatif yang tidak diizinkan, pecahan rupiah, dan nilai melebihi `Number.MAX_SAFE_INTEGER`.
- AI tidak pernah menghitung saldo, batas aman, alokasi, atau status kesehatan keuangan dan tidak pernah langsung mengubah state. AI hanya menghasilkan kandidat terstruktur yang divalidasi Zod dan selalu dipreview pengguna sebelum disimpan.
- Jangan mengirim nama pengguna, nomor rekening, saldo lengkap, atau histori transaksi ke Gemini. Parsing hanya mengirim kalimat aktif; penjelasan insight hanya mengirim agregat sintetis/minimal.
- MVP tetap berfungsi saat `GEMINI_API_KEY` kosong, kuota habis, respons lambat, atau respons tidak valid.
- Tidak ada login, cloud database, koneksi bank/e-wallet/QRIS, pembayaran, pinjaman, investasi, OCR, multi-currency, atau shared wallet.
- UI berbahasa Indonesia, mobile-first, dapat dipakai dengan keyboard, memiliki focus state, label form, dan kontras yang layak.
- Jangan menambahkan chart library. Gunakan komponen MUI, progress bar, dan angka ringkas.
- Jangan menaruh mock data pada jalur produksi selain demo fixture yang hanya dimuat atas tindakan eksplisit pengguna.
- Prioritas rilis adalah seluruh P0 pada design spec. Checkpoint 9–10 juga mengambil backup/restore dan demo fixture dari P1 karena langsung memperkuat keamanan serta presentasi lomba. Edit/hapus transaksi, dark-mode polish, dan variasi insight tambahan ditunda sampai MVP kompetisi stabil; jangan menyelipkannya ke checkpoint ini.
- Verifikasi minimum checkpoint: test terkait → `yarn lint` → `yarn fm:check` → `yarn tsc:check`. Jalankan `yarn build` pada checkpoint yang menyentuh route, env, atau dependency serta pada checkpoint final.
- Setiap commit hanya berisi satu checkpoint dan memakai pesan commit yang ditentukan di bawah.

---

## Definition of Done MVP

MVP dinyatakan selesai hanya bila seluruh kondisi ini benar:

- Pengguna baru dapat memasukkan kalimat onboarding, mengoreksi hasil ekstraksi, melihat alokasi, lalu mengonfirmasi profil lokal.
- Pengguna dapat menambahkan pemasukan, pengeluaran, tanggungan, target tabungan, dan menandai tanggungan lunas.
- Dashboard menampilkan saldo cair, cadangan kewajiban, dana aman dipakai, sisa hari, serta batas aman per hari yang cocok dengan domain engine.
- Simulasi “Aman Nggak?” tidak mengubah state sampai pengguna memilih mencatat pembelian.
- Semua aksi AI memiliki preview dan fallback manual/lokal.
- Refresh browser mempertahankan data; data rusak memunculkan recovery UI, bukan crash.
- Semua automated checks dan manual demo script lulus tanpa API key; smoke test dengan API key juga lulus bila key disediakan.
- Tidak ada secret di commit dan working tree bersih.

## Execution Protocol for Gemini Worker

Pada awal setiap checkpoint:

```powershell
git status --short
git log -1 --oneline
node --version
yarn --version
```

Expected: status kosong, Node `>=22.12`, Yarn `1.22.x`. Bila berbeda, berhenti dan laporkan.

Pada akhir setiap checkpoint, worker wajib mengirim format berikut lalu berhenti:

```text
CHECKPOINT: <nomor dan nama>
STATUS: PASS | BLOCKED
COMMIT: <hash dan pesan, atau none>
CHANGED FILES: <daftar>
TESTS: <command = hasil>
MANUAL CHECK: <yang diperiksa>
DEVIATIONS: none | <penjelasan dan alasan>
RISKS/BLOCKERS: none | <penjelasan>
NEXT CHECKPOINT: <nomor>, belum dikerjakan
```

Jika test gagal, jangan menutupi kegagalan dengan menghapus assertion atau melemahkan type. Temukan sebabnya, lakukan perubahan minimum, dan ulangi gate.

## Checkpoint Map

| Checkpoint | Hasil yang harus tersedia | Commit |
|---|---|---|
| 0 | Test harness, CI gate, dan worker contract | `chore: establish SakuFlow test and execution foundation` |
| 1 | Kontrak domain, schema, money/date utilities | `feat: define SakuFlow finance domain` |
| 2 | Budget projection dan purchase simulation engine | `feat: add deterministic budget engine` |
| 3 | Local repository, reducer, provider, selector | `feat: add local-first finance state` |
| 4 | Gemini boundary, API routes, dan fallback parser | `feat: add resilient AI interpretation layer` |
| 5 | Branding, route, finance shell, navigation | `feat: add SakuFlow application shell` |
| 6 | Onboarding natural language dan confirmation | `feat: add guided financial onboarding` |
| 7 | Dashboard, transaction history, command composer | `feat: add daily cash flow experience` |
| 8 | Plan management dan simulator “Aman Nggak?” | `feat: add financial plan and purchase simulator` |
| 9 | Insight, recovery, backup, accessibility polish | `feat: add financial insights and data recovery` |
| 10 | Demo fixture, release verification, documentation | `chore: prepare SakuFlow MVP demo release` |

## File Responsibility Map

| Area | Files | Single responsibility |
|---|---|---|
| Domain contracts | `src/features/finance/domain/*` | Schema dan type data; tanpa React, storage, fetch, atau UI |
| Deterministic math | `src/features/finance/engine/*` | Projection, allocation, health, simulator; pure functions |
| Persistence | `src/features/finance/storage/*` | Versioned localStorage envelope, migration, corruption handling |
| Client state | `src/features/finance/state/*` | Reducer, provider, selector, atomic business actions |
| AI contracts | `src/features/finance/ai/contracts.ts` | Zod input/output boundary untuk AI |
| AI provider | `src/features/finance/ai/providers/*` | Provider interface dan Gemini implementation |
| AI fallback | `src/features/finance/ai/fallback/*` | Parser lokal dan template insight tanpa network |
| AI server service | `src/features/finance/ai/service/*` | Privacy projection, provider selection, timeout/error normalization |
| AI client | `src/features/finance/ai/client.ts` | Typed fetch ke route internal; tidak memegang API key |
| API routes | `src/app/api/ai/*/route.ts` | POST validation dan HTTP status mapping saja |
| Application shell | `src/layouts/finance/*` | Header, desktop nav, bottom nav, main container |
| Views | `src/sections/*/*-view.tsx` | Orkestrasi satu route, sesuai page → view → section |
| Feature UI | `src/sections/dashboard/*`, `transactions/*`, `plan/*`, `simulator/*`, `insights/*` | Form/card/dialog spesifik fitur |
| Shared UI | `src/components/sakuflow/*` | Komponen presentational reusable lintas fitur |
| Routes/config | `src/routes/paths.ts`, `src/global-config.ts`, `src/lib/env.ts` | Centralized route, brand, validated environment |
| Tests | `*.test.ts`, `*.test.tsx`, `src/test/*` | Colocated unit/integration tests dan shared fixtures |

### Dependency direction

```text
app route → section view → feature UI → state selectors/actions
                                      ↓
AI route → AI service → provider       domain schemas
                       ↓               ↓
                    Gemini SDK     deterministic engine
                                      ↓
state provider → storage repository → localStorage
```

Domain dan engine tidak boleh mengimpor React, MUI, Next.js, browser storage, atau Gemini SDK.

---

## Checkpoint 0 — Test Harness, CI Gate, and Worker Contract

**Outcome:** Repository memiliki test runner resmi, smoke test, CI Test stage, dan instruksi worker yang menunjuk ke spec serta plan ini.

**Files:**

- Modify: `package.json`
- Modify: `yarn.lock`
- Modify: `Jenkinsfile`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Create: `GEMINI.md`

### Task 0.1 — Capture baseline before dependency changes

- [ ] Run:

```powershell
yarn install --frozen-lockfile
yarn lint
yarn fm:check
yarn tsc:check
yarn build
```

Expected: seluruh command exit 0. Jika skeleton gagal sebelum ada perubahan, simpan output dan berhenti; baseline failure harus diperbaiki atau disetujui mandor dahulu.

### Task 0.2 — Add Vitest and Testing Library

- [ ] Install only these development dependencies:

```powershell
yarn add --dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] Add scripts to `package.json`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

### Task 0.3 — Prove the harness fails then passes

- [ ] Create `src/test/smoke.test.ts` first with a deliberately wrong expectation:

```ts
import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs project tests', () => {
    expect('SakuFlow').toBe('wrong');
  });
});
```

- [ ] Run `yarn test:run`.

Expected: FAIL showing `expected 'SakuFlow' to be 'wrong'`.

- [ ] Change only the expected string to `SakuFlow`, rerun `yarn test:run`.

Expected: PASS, 1 test.

### Task 0.4 — Add CI and worker guardrails

- [ ] Add a Jenkins stage named `Test` after environment preparation and before Lint. It must run `yarn test:run`.
- [ ] Create `GEMINI.md` with this exact operating contract:

```md
# SakuFlow AI Worker Contract

Read these sources completely before editing:
1. `CLAUDE.md`
2. `docs/superpowers/specs/2026-08-29-sakuflow-ai-design.md`
3. `docs/superpowers/plans/2026-08-29-sakuflow-ai-mvp.md`

Execute only the checkpoint explicitly assigned by the mandor. Follow its checkbox order, use tests first, run every checkpoint gate, commit with the prescribed message, send the checkpoint report, and stop. Never proceed to the next checkpoint without approval.

Financial calculations are deterministic domain logic. AI may parse or explain, but must never directly mutate finance state or authoritatively calculate money. Preserve unrelated project files and never commit secrets.
```

### Checkpoint 0 gate

- [ ] Run:

```powershell
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

Expected: all exit 0.

- [ ] Confirm `package-lock.json` does not exist.
- [ ] Commit:

```powershell
git add package.json yarn.lock Jenkinsfile vitest.config.ts src/test GEMINI.md
git commit -m "chore: establish SakuFlow test and execution foundation"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 1 — Finance Domain Contracts

**Outcome:** Seluruh data keuangan mempunyai kontrak Zod dan TypeScript yang konsisten, termasuk normalisasi uang dan tanggal.

**Files:**

- Create: `src/features/finance/domain/categories.ts`
- Create: `src/features/finance/domain/schemas.ts`
- Create: `src/features/finance/domain/money.ts`
- Create: `src/features/finance/domain/date.ts`
- Create: `src/features/finance/domain/index.ts`
- Create: `src/features/finance/domain/schemas.test.ts`
- Create: `src/features/finance/domain/money.test.ts`
- Create: `src/features/finance/test/fixtures.ts`

### Task 1.1 — Define failing schema tests

- [ ] Write tests before implementation covering all cases below:

```ts
import { describe, expect, it } from 'vitest';

import {
  financeSnapshotSchema,
  moneySchema,
  persistenceEnvelopeSchema,
} from 'src/features/finance/domain';
import { makeFinanceSnapshot } from 'src/features/finance/test/fixtures';

describe('finance domain schemas', () => {
  it('accepts a valid snapshot', () => {
    expect(financeSnapshotSchema.parse(makeFinanceSnapshot())).toBeDefined();
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid rupiah value %s',
    (value) => expect(() => moneySchema.parse(value)).toThrow()
  );

  it('rejects an unknown schema version', () => {
    const envelope = { schemaVersion: 99, savedAt: new Date().toISOString(), data: makeFinanceSnapshot() };
    expect(() => persistenceEnvelopeSchema.parse(envelope)).toThrow();
  });
});
```

- [ ] Run `yarn test:run src/features/finance/domain/schemas.test.ts`.

Expected: FAIL because modules do not exist.

### Task 1.2 — Implement exact domain vocabulary

- [ ] In `categories.ts`, export these constants and inferred union types:

```ts
export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export const TRANSACTION_CATEGORIES = [
  'salary',
  'allowance',
  'food',
  'transport',
  'housing',
  'education',
  'entertainment',
  'shopping',
  'health',
  'savings',
  'debt',
  'other',
] as const;
export const OBLIGATION_CATEGORIES = ['housing', 'utilities', 'debt', 'subscription', 'education', 'other'] as const;
export const GOAL_CATEGORIES = ['emergency', 'education', 'device', 'travel', 'lifestyle', 'other'] as const;
```

- [ ] In `schemas.ts`, declare `CURRENT_SCHEMA_VERSION = 1` and Zod schemas with these exact fields:

```ts
FinanceProfile {
  id: string UUID;
  displayName?: string max 40;
  incomeDay: integer 1..31;
  currency: literal 'IDR';
  onboardingCompletedAt: ISO datetime;
}

BudgetCycle {
  id: string UUID;
  startsOn: YYYY-MM-DD;
  nextIncomeOn: YYYY-MM-DD;
  openingBalance: Money;
  bufferAmount: Money;
}

Transaction {
  id: string UUID;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: Money greater than 0;
  occurredOn: YYYY-MM-DD;
  note: string trimmed 1..120;
  source: 'manual' | 'natural-language' | 'simulation' | 'system';
  createdAt: ISO datetime;
}

Obligation {
  id: string UUID;
  name: string trimmed 1..80;
  amount: Money greater than 0;
  dueOn: YYYY-MM-DD;
  category: ObligationCategory;
  status: 'unpaid' | 'paid';
  paidTransactionId?: UUID;
  createdAt: ISO datetime;
}

SavingsGoal {
  id: string UUID;
  name: string trimmed 1..80;
  targetAmount: Money greater than 0;
  contributedAmount: Money;
  targetDate?: YYYY-MM-DD;
  category: GoalCategory;
  status: 'active' | 'completed';
  createdAt: ISO datetime;
}

AllocationSettings {
  bufferMode: literal 'fixed';
  bufferAmount: Money;
}

FinanceSnapshot {
  profile: FinanceProfile | null;
  cycle: BudgetCycle | null;
  transactions: Transaction[];
  obligations: Obligation[];
  goals: SavingsGoal[];
  allocation: AllocationSettings;
}

PersistenceEnvelope {
  schemaVersion: literal 1;
  savedAt: ISO datetime;
  data: FinanceSnapshot;
}
```

- [ ] Add cross-field refinements: `contributedAmount <= targetAmount`; a paid obligation must have `paidTransactionId`; an unpaid obligation must not have it; `nextIncomeOn >= startsOn`.
- [ ] Export inferred types for every schema and an immutable `EMPTY_FINANCE_SNAPSHOT` factory rather than a shared mutable object.

### Task 1.3 — Money and date utilities

- [ ] In `money.ts`, implement and export:

```ts
export function assertMoney(value: number): number;
export function formatRupiah(value: number): string;
export function parseIndonesianMoney(input: string): number | null;
```

`parseIndonesianMoney` must support `28000`, `28.000`, `28 ribu`, `1,5 juta`, and `2 juta`; return `null` for ambiguous/invalid input. Do not use floating rupiah in the returned value.

- [ ] Test exact expectations:

```ts
expect(formatRupiah(1500000)).toBe('Rp1.500.000');
expect(parseIndonesianMoney('28 ribu')).toBe(28000);
expect(parseIndonesianMoney('1,5 juta')).toBe(1500000);
expect(parseIndonesianMoney('gratis')).toBeNull();
```

- [ ] In `date.ts`, implement `isIsoDate`, `daysUntilIncome(today, nextIncomeOn)`, and `clampIncomeDay(year, monthIndex, requestedDay)`. The safe-to-spend divisor includes today, excludes the next income date, and is never less than 1.
- [ ] Test month ends, leap year, today equals income date, and timezone-independent `YYYY-MM-DD` parsing. Do not compute calendar dates by parsing `new Date('YYYY-MM-DD')` into local time; split year/month/day explicitly.

### Task 1.4 — Shared deterministic fixture

- [ ] Create `makeFinanceSnapshot(overrides?)` returning fresh valid entities with fixed UUIDs and fixed dates. Default fixture:

```text
opening balance: Rp4.000.000
cycle: 2026-08-01 through next income 2026-08-11
buffer: Rp200.000
unpaid rent: Rp1.000.000
unpaid internet: Rp350.000
active laptop goal: Rp500.000 target, Rp0 contributed
transactions: empty
```

Do not call `Date.now()` or `crypto.randomUUID()` from test fixtures.

### Checkpoint 1 gate

- [ ] Run:

```powershell
yarn test:run src/features/finance/domain
yarn lint
yarn fm:check
yarn tsc:check
git diff --check
```

- [ ] Commit:

```powershell
git add src/features/finance
git commit -m "feat: define SakuFlow finance domain"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 2 — Deterministic Budget Engine

**Outcome:** Angka utama dashboard dan hasil simulasi berasal dari pure functions yang sudah diuji dengan contoh nominal nyata.

**Files:**

- Create: `src/features/finance/engine/projection.ts`
- Create: `src/features/finance/engine/projection.test.ts`
- Create: `src/features/finance/engine/simulate-purchase.ts`
- Create: `src/features/finance/engine/simulate-purchase.test.ts`
- Create: `src/features/finance/engine/index.ts`

### Task 2.1 — Write projection tests first

- [ ] Define the public result contract in the test expectation:

```ts
export type FinanceHealth = 'safe' | 'watch' | 'risk';

export interface FinanceProjection {
  recordedIncome: number;
  spent: number;
  liquidBalance: number;
  unpaidObligationReserve: number;
  remainingGoalReserve: number;
  bufferReserve: number;
  safePool: number;
  remainingDays: number;
  safeToSpendPerDay: number;
  health: FinanceHealth;
  reasonCodes: ProjectionReasonCode[];
}
```

- [ ] Test the default fixture as of `2026-08-01`:

```ts
expect(projectBudget(snapshot, '2026-08-01')).toMatchObject({
  recordedIncome: 4_000_000,
  spent: 0,
  liquidBalance: 4_000_000,
  unpaidObligationReserve: 1_350_000,
  remainingGoalReserve: 500_000,
  bufferReserve: 200_000,
  safePool: 1_950_000,
  remainingDays: 10,
  safeToSpendPerDay: 195_000,
  health: 'safe',
});
```

- [ ] Add tests for: one Rp450.000 expense produces safe pool Rp1.500.000 and Rp150.000/day; paid obligation is not reserved; completed goal is not reserved; negative pool clamps to zero; income transaction increases liquid; date after next income uses divisor 1 and adds `cycle-stale` reason.
- [ ] Run projection test and confirm it fails because implementation is missing.

### Task 2.2 — Implement the budget projection exactly

- [ ] Implement these formulas without rounding percentages or calling AI:

```text
recordedIncome = openingBalance + sum(income transactions)
spent = sum(expense transactions)
liquidBalance = recordedIncome - spent
unpaidObligationReserve = sum(unpaid obligations)
remainingGoalReserve = sum(max(targetAmount - contributedAmount, 0) for active goals)
bufferReserve = allocation.bufferAmount
safePool = max(liquidBalance - unpaidObligationReserve - remainingGoalReserve - bufferReserve, 0)
remainingDays = max(calendar days including today and excluding nextIncomeOn, 1)
safeToSpendPerDay = floor(safePool / remainingDays)
```

- [ ] Emit stable reason codes, not prose:

```ts
type ProjectionReasonCode =
  | 'healthy-buffer'
  | 'daily-limit-low'
  | 'reserves-exceed-liquid'
  | 'overdue-obligation'
  | 'cycle-stale';
```

- [ ] Apply health rules in this order:

```text
risk: safePool is 0, reserves exceed liquid, or any unpaid obligation is overdue
watch: safeToSpendPerDay < 2% of recordedIncome OR safePool < bufferReserve
safe: otherwise
```

For zero income, avoid division; status is `risk`.

### Task 2.3 — Test and implement pure purchase simulation

- [ ] Define:

```ts
export interface PurchaseSimulationInput {
  snapshot: FinanceSnapshot;
  today: string;
  amount: number;
}

export interface PurchaseSimulationResult {
  verdict: 'safe' | 'tight' | 'unsafe';
  before: FinanceProjection;
  after: FinanceProjection;
  impact: {
    safePoolChange: number;
    dailyLimitChange: number;
  };
  reasonCodes: SimulationReasonCode[];
}
```

- [ ] Write tests proving:
  - Rp100.000 purchase on default fixture is `safe`.
  - Rp1.800.000 leaves less than one current daily allowance and is `tight`.
  - Rp2.000.000 crosses the safe pool and is `unsafe`.
  - Input snapshot is deeply unchanged after simulation.
  - Amount 0, negative, fractional, or unsafe integer throws a domain validation error.
- [ ] Implement by appending a synthetic expense only to a cloned in-memory snapshot, then call `projectBudget`. Do not dispatch, save to localStorage, or call AI.
- [ ] Use exact verdict order:

```text
unsafe: after.safePool === 0 OR amount > before.safePool
tight: after.safeToSpendPerDay < floor(before.safeToSpendPerDay * 0.5)
safe: otherwise
```

### Checkpoint 2 gate

- [ ] Run:

```powershell
yarn test:run src/features/finance/engine
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
git diff --check
```

- [ ] Commit:

```powershell
git add src/features/finance/engine
git commit -m "feat: add deterministic budget engine"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 3 — Local-First Repository and Finance State

**Outcome:** Semua data dimuat, divalidasi, diubah secara atomic, dan disimpan lokal melalui satu state boundary.

**Files:**

- Create: `src/features/finance/storage/migrations.ts`
- Create: `src/features/finance/storage/repository.ts`
- Create: `src/features/finance/storage/repository.test.ts`
- Create: `src/features/finance/state/finance-reducer.ts`
- Create: `src/features/finance/state/finance-reducer.test.ts`
- Create: `src/features/finance/state/selectors.ts`
- Create: `src/features/finance/state/finance-provider.tsx`
- Create: `src/features/finance/state/use-finance.ts`
- Create: `src/features/finance/state/index.ts`

### Task 3.1 — Versioned local repository

- [ ] Define stable storage key `sakuflow.finance.v1` and these results:

```ts
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
```

- [ ] Write tests first using a fresh in-memory `Storage` fake: empty load, valid round-trip, malformed JSON, invalid schema, clear, stable export, invalid import.
- [ ] Confirm test fails because repository is missing.
- [ ] Implement `createFinanceRepository(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>)`. Validate both read and write with `persistenceEnvelopeSchema`.
- [ ] In `migrations.ts`, expose `migrateEnvelope(input: unknown): PersistenceEnvelope`. Version 1 returns validated data. Unknown/missing versions throw `UnsupportedFinanceDataError`; do not silently discard them.
- [ ] Repository `load()` returns a fresh empty snapshot on corrupt data but preserves `rawValue` for recovery download. It must not immediately overwrite corrupt storage.

### Task 3.2 — Reducer actions and invariants

- [ ] Define exact state and actions:

```ts
export interface FinanceState {
  hydration: 'idle' | 'ready' | 'corrupt';
  snapshot: FinanceSnapshot;
  corruptRawValue: string | null;
}

export type FinanceAction =
  | { type: 'hydrate'; result: LoadFinanceResult }
  | { type: 'complete-onboarding'; snapshot: FinanceSnapshot }
  | { type: 'add-transaction'; transaction: Transaction }
  | { type: 'add-obligation'; obligation: Obligation }
  | { type: 'mark-obligation-paid'; obligationId: string; transaction: Transaction }
  | { type: 'add-goal'; goal: SavingsGoal }
  | { type: 'contribute-to-goal'; goalId: string; amount: number; transaction: Transaction }
  | { type: 'replace-from-import'; snapshot: FinanceSnapshot }
  | { type: 'reset' };
```

- [ ] Write reducer tests first for every action plus unknown IDs and duplicate IDs.
- [ ] Atomic obligation payment rules: transaction must be an expense, category `debt` or matching mapped category, amount must equal obligation amount, then obligation becomes paid and receives the transaction ID. Reject already-paid or unknown obligation.
- [ ] Atomic goal contribution rules: transaction must be an expense with category `savings`, same amount as contribution, and contribution may not exceed remaining target. Append expense and increment `contributedAmount`; mark completed at target.
- [ ] Add a regression test proving a contribution lowers liquid balance and remaining goal reserve by the same amount, so safe pool is unchanged.
- [ ] Do not mutate nested arrays or entities. Freeze the input fixture in tests to catch mutation.

### Task 3.3 — Selectors, provider, and persistence lifecycle

- [ ] Export selectors:

```ts
selectIsOnboarded(state): boolean
selectProjection(state, today): FinanceProjection | null
selectRecentTransactions(state, limit): Transaction[]
selectUnpaidObligations(state): Obligation[]
selectActiveGoals(state): SavingsGoal[]
```

- [ ] Create client-only `FinanceProvider`. On first effect, instantiate browser repository and dispatch `hydrate`. On later state changes, save only when hydration is `ready` and onboarding exists.
- [ ] Do not access `window` or `localStorage` during server render.
- [ ] Expose `useFinance()` returning `{ state, dispatch }` and throw a clear error outside provider.
- [ ] Add a provider test using React Testing Library that verifies server-safe initial render, hydration from storage, and save after a dispatched transaction. Use a small test consumer; do not test implementation details.

### Checkpoint 3 gate

- [ ] Run:

```powershell
yarn test:run src/features/finance/storage src/features/finance/state
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
git diff --check
```

- [ ] Commit:

```powershell
git add src/features/finance/storage src/features/finance/state
git commit -m "feat: add local-first finance state"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 4 — Resilient Gemini Interpretation Layer

**Outcome:** Tiga AI use case tersedia melalui server-only Gemini adapter, schema validation, privacy projection, timeout normalization, dan fallback lokal.

**Files:**

- Modify: `package.json`
- Modify: `yarn.lock`
- Modify: `.env.example`
- Modify: `src/lib/env.ts`
- Modify: `src/global-config.ts`
- Create: `src/features/finance/ai/contracts.ts`
- Create: `src/features/finance/ai/json-schemas.ts`
- Create: `src/features/finance/ai/errors.ts`
- Create: `src/features/finance/ai/providers/ai-provider.ts`
- Create: `src/features/finance/ai/providers/gemini-provider.ts`
- Create: `src/features/finance/ai/providers/gemini-provider.test.ts`
- Create: `src/features/finance/ai/fallback/local-command-parser.ts`
- Create: `src/features/finance/ai/fallback/local-command-parser.test.ts`
- Create: `src/features/finance/ai/fallback/local-insight.ts`
- Create: `src/features/finance/ai/service/ai-service.ts`
- Create: `src/features/finance/ai/service/ai-service.test.ts`
- Create: `src/features/finance/ai/client.ts`
- Create: `src/app/api/ai/parse-onboarding/route.ts`
- Create: `src/app/api/ai/parse-command/route.ts`
- Create: `src/app/api/ai/explain-insight/route.ts`
- Create: `src/app/api/ai/parse-command/route.test.ts`

### Task 4.1 — Add server-only configuration

- [ ] Install production dependency:

```powershell
yarn add @google/genai
```

- [ ] Add to `.env.example` with no real secret:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
```

- [ ] Extend the server env schema in `src/lib/env.ts`: `GEMINI_API_KEY` is optional string; `GEMINI_MODEL` defaults to `gemini-2.5-flash-lite`.
- [ ] Expose `CONFIG.gemini.apiKey` and `CONFIG.gemini.model`. Never prefix the key with `NEXT_PUBLIC_` and never read `process.env` elsewhere.

### Task 4.2 — Define AI boundary contracts

- [ ] In `contracts.ts`, implement Zod schemas and inferred types for:

```ts
interface ParseOnboardingInput { text: string; today: string }
interface ParsedOnboarding {
  monthlyIncome: number | null;
  incomeDay: number | null;
  openingBalance: number | null;
  bufferAmount: number | null;
  obligations: Array<{ name: string; amount: number; dueDay: number | null; category: ObligationCategory }>;
  goals: Array<{ name: string; targetAmount: number; targetDate: string | null; category: GoalCategory }>;
  assumptions: string[];
  confidence: number;
}

type CommandIntent =
  | 'add_income'
  | 'add_expense'
  | 'add_obligation'
  | 'mark_obligation_paid'
  | 'create_goal'
  | 'simulate_purchase'
  | 'ask_summary'
  | 'unknown';

interface ParseCommandInput { text: string; today: string }
interface ParsedCommand {
  intent: CommandIntent;
  amount: number | null;
  category: string | null;
  note: string | null;
  occurredOn: string | null;
  referencedName: string | null;
  confidence: number;
  assumptions: string[];
}

interface InsightExplanationInput {
  health: FinanceHealth;
  safeToSpendPerDay: number;
  remainingDays: number;
  obligationReserve: number;
  goalReserve: number;
  reasonCodes: ProjectionReasonCode[];
}

interface InsightExplanation {
  headline: string;
  explanation: string;
  actions: string[];
}
```

- [ ] Limits: input text 1..500 chars; confidence 0..1; max 5 obligations, 5 goals, 5 assumptions, 3 actions; all user-facing strings trimmed and length-bounded; all amounts use `moneySchema`.
- [ ] Define provider interface exactly:

```ts
export interface AiProvider {
  parseOnboarding(input: ParseOnboardingInput): Promise<ParsedOnboarding>;
  parseCommand(input: ParseCommandInput): Promise<ParsedCommand>;
  explainInsight(input: InsightExplanationInput): Promise<InsightExplanation>;
}
```

### Task 4.3 — Gemini structured output adapter

- [ ] Put the three JSON Schema constants in `json-schemas.ts`. They must mirror the Zod output schemas and set `additionalProperties: false`. Keep JSON Schema separate so unsupported Zod refinements are not sent to Gemini.
- [ ] In `gemini-provider.ts`, accept an injected client-shaped dependency for unit tests and construct `GoogleGenAI({ apiKey })` only in the production factory.
- [ ] Each call uses `models.generateContent` with:

```ts
config: {
  abortSignal: AbortSignal.timeout(8_000),
  responseMimeType: 'application/json',
  responseJsonSchema: parsedCommandJsonSchema, // gunakan schema output yang sesuai pada dua metode lain
  temperature: 0,
  maxOutputTokens: <512 parsing, 384 insight>,
}
```

- [ ] Prompts must explicitly say: return JSON only; never invent missing money; use integer IDR; dates are `YYYY-MM-DD`; use `null` for unknown; do not give investment/loan advice.
- [ ] Parse `response.text` with `JSON.parse`, then the matching Zod schema. Map timeout, SDK error, empty text, invalid JSON, and schema mismatch to typed `AiUnavailableError` or `AiInvalidResponseError` without returning provider internals to users.
- [ ] Unit test with a fake client: correct model/config, valid parse, invalid JSON, invalid amount, timeout/error. Never make a real network call in automated tests.

### Task 4.4 — Local fallback and service policy

- [ ] Implement `parseCommandLocally(input)` for unambiguous Indonesian patterns:

```text
"makan 28 ribu" → add_expense, food, 28000
"bensin 50 ribu" → add_expense, transport, 50000
"gajian 4 juta" → add_income, salary, 4000000
"nabung 200 ribu" → add_expense, savings, 200000
"aman nggak beli headset 300 ribu" → simulate_purchase, 300000
```

If more than one amount is present or the action is ambiguous, return `unknown` with confidence below `0.6`.

- [ ] `ai-service.ts` policy:
  - Validate input first.
  - If key is absent, use local parser for command and return an explicit `source: 'local'` envelope; onboarding returns a manually completable partial result; insight uses deterministic template.
  - If Gemini succeeds, return `source: 'gemini'`.
  - If Gemini throws, return fallback plus `degraded: true`; do not emit HTTP 500 for recoverable provider failure.
  - Never log raw user finance text in production.
- [ ] Add deterministic Indonesian insight templates keyed by reason code. Amounts must be formatted using `formatRupiah` from engine output only.

### Task 4.5 — Route handlers and browser client

- [ ] Each POST route validates JSON, calls one service method, and returns a stable envelope:

```ts
type AiApiResponse<T> =
  | { ok: true; data: T; source: 'gemini' | 'local'; degraded: boolean }
  | { ok: false; code: 'INVALID_INPUT'; message: string };
```

- [ ] Invalid JSON or schema returns HTTP 400. Unexpected server configuration/code errors return 500 with generic Indonesian message; no stack trace or SDK body.
- [ ] `client.ts` exports `parseOnboarding`, `parseCommand`, `explainInsight`, accepts optional `AbortSignal`, and validates successful response data again with Zod.
- [ ] Route test mocks the service boundary and covers 200 Gemini, 200 degraded fallback, 400 invalid input. Do not mock Next internals beyond constructing `Request`.

### Checkpoint 4 gate

- [ ] Run:

```powershell
yarn test:run src/features/finance/ai src/app/api/ai
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
git grep -n "AIza" -- . ":(exclude)yarn.lock"
```

Expected: all gates pass; secret search returns no matches.

- [ ] Commit:

```powershell
git add package.json yarn.lock .env.example src/lib/env.ts src/global-config.ts src/features/finance/ai src/app/api/ai
git commit -m "feat: add resilient AI interpretation layer"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 5 — SakuFlow Brand, Routes, and Application Shell

**Outcome:** Aplikasi tidak lagi membuka marketing homepage; seluruh route produk memakai finance shell responsive dan provider lokal.

**Files:**

- Modify: `src/global-config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `src/routes/paths.ts`
- Move/replace: `src/app/(home)/layout.tsx` → `src/app/(finance)/layout.tsx`
- Move/replace: `src/app/(home)/page.tsx` → `src/app/(finance)/page.tsx`
- Create: `src/app/(finance)/transactions/page.tsx`
- Create: `src/app/(finance)/plan/page.tsx`
- Create: `src/app/(finance)/insights/page.tsx`
- Create: `src/layouts/finance/finance-layout.tsx`
- Create: `src/layouts/finance/finance-nav.tsx`
- Create: `src/layouts/finance/nav-config.ts`
- Create: `src/layouts/finance/index.ts`
- Create: `src/components/sakuflow/sakuflow-mark.tsx`
- Create: `src/components/sakuflow/page-loading.tsx`
- Create: `src/sections/dashboard/dashboard-view.tsx`
- Create: `src/sections/transactions/transactions-view.tsx`
- Create: `src/sections/plan/plan-view.tsx`
- Create: `src/sections/insights/insights-view.tsx`
- Create: `src/layouts/finance/finance-layout.test.tsx`

### Task 5.1 — Lock route contract with a failing test

- [ ] Update `paths.ts` to export:

```ts
export const paths = {
  dashboard: '/',
  transactions: '/transactions',
  plan: '/plan',
  insights: '/insights',
} as const;
```

Preserve other path entries only if still imported; do not keep a second source of truth for these four routes.

- [ ] Write a finance layout test that expects visible brand `SakuFlow`, desktop or bottom links named `Beranda`, `Transaksi`, `Rencana`, `Insight`, and a `<main>` landmark.
- [ ] Run the test and confirm failure before layout implementation.

### Task 5.2 — Replace root route group without route collision

- [ ] Use `git mv` for `(home)` to `(finance)` so history is preserved. Replace the marketing layout and page contents; do not create two pages resolving to `/`.
- [ ] `src/app/(finance)/layout.tsx` wraps children in this order:

```tsx
<FinanceProvider>
  <FinanceLayout>{children}</FinanceLayout>
</FinanceProvider>
```

- [ ] Every page stays thin and only returns its matching `*-view` component. Placeholder views may show the route title and `PageLoading` while hydration is idle; no financial feature logic is implemented yet.

### Task 5.3 — Build responsive finance shell

- [ ] `nav-config.ts` contains exactly the four path/label/icon entries. Use existing MUI icons package if present; otherwise use simple text/Box shapes—do not add another icon dependency.
- [ ] At widths below `md`, show a fixed bottom navigation and add bottom padding so content is not covered. At `md` and above, show a compact top/side navigation and hide bottom nav.
- [ ] Active route uses `usePathname`; `aria-current="page"` must be present.
- [ ] `SakuFlowMark` uses text and a simple CSS/MUI mark, not a remote image. Brand treatment: calm navy/indigo primary, mint positive, amber warning, red risk; do not rely on color alone for status.
- [ ] Keep root layout’s existing theme/provider ordering unless a test demonstrates a conflict.

### Task 5.4 — Product metadata

- [ ] Set app name/title/description to SakuFlow AI and Indonesian copy in `global-config.ts`, root metadata, and manifest. Use `lang="id"` on `<html>`.
- [ ] Do not rename the package unless required by tooling; brand identity is user-facing config.

### Checkpoint 5 gate

- [ ] Run:

```powershell
yarn test:run src/layouts/finance
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

- [ ] Start `yarn dev`, open all four routes at mobile and desktop width, confirm no console error and navigation does not cover content. Stop the server.
- [ ] Commit:

```powershell
git add src/app src/routes/paths.ts src/global-config.ts src/layouts/finance src/components/sakuflow src/sections
git commit -m "feat: add SakuFlow application shell"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 6 — Guided Natural-Language Onboarding

**Outcome:** Pengguna baru dapat menceritakan kondisi uang, mereview hasil, memperbaiki data, melihat allocation preview, lalu menyimpan profil lokal.

**Files:**

- Modify: `src/sections/dashboard/dashboard-view.tsx`
- Create: `src/sections/onboarding/onboarding-view.tsx`
- Create: `src/sections/onboarding/natural-input-step.tsx`
- Create: `src/sections/onboarding/extraction-review-step.tsx`
- Create: `src/sections/onboarding/allocation-preview-step.tsx`
- Create: `src/sections/onboarding/onboarding-form-schema.ts`
- Create: `src/sections/onboarding/build-onboarding-snapshot.ts`
- Create: `src/sections/onboarding/onboarding-view.test.tsx`

### Task 6.1 — Specify the user journey in failing integration tests

- [ ] Mock only `src/features/finance/ai/client.ts`; use the real provider/reducer and an in-memory repository.
- [ ] Test happy path:
  1. Screen asks `Ceritain kondisi uangmu bulan ini`.
  2. User enters `Gajian 4 juta tanggal 11, kos 1 juta, internet 350 ribu, mau sisihkan 500 ribu buat laptop`.
  3. Click `Bantu susun`.
  4. AI extraction appears in editable form.
  5. State remains not-onboarded before confirmation.
  6. User clicks `Lihat pembagian` and sees obligation, goal, buffer, safe pool.
  7. User clicks `Pakai rencana ini`; state becomes onboarded and dashboard is shown.
- [ ] Test degraded path: AI client rejects, manual fields remain usable, and copy says `AI sedang tidak tersedia, kamu tetap bisa lanjut manual.`
- [ ] Test confidence policy: `>=0.85` normal prefill; `0.60..0.84` fields have `Periksa lagi`; `<0.60` does not silently fill sensitive amounts and opens manual form.
- [ ] Run the test and confirm failure because onboarding UI is missing.

### Task 6.2 — Build a deterministic snapshot assembler

- [ ] `onboarding-form-schema.ts` uses React Hook Form + Zod and requires: opening balance, next income date/day, fixed buffer; income may be zero only with explicit confirmation. Obligations/goals are editable arrays.
- [ ] `buildOnboardingSnapshot(form, now, idFactory)` is pure. Inject `now` and `idFactory` so tests are stable. It creates profile, cycle, allocation, obligations, goals, and an optional income transaction only when the form explicitly includes additional income distinct from opening balance.
- [ ] Do not double-count the stated monthly income as both opening balance and income transaction. The confirmation copy must make the distinction visible.
- [ ] Due-day conversion clamps to the current/next cycle month; a due date before cycle start moves to the next month.

### Task 6.3 — Implement the three-step onboarding

- [ ] Natural step has one textarea, two example chips, `Bantu susun`, and `Isi manual`. Disable submit for blank input and show progress while parsing.
- [ ] Review step renders ordinary labeled inputs; assumptions are shown as a checklist, never silently accepted. Amounts display as Rupiah but form state remains integer.
- [ ] Allocation preview calls `projectBudget` against the candidate snapshot. Show `Disiapkan untuk tanggungan`, `Target tabungan`, `Dana jaga-jaga`, and `Aman dipakai per hari`.
- [ ] Only `Pakai rencana ini` dispatches `complete-onboarding`. Back navigation keeps user edits in component state.
- [ ] On corrupt hydration, do not show onboarding; recovery is handled in Checkpoint 9.

### Checkpoint 6 gate

- [ ] Run:

```powershell
yarn test:run src/sections/onboarding
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

- [ ] Manual check without `GEMINI_API_KEY`: complete manual/degraded onboarding on a 390px viewport, refresh, confirm dashboard remains onboarded.
- [ ] Commit:

```powershell
git add src/sections/onboarding src/sections/dashboard/dashboard-view.tsx
git commit -m "feat: add guided financial onboarding"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 7 — Dashboard, Transaction History, and Command Composer

**Outcome:** Pengguna dapat memahami kondisi hari ini dan mencatat pemasukan/pengeluaran melalui bahasa natural atau form manual dengan preview wajib.

**Files:**

- Modify: `src/sections/dashboard/dashboard-view.tsx`
- Modify: `src/sections/transactions/transactions-view.tsx`
- Create: `src/sections/dashboard/financial-hero.tsx`
- Create: `src/sections/dashboard/reserve-summary.tsx`
- Create: `src/sections/dashboard/recent-activity.tsx`
- Create: `src/sections/dashboard/command-composer.tsx`
- Create: `src/sections/dashboard/command-preview-dialog.tsx`
- Create: `src/sections/dashboard/dashboard-view.test.tsx`
- Create: `src/sections/transactions/transaction-list.tsx`
- Create: `src/sections/transactions/transaction-filters.tsx`
- Create: `src/sections/transactions/manual-transaction-dialog.tsx`
- Create: `src/sections/transactions/transactions-view.test.tsx`
- Create: `src/components/sakuflow/money-amount.tsx`
- Create: `src/components/sakuflow/health-chip.tsx`
- Create: `src/components/sakuflow/empty-state.tsx`

### Task 7.1 — Dashboard behavior tests

- [ ] Render with the default deterministic fixture and freeze today as `2026-08-01`. Assert visible:
  - `Aman dipakai hari ini` and `Rp195.000`.
  - `Saldo cair` and `Rp4.000.000`.
  - `Tersimpan untuk tanggungan` and `Rp1.350.000`.
  - `10 hari menuju pemasukan berikutnya`.
- [ ] Add an expense via reducer, rerender, and assert daily amount updates to `Rp150.000`.
- [ ] Ensure amounts have accessible labels and status has text/icon, not color alone.
- [ ] Run and capture expected failing test.

### Task 7.2 — Build the daily dashboard

- [ ] `financial-hero.tsx` receives only `FinanceProjection`; it does not call storage or AI. Use a large safe-to-spend number and one concise explanation based on reason codes.
- [ ] `reserve-summary.tsx` shows obligation, goal, buffer reserves with MUI cards/progress. No chart dependency.
- [ ] `recent-activity.tsx` shows latest five transactions sorted by `occurredOn`, then `createdAt`, descending. Empty state copy: `Belum ada catatan. Coba tulis “makan 25 ribu”.`

### Task 7.3 — Command preview before mutation

- [ ] Write an integration test:
  1. Type `makan 28 ribu`.
  2. Mock parsed command `add_expense`, amount 28,000, category food.
  3. Submit and assert a preview dialog appears.
  4. Assert transaction count has not changed.
  5. Edit note if desired, click `Simpan transaksi`, assert exactly one transaction is added.
  6. Reopen, cancel, assert no extra transaction.
- [ ] `command-composer.tsx` calls the typed AI client, displays source indicator only as subtle copy (`Dipahami AI` or `Dipahami secara lokal`), and offers `Isi manual` on unknown/low confidence/error.
- [ ] Preview maps only `add_income` and `add_expense` to a transaction in this checkpoint. Other recognized intents show a link/action to their proper future flow; they must not be coerced into expenses.
- [ ] Generate IDs and timestamps at the confirmation boundary, not while parsing. Natural-language source is `natural-language`; manual dialog source is `manual`.

### Task 7.4 — Transaction route

- [ ] Render all transactions with income/expense sign, category label, note, and Indonesian-formatted date.
- [ ] Provide client-side filters `Semua`, `Masuk`, `Keluar` plus text search over note/category. Filtering must not alter stored data.
- [ ] Manual dialog uses RHF + Zod. Required: type, amount > 0, category compatible with type, note, date within a reasonable ISO range. Confirmation dispatches once.
- [ ] P0 does not edit/delete transactions. Do not add incomplete controls.

### Checkpoint 7 gate

- [ ] Run:

```powershell
yarn test:run src/sections/dashboard src/sections/transactions
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

- [ ] Manual check: add an expense using local fallback, refresh, verify list and dashboard update; cancel another preview and verify no mutation.
- [ ] Commit:

```powershell
git add src/sections/dashboard src/sections/transactions src/components/sakuflow
git commit -m "feat: add daily cash flow experience"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 8 — Financial Plan and “Aman Nggak?” Simulator

**Outcome:** Tanggungan dan tujuan tabungan dapat dikelola, sementara pembelian dapat disimulasikan tanpa efek samping lalu dicatat secara eksplisit.

**Files:**

- Modify: `src/sections/plan/plan-view.tsx`
- Modify: `src/sections/dashboard/dashboard-view.tsx`
- Modify: `src/sections/dashboard/command-composer.tsx`
- Create: `src/sections/plan/obligation-list.tsx`
- Create: `src/sections/plan/obligation-dialog.tsx`
- Create: `src/sections/plan/goal-list.tsx`
- Create: `src/sections/plan/goal-dialog.tsx`
- Create: `src/sections/plan/goal-contribution-dialog.tsx`
- Create: `src/sections/plan/allocation-card.tsx`
- Create: `src/sections/plan/plan-view.test.tsx`
- Create: `src/sections/simulator/purchase-simulator.tsx`
- Create: `src/sections/simulator/simulation-result.tsx`
- Create: `src/sections/simulator/purchase-simulator.test.tsx`

### Task 8.1 — Atomic plan action tests

- [ ] In the Plan integration test, assert:
  - Creating a Rp350.000 obligation adds it as unpaid and immediately reduces safe pool.
  - Marking it paid creates exactly one expense and removes its reserve; repeated payment is rejected.
  - Creating a Rp500.000 goal adds remaining reserve.
  - Contributing Rp100.000 creates a savings expense and raises contribution; safe pool does not change from the atomic contribution itself.
  - Completing the target marks goal completed.
- [ ] Confirm failures before implementing UI.

### Task 8.2 — Plan route and forms

- [ ] `obligation-list` groups `Mendatang`, `Terlambat`, and `Lunas`; each item shows due date and amount. `Tandai lunas` opens confirmation, not immediate mutation.
- [ ] Obligation payment transaction note is `Bayar <obligation.name>` with matching date and amount. Map obligation categories to the closest transaction category using a pure exported mapping.
- [ ] Goal cards show contributed/target progress and never exceed 100%. Contribution dialog defaults to remaining target when smaller than suggested input and rejects over-contribution.
- [ ] Allocation card permits only fixed buffer editing in this MVP. Because the current reducer contract lacks an allocation action, add `update-allocation` to the union and reducer with tests before wiring the form.
- [ ] Natural command intents `add_obligation`, `mark_obligation_paid`, and `create_goal` route into the same preview/dialog components; no direct dispatch from parser output.

### Task 8.3 — Purchase simulator tests first

- [ ] Integration test:
  1. Enter Rp300.000 and description `headset`.
  2. Click `Cek dulu`.
  3. See verdict, before/after safe pool, and before/after daily limit.
  4. Verify state transaction count remains unchanged.
  5. Click `Catat sebagai pengeluaran`, inspect a prefilled preview, then confirm.
  6. Verify one `simulation` source expense is added.
- [ ] Test closing result, editing amount, and running again never reuses a stale result.

### Task 8.4 — Simulator UI and intent routing

- [ ] Place a prominent `Aman Nggak?` action on the dashboard. The component may be a dialog/bottom sheet; do not create another route.
- [ ] Render verdict vocabulary:
  - `safe`: `Masih aman`.
  - `tight`: `Bisa, tapi bakal ketat`.
  - `unsafe`: `Sebaiknya jangan dulu`.
- [ ] Always show the deterministic numerical reason. AI explanation is added in Checkpoint 9 and may never replace these figures.
- [ ] `simulate_purchase` natural command opens the simulator prefilled. `ask_summary` navigates/focuses insights. `unknown` remains manual clarification.

### Checkpoint 8 gate

- [ ] Run:

```powershell
yarn test:run src/sections/plan src/sections/simulator src/features/finance/state
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

- [ ] Manual check: create obligation, pay it, contribute to goal, simulate a safe and unsafe purchase, refresh, and verify all persisted values.
- [ ] Commit:

```powershell
git add src/sections/plan src/sections/simulator src/sections/dashboard src/features/finance/state
git commit -m "feat: add financial plan and purchase simulator"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 9 — Insights, Recovery, Backup, and Accessibility

**Outcome:** Insight tetap berguna tanpa AI, kegagalan storage dapat dipulihkan, data dapat dibawa keluar/masuk, dan alur utama lolos pemeriksaan aksesibilitas dasar.

**Files:**

- Modify: `src/sections/insights/insights-view.tsx`
- Modify: `src/sections/dashboard/dashboard-view.tsx`
- Modify: `src/features/finance/state/finance-provider.tsx`
- Modify: `src/features/finance/state/finance-reducer.ts`
- Create: `src/features/finance/insights/build-insights.ts`
- Create: `src/features/finance/insights/build-insights.test.ts`
- Create: `src/sections/insights/insight-card.tsx`
- Create: `src/sections/insights/ai-explanation.tsx`
- Create: `src/sections/insights/insights-view.test.tsx`
- Create: `src/sections/settings/data-controls.tsx`
- Create: `src/sections/settings/data-controls.test.tsx`
- Create: `src/sections/recovery/recovery-view.tsx`
- Create: `src/sections/recovery/recovery-view.test.tsx`

### Task 9.1 — Deterministic insight model

- [ ] Define and test:

```ts
export interface FinancialInsight {
  id: string;
  severity: 'positive' | 'attention' | 'risk';
  title: string;
  body: string;
  actionLabel?: string;
  actionTarget?: '/' | '/transactions' | '/plan';
}

buildInsights(snapshot, projection, today): FinancialInsight[]
```

- [ ] Deterministic rules in priority order:
  1. Overdue unpaid obligation.
  2. Reserves exceed liquid.
  3. Safe-to-spend is zero.
  4. Spending category exceeds 30% of recorded income.
  5. Goal due within 30 days but progress below 70%.
  6. Positive buffer and no risks.
- [ ] Return at most five stable insights, no random language and no AI calls.

### Task 9.2 — Optional AI explanation with strict privacy

- [ ] `insights-view` renders deterministic cards immediately. `Jelaskan dengan AI` is user-triggered; do not call Gemini automatically on render.
- [ ] Pass only the `InsightExplanationInput` aggregate contract. Never pass transaction notes, profile name, or full arrays.
- [ ] Show AI copy in a clearly labelled expandable block. On timeout/error, show local template and keep the rest of the page functional.
- [ ] Simulator may reuse the same aggregate explanation action, but deterministic verdict/figures remain primary.
- [ ] Test that the client mock receives only aggregate keys and that fallback appears after rejection.

### Task 9.3 — Corrupt storage recovery and reset

- [ ] When hydration status is `corrupt`, root dashboard renders `RecoveryView` instead of onboarding/dashboard.
- [ ] Recovery offers exactly:
  - `Unduh data mentah` as a local text/JSON file.
  - `Mulai ulang` behind a confirmation requiring the phrase `HAPUS DATA`.
  - `Impor cadangan` using validated repository import.
- [ ] Never overwrite corrupt storage until a recovery action is confirmed.
- [ ] Reset clears repository and reducer, then shows onboarding. Test cancel and exact confirmation phrase.

### Task 9.4 — JSON backup and restore

- [ ] Add `Data & privasi` controls at the bottom of Insights: export valid versioned envelope, import `.json` max 1 MB, reset.
- [ ] Import parses and validates before showing a summary preview. Only `Ganti dengan data ini` dispatches `replace-from-import`.
- [ ] Invalid version/schema shows a user-safe error and does not alter current state. Add tests comparing snapshot before/after invalid import.

### Task 9.5 — Accessibility and responsive audit

- [ ] Ensure every dialog has accessible title/description, initial focus, Escape close unless destructive confirmation is in progress, and focus return.
- [ ] Ensure every money input has visible label and error text connected through `aria-describedby`.
- [ ] Add `aria-live="polite"` to parse/simulation status and `role="alert"` only to actionable errors.
- [ ] Verify keyboard-only onboarding, transaction, obligation payment, simulator, import, reset.
- [ ] Check layouts at 320px, 390px, 768px, and 1280px with no horizontal scroll.
- [ ] Honor `prefers-reduced-motion`; do not add required animations.

### Checkpoint 9 gate

- [ ] Run:

```powershell
yarn test:run src/features/finance/insights src/sections/insights src/sections/recovery src/sections/settings
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
```

- [ ] Complete the keyboard and responsive audit, recording results in the checkpoint report.
- [ ] Commit:

```powershell
git add src/features/finance src/sections/insights src/sections/recovery src/sections/settings src/sections/dashboard
git commit -m "feat: add financial insights and data recovery"
```

- [ ] Send checkpoint report and stop.

---

## Checkpoint 10 — Demo Fixture, Release Verification, and Handoff

**Outcome:** MVP siap dipresentasikan dengan data demo eksplisit, dokumentasi operasional, seluruh gate hijau, dan tidak ada secret atau unfinished placeholder.

**Files:**

- Modify: `README.md`
- Modify: `src/app/manifest.ts`
- Create: `src/features/finance/demo/demo-snapshot.ts`
- Create: `src/features/finance/demo/demo-snapshot.test.ts`
- Create: `src/sections/settings/demo-controls.tsx`
- Create: `docs/demo-script.md`
- Create: `docs/checkpoint-report-template.md`
- Modify only if still relevant: `src/app/sitemap.ts`, `src/app/robots.ts`

### Task 10.1 — Deterministic demo data

- [ ] Create `createDemoSnapshot()` using fixed relative business semantics but current cycle dates injected as an argument. Demo identity is generic, not a real person. Include:
  - Rp4.500.000 opening balance.
  - Rent Rp1.200.000 and internet Rp350.000 unpaid.
  - Emergency goal Rp600.000 with Rp200.000 contributed.
  - Buffer Rp250.000.
  - Three expenses across food, transport, entertainment.
- [ ] Test the fixture validates and produces nonzero but safe daily spending for the documented demo date.
- [ ] Add `Muat data demo` behind a confirmation in Data & privasi. It must explicitly replace current data and never run automatically.

### Task 10.2 — Product README and demo script

- [ ] Rewrite README product-facing sections with:
  - Problem and target user.
  - Feature list and deterministic/AI boundary.
  - Requirements Node/Yarn.
  - Install and run commands.
  - Optional Gemini env setup, free/local fallback behavior, and privacy warning.
  - Test/build commands.
  - LocalStorage limitation and backup instructions.
  - Checkpoint execution instruction for Gemini worker.
- [ ] `docs/demo-script.md` must be a 3–5 minute exact walkthrough:
  1. Start with empty local data.
  2. Natural onboarding sentence.
  3. Confirm allocation and dashboard.
  4. Record `makan 28 ribu` via preview.
  5. Simulate `headset 300 ribu` and show no mutation.
  6. Record or cancel it.
  7. Mark obligation paid and show recalculation.
  8. Show deterministic insight and optional AI explanation.
  9. Refresh and show persistence/export.
- [ ] `docs/checkpoint-report-template.md` contains the exact report schema from this plan.

### Task 10.3 — Remove only proven dead product entry points

- [ ] Run `rg` for imports and routes tied to the old marketing home. Do not bulk-delete the Venturo component gallery or reusable primitives.
- [ ] Old article/support routes may remain unreachable if removing them would expand risk. If sitemap/robots reference removed root behavior, update them to the four SakuFlow routes.
- [ ] Remove placeholder copy from the four product views. Search:

```powershell
rg -n "TODO|FIXME|coming soon|lorem|placeholder|Venturo" src docs README.md
```

Expected: no unfinished product placeholder. Legitimate historical/reusable component references must be listed in the report rather than blindly renamed.

### Task 10.4 — Full automated release gate

- [ ] Run from a clean dependency state:

```powershell
yarn install --frozen-lockfile
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
git diff --check
git status --short
```

Expected: all exit 0; status shows only intended checkpoint files before commit.

- [ ] Secret scan:

```powershell
git grep -n -E "(AIza[0-9A-Za-z_-]{20,}|GEMINI_API_KEY=.+)" -- . ":(exclude)yarn.lock"
```

Expected: no real secret. `.env.example` may contain only an empty value.

### Task 10.5 — Manual release matrix

- [ ] Without Gemini key:
  - Empty onboarding and manual fallback.
  - Local command parsing.
  - Dashboard calculations.
  - Transaction persistence.
  - Obligation/goal atomic actions.
  - Safe/tight/unsafe simulation.
  - Insight fallback.
  - Export/import/reset/recovery.
- [ ] With a test Gemini key only if one is provided outside Git:
  - Natural onboarding returns valid editable structure.
  - Each command intent parses or degrades safely.
  - AI explanation receives aggregate data only.
  - Invalid/ambiguous sentence never auto-saves.
- [ ] Browser matrix: current Chrome/Edge desktop and 390px responsive viewport. Record any limitation honestly.

### Task 10.6 — Final commit and release report

- [ ] Commit:

```powershell
git add README.md src/features/finance/demo src/sections/settings docs/demo-script.md docs/checkpoint-report-template.md src/app/manifest.ts src/app/sitemap.ts src/app/robots.ts
git commit -m "chore: prepare SakuFlow MVP demo release"
```

If optional sitemap/robots files do not exist or were not changed, omit them from `git add` rather than creating empty work.

- [ ] Run final proof after commit:

```powershell
git status --short
git log --oneline -11
yarn test:run
yarn build
```

Expected: clean working tree, eleven checkpoint commits including this plan’s implementation sequence, tests and build pass.

- [ ] Send final checkpoint report including demo readiness, known limitations, and exact local run command. Stop.

---

## Mandor Review Checklist After Every Checkpoint

- Scope: Does the diff contain only the assigned checkpoint?
- Contract: Do public types and file responsibilities match this plan/spec?
- Safety: Can AI output mutate state without preview, or influence authoritative math? The answer must be no.
- Privacy: Is raw or excessive financial context sent/logged? The answer must be no.
- Resilience: Does the feature still work without Gemini and after refresh?
- Tests: Was a meaningful failing test observed before implementation, and do tests cover behavior rather than internal details?
- UX: Is Indonesian copy clear, mobile usable, and the primary action obvious?
- Repository: Yarn only, no secret, no unrelated deletion, clean commit.

Approval phrase for the next checkpoint should name it explicitly, for example: `Checkpoint 4 approved; execute Checkpoint 5 only.`

## Final Traceability Matrix

| Approved requirement | Implemented at checkpoint | Proof |
|---|---:|---|
| Local, no login | 3, 5 | Repository/provider tests; refresh manual check |
| Natural Indonesian input | 4, 6, 7 | Parser/service and onboarding/composer tests |
| Income, expense, obligations, goals | 1, 3, 7, 8 | Schema, reducer, integration tests |
| AI recommends allocation | 6, 9 | Editable extraction plus deterministic preview/explanation |
| Safe-to-spend per day | 2, 7 | Exact engine fixtures and dashboard assertions |
| “Aman Nggak?” simulation | 2, 8 | Pure-function and no-mutation integration tests |
| Business value for young users | 7, 8, 9 | Daily guidance, planning, actionable insight |
| Gemini cheap/free option | 4 | Flash-Lite default, optional key, local fallback |
| Privacy and financial safety | 2, 4, 9 | Deterministic math, aggregate-only AI, backup/recovery |
| Competition-ready demo | 10 | Demo script, fixture, release matrix |

## Explicit Non-Goals for This Plan

Do not extend the plan during execution with authentication, cloud sync, bank/e-wallet connection, payment execution, debt/credit recommendations, investment products, receipt OCR, push reminders, social features, multi-currency, or native mobile packaging. Capture those as post-competition ideas only after MVP release.
