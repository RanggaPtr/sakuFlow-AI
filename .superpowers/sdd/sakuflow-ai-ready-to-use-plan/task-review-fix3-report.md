# Review fix round 3 — final targeted release checkpoint

Status: **ready for integrated QA handoff**

This checkpoint addresses the final targeted review wave on top of
`ad6f877`. The containing commit is local only and has not been pushed.

## Completed review items

- Recurring income is now an explicitly labeled future forecast only while
  `nextIncomeOn > today`. It is zero on and after the due date, never infers a
  salary from arbitrary income transactions, and never changes current liquid
  balance or safe pool.
- Purchase simulation re-runs against the latest snapshot immediately before
  recording. A material verdict/pool/daily-limit change replaces the preview,
  blocks the write, and requires a fresh second confirmation.
- The external AI system prompt documents every supported discriminated intent,
  exact field names, allowed transaction/obligation/goal categories, integer
  amount/date requirements, and explicitly excludes secrets or hidden context.
- AI-edited transaction drafts are schema-validated immediately before
  dispatch. Invalid amount/NaN, date, or note fields keep the draft open with a
  visible action error and no success mutation.
- Editing savings transactions is rejected while any goal contribution exists,
  matching the conservative deletion invariant.
- Dashboard recent transactions now use the same canonical date-first,
  created-time-second comparator as the transaction list selector.
- Goal contributions use a validated in-app dialog, then a separate explicit
  confirmation. Cancel has no mutation and confirmation dispatches once.
- Finance navigation is responsive: mobile bottom navigation appears below
  `md`; desktop top navigation appears from `md`; labels are Beranda,
  Transaksi, Rencana, Insight, Pengaturan, with active `aria-current` and
  touch-sized controls.

## TDD evidence

The new focused tests were first observed RED for stale recurring income,
canonical sorting, savings edit safety, responsive navigation, AI prompt
coverage, stale simulation, draft validation, and contribution confirmation.
After minimal implementations, the focused suite passed 40/40 tests.

## Verification gates

Fresh final gates passed on 2026-09-02 from the working tree included in the
containing checkpoint commit:

| Gate | Result |
|---|---|
| Focused round-three suite | PASS — 8 files, 40 tests |
| `yarn test:run` | PASS — 31 files, 149 tests |
| `yarn lint` | PASS — zero warnings/errors |
| `yarn fm:check` | PASS |
| `yarn tsc:check` | PASS |
| `yarn build` | PASS — production routes and proxy generated successfully |

## Remaining concerns

- Production still needs the operator's real `NEXT_PUBLIC_SITE_URL` and, when
  desired, AI provider endpoint/key/model in `.env.prod`. AI remains usable
  through deterministic local fallback when omitted.
- Savings deletion/edit remains conservatively rejected while contributions
  exist because the data model has no explicit transaction-to-goal linkage.
- Legacy template/API modules remain in source for reuse but are not imported
  by active SakuFlow product routes.
- Browser/device smoke testing, accessibility review at real breakpoints, and
  provider quota/error behavior remain integrated deployment QA tasks.
