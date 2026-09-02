# Round 5 audit-fix report

Date: 2026-09-02
Base: `104d8a5 fix(finance): harden final release deployment and cycle flow`

## Delivered

- Cycle rollover now carries only transactions before the new cycle start,
  rejects negative carry-forward, and accepts an explicit
  `recordRecurringIncome` choice. Salary is recorded exactly once only when
  the user checks the option; same-day transactions remain in the new cycle.
  The dashboard disables rollover for negative carry and explains recovery.
- `/api/ai/parse` now returns a validated `{ intent, source, confidence,
  degraded }` envelope. External provider success is `external`; missing or
  failed providers are `local` and degraded. The client validates this
  envelope and preserves provenance fields.
- Every AI action preview displays source and confidence, including obligation,
  goal, simulation, paid-obligation, and summary intents. Transaction drafts
  retain the same metadata.
- Shared `canModifyTransaction` and `canDeleteTransaction` policies protect
  paid-obligation payments and savings transactions linked to contributed
  goals. Reducer and transaction-list UI use the same policy; protected rows
  are disabled and explain why.

## Verification evidence

- Focused round-5 suite: 6 files, 44 tests passed.
- `yarn test:run`: 35 files, 166 tests passed.
- `yarn lint`: passed with `--max-warnings=0`.
- `yarn fm:check`: passed.
- `yarn tsc:check`: passed.
- `yarn build`: passed; all finance routes and `/api/ai/parse` compiled.
- `git diff --check`: passed before commit.

## Pending / concerns

- No push performed. Browser walkthrough and clean-checkout Docker verification
  remain root-level release checks from round 4.
- Existing legacy marketing/article/support source remains preserved as
  inactive reusable skeleton code; no bulk deletion was performed.
