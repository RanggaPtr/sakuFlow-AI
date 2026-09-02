# SakuFlow AI demo script

This script is intended for integrated browser QA after the local gates pass.

1. Open a clean browser profile and complete onboarding with a current balance,
   recurring income, future payday, and buffer. Confirm that navigation occurs
   only after the save succeeds.
2. On Dashboard, check saldo cair, dana aman, reserve breakdown, health reason,
   recent transactions, and the “Aman Nggak?” CTA.
3. Use the purchase simulator, change ledger data in another tab, and verify
   that recording requires a refreshed result and second confirmation.
4. Add a manual transaction, edit it, filter by Masuk/Keluar, search its note,
   and verify deletion confirmation.
5. In Rencana, create an obligation and goal. Add a goal contribution, cancel
   once, then confirm once. Verify Mendatang/Terlambat/Lunas grouping.
6. Try the AI assistant with a transaction and each supported action. Confirm
   category, source/confidence, preview, and no mutation before confirmation.
7. Advance a due cycle with “Mulai siklus baru / Catat pemasukan rutin” and
   verify recurring income appears exactly once.
8. Export, import, and reset from Settings; verify failure messages are
   actionable and data is not lost on failed persistence.

Browser, breakpoint, Docker, and provider-quota evidence remains pending until
an operator runs this script in the target environment.
