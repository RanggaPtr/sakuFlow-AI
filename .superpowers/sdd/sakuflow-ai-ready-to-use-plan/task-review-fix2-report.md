# Review fix round 2 — release readiness checkpoint

Status: **ready for handoff**

This checkpoint completes the second review pass for the local-first SakuFlow
finance product. The containing commit is the release checkpoint for this
report; it has not been pushed.

## Completed behaviors

- AI `simulate_purchase` now calculates and renders the pure purchase
  simulation result. Confirmation never adds a transaction; recording it is a
  separate explicit user action. `ask_summary` renders a deterministic,
  non-mutating financial summary. `mark_obligation_paid` validates an exact
  unpaid target and shows an actionable error for missing or already-paid
  obligations.
- Recurring income is calendar-accounted in projection only from its due date,
  without changing current liquid balance or double-counting opening balance.
  The next income date and amount are visible in onboarding and dashboard
  summaries, with before/due/recorded boundary coverage.
- Dashboard now shows liquid balance, obligation/goal/buffer reserves, safe
  pool, daily allowance, health status with reason, next income, five recent
  transactions, and a clear “Aman Nggak?” purchase-check CTA.
- Transactions support Semua/Masuk/Keluar filters, note/category search,
  documented newest-first stable ordering, strict amount validation, edit with
  preserved `id` and `createdAt`, and confirmed deletion.
- Plan groups obligations into Mendatang/Terlambat/Lunas and persists a
  strictly validated dana jaga-jaga allocation. Obligation and goal creation
  remain validated, confirmed, and persistent.
- Savings-goal status is schema-checked against contribution progress. Reset
  awaits the clear result, navigates only on success, and keeps a visible
  recovery warning on failure.
- Robots metadata is noindex/nofollow at both the route and document metadata
  levels. The old external data API URL is optional; local finance boot no
  longer depends on legacy backend environment variables.
- Active branding and shared SEO identity now use SakuFlow; the app uses the
  Next 16 `proxy` convention. Active route registry, sitemap, README, Docker,
  and environment examples contain only the SakuFlow product paths. Legacy
  article/support/API examples remain isolated and are not active routes.

## TDD evidence

Focused RED failures were observed for AI simulation/summary/payment safety,
recurring-income projection boundaries, dashboard completeness, transaction
filters/edit, planning grouping/allocation, goal invariants, reset navigation,
and SakuFlow branding. Each behavior was implemented and its focused test
turned GREEN before the final full-suite run.

## Verification gates

All gates passed on 2026-09-02 from the working tree included in the
containing checkpoint commit:

| Gate | Result |
|---|---|
| `yarn test:run` | PASS — 30 files, 142 tests |
| `yarn lint` | PASS — zero warnings/errors |
| `yarn fm:check` | PASS |
| `yarn tsc:check` | PASS |
| `yarn build` | PASS — production routes and proxy generated successfully |

## Remaining concerns

- Production still requires an operator-provided `NEXT_PUBLIC_SITE_URL` and,
  when AI is desired, the provider endpoint/key/model in `.env.prod`; the
  application remains usable with deterministic local parsing when AI is
  omitted.
- The conservative reducer policy rejects deletion of a savings expense while
  goal contributions exist because the current data model has no explicit
  transaction-to-goal linkage. A future model can replace this with atomic
  reversal when linkage is available.
- Legacy template components and external API modules remain in the source
  tree for reuse, but no active SakuFlow route imports or exposes them.
- Browser/device smoke testing and provider quota/error behavior remain
  deployment-level checks; automated tests, static gates, and production build
  are green.
