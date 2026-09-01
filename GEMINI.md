# SakuFlow AI Worker Contract

Read these sources completely before editing:
1. `CLAUDE.md`
2. `docs/superpowers/specs/2026-08-29-sakuflow-ai-design.md`
3. `docs/superpowers/plans/2026-08-29-sakuflow-ai-mvp.md`

Execute only the checkpoint explicitly assigned by the mandor. Follow its checkbox order, use tests first, run every checkpoint gate, commit with the prescribed message, send the checkpoint report, and stop. Never proceed to the next checkpoint without approval.

Financial calculations are deterministic domain logic. AI may parse or explain, but must never directly mutate finance state or authoritatively calculate money. Preserve unrelated project files and never commit secrets.
