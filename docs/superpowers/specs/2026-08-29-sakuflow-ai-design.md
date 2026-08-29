# SakuFlow AI — Product and System Design

## Document status

- Date: 29 August 2026
- Status: proposed design for user review
- Target: Venturo Build Day working MVP
- Implementation repository: `E:\Project\Venturo\sakuFlow-AI`
- Base: Venturo Skeleton Next.js 16, React 19, TypeScript, and MUI 9

## 1. Product summary

SakuFlow AI is a local-first personal cash-flow assistant for Indonesian students and first-jobbers with relatively predictable monthly income or allowance. It helps users understand how much money is genuinely safe to spend until their next payday after accounting for obligations, goals, and current spending.

The core user question is:

> “Dengan kondisi keuanganku sekarang, aman tidak kalau aku mengeluarkan uang ini?”

SakuFlow is plan-first rather than tracker-first. Transaction tracking supports the plan; it is not the product's main value. The differentiating outputs are a current safe-to-spend amount, an explainable allocation plan, and the “Aman Nggak?” purchase simulation.

## 2. Goals and success criteria

### Product goals

1. Let a first-time user describe their finances in everyday Indonesian rather than fill a long form.
2. Produce an understandable monthly allocation after reserving obligations and user-defined goals.
3. Let users record income and expenses with short natural-language commands.
4. Show a deterministic safe-to-spend amount through the next expected income date.
5. Simulate a potential purchase without modifying real financial records.
6. Provide concise AI explanations without allowing an LLM to control balances or financial arithmetic.
7. Continue functioning when the AI provider is unavailable.

### Demo success criteria

The live demo must complete this story in under five minutes:

1. Enter a sample monthly financial situation in one natural-language message.
2. Confirm the structured data extracted by AI.
3. Show the generated allocation and safe-to-spend amount.
4. Add one expense using a natural-language command.
5. Simulate a discretionary purchase using “Aman Nggak?”.
6. Show how the simulated purchase changes the user's daily allowance and goal feasibility.
7. Display one concise, actionable insight.

## 3. Target user and problem

### Primary user

- Indonesian student receiving monthly allowance.
- First-jobber receiving a fixed monthly salary.
- Comfortable using a mobile web application.
- Understands their income but does not consistently plan obligations and day-to-day spending.

### Secondary user, outside initial optimization

- Freelancer with irregular income.
- Household or shared-wallet user.
- User who needs bank or e-wallet synchronization.

### Problem statement

Young people often know their current account balance but cannot distinguish money that is available from money already needed for rent, bills, savings goals, and daily survival. Traditional trackers show where money went after the fact; they do not answer how much is safe to spend now.

## 4. Product principles

1. **Plan before track.** The first meaningful output is an allocation plan, not an empty transaction ledger.
2. **One clear number.** The dashboard prioritizes today's safe-to-spend amount.
3. **AI proposes; the user confirms.** AI output never mutates financial data without explicit confirmation.
4. **Math is deterministic.** Balances, ratios, forecasts, and simulation results are calculated in typed domain functions.
5. **Explain, do not shame.** Copy is neutral, concise, and action-oriented.
6. **Local first.** No login is required, and the financial dataset remains in the browser.
7. **Minimum disclosure.** Only the current command and required aggregates are sent to the AI endpoint.
8. **Graceful degradation.** Manual forms and deterministic summaries remain available when Gemini fails.

## 5. MVP scope

### P0 — required for judging

- First-run onboarding using natural-language financial input.
- Confirmation/edit screen for AI-extracted onboarding data.
- Monthly budget cycle with expected next income date.
- Income, expense, obligation, and savings-goal records.
- Natural-language command composer with preview-before-save.
- Dashboard with balance, reserved money, remaining days, and safe-to-spend.
- Deterministic allocation plan.
- “Aman Nggak?” purchase simulation.
- Transaction history with basic filters.
- Obligation and goal progress.
- One AI-generated insight plus deterministic fallback.
- Local persistence, schema validation, and safe reset.
- Responsive mobile-first interface.

### P1 — implement only if every P0 gate passes

- Edit and delete existing transactions with confirmation.
- Export and import a versioned JSON backup.
- Dark mode polish.
- Additional insight cards.
- Demo-data reset button.

### Explicitly out of scope

- User accounts or cloud synchronization.
- Bank, QRIS, or e-wallet integration.
- Payments, transfers, debt collection, or lending decisions.
- Stock, crypto, insurance, or investment recommendations.
- Shared wallets and family accounts.
- Multiple currencies.
- Receipt OCR or document upload.
- Push notifications.
- Freelancer-specific irregular-income forecasting.

## 6. User experience and routes

### Application shell

Create a dedicated `FinanceLayout` rather than forcing the marketing-oriented `MainLayout` onto the product. Reuse the Venturo skeleton's theme, MUI primitives, icon system, and responsive conventions.

Mobile navigation has four destinations:

1. Home
2. Transactions
3. Plan
4. Insights

The natural-language command composer is always accessible from Home and Transactions. On desktop, the same destinations appear in a compact sidebar or header navigation without changing route semantics.

### Proposed routes

All route strings remain centralized in `src/routes/paths.ts`.

| Route | Purpose |
|---|---|
| `/` | Dashboard or onboarding redirect/state |
| `/transactions` | Transaction history and manual entry |
| `/plan` | Obligations, goals, allocation, and cycle settings |
| `/insights` | Deterministic summaries and AI explanation |

Onboarding is a stateful first-run experience rendered from the root page rather than a separately indexable public route.

### First-run onboarding

1. Welcome and privacy explanation.
2. Natural-language prompt with a concrete example.
3. AI extraction preview.
4. Editable confirmation form using React Hook Form and Zod.
5. Initial allocation result.
6. Enter dashboard.

If AI is unavailable, step 2 offers a short structured form immediately.

### Dashboard hierarchy

1. **Safe-to-spend today** — the dominant number.
2. **Days until next income** and current cycle date range.
3. **Available balance** separated from **reserved money**.
4. Obligation and goal status.
5. Category progress.
6. Recent transactions.
7. Current actionable insight.

### Command composer

Supported MVP intents:

- `add_income`
- `add_expense`
- `add_obligation`
- `mark_obligation_paid`
- `create_goal`
- `simulate_purchase`
- `ask_summary`
- `unknown`

Examples:

- “Makan siang 28 ribu tadi.”
- “Dapat cashback 50 ribu.”
- “Bayar kos 900 ribu.”
- “Tagihan internet 150 ribu setiap tanggal 10.”
- “Aku mau nabung 500 ribu bulan ini.”
- “Aman nggak beli headset 450 ribu?”

Every mutating command produces a confirmation preview. Simulation and summary commands never create transactions.

## 7. Financial domain model

Money is stored as integer Indonesian rupiah. Floating-point money is forbidden.

### Core entities

#### `FinanceProfile`

- `id`
- `displayName?`
- `preferredDailyMinimum?`
- `createdAt`
- `updatedAt`

#### `BudgetCycle`

- `id`
- `startDate`
- `nextIncomeDate`
- `expectedIncomeAmount`
- `openingBalance`
- `status`: `active | closed`

Only one cycle is active in the MVP.

#### `Transaction`

- `id`
- `cycleId`
- `type`: `income | expense`
- `amount`
- `category`
- `description`
- `occurredAt`
- `source`: `ai | manual | demo`
- `createdAt`
- `updatedAt`

#### `Obligation`

- `id`
- `cycleId`
- `name`
- `amount`
- `dueDate`
- `status`: `unpaid | paid`
- `transactionId?`

#### `SavingsGoal`

- `id`
- `cycleId`
- `name`
- `targetContribution`
- `contributedAmount`
- `priority`: `required | preferred`

#### `AllocationSettings`

- `bufferAmount`
- `categoryLimits`
- `preferredDailyMinimum?`

Percentages shown in the UI are derived from amounts. They are not the source of truth.

### Persistence envelope

```ts
type PersistedFinanceState = {
  schemaVersion: number;
  savedAt: string;
  profile: FinanceProfile;
  cycles: BudgetCycle[];
  transactions: Transaction[];
  obligations: Obligation[];
  goals: SavingsGoal[];
  allocationSettings: AllocationSettings;
};
```

The storage module validates this envelope at every hydration boundary. Schema migrations are explicit functions keyed by version.

## 8. Deterministic budgeting engine

The engine is a pure TypeScript domain module with no React, storage, or AI dependency.

### Derived values

```text
recorded income
  = opening balance + income transactions

spent
  = expense transactions

liquid balance
  = recorded income - spent

unpaid commitment reserve
  = sum of unpaid obligations in the active cycle

remaining goal reserve
  = sum of max(target contribution - contributed amount, 0)

safe pool
  = max(liquid balance
        - unpaid commitment reserve
        - remaining goal reserve
        - configured buffer, 0)

safe-to-spend per day
  = floor(safe pool / remaining calendar days in the active cycle)
```

The cycle end date is the next expected income date. Remaining days include today and exclude the income date, with a minimum divisor of one.

### Health status

- **Safe:** obligations and goals remain fundable, and safe pool is positive.
- **Watch:** obligations remain fundable, but the goal or preferred daily minimum is at risk.
- **Risk:** liquid balance cannot cover unpaid obligations, or safe pool is zero while days remain.

### “Aman Nggak?” simulation

The simulator clones the current projection in memory, applies a hypothetical expense, and returns:

- Decision status: `safe | reconsider | unsafe`
- Safe-to-spend before and after
- Goal shortfall, if any
- Obligation coverage, if affected
- Plain deterministic reason codes
- Optional AI explanation based only on those results

The simulation never persists data unless the user chooses “Catat sebagai pengeluaran,” which opens a normal confirmation preview.

## 9. AI architecture

### Provider abstraction

Define an `AiProvider` interface so the domain is not tied to Gemini:

```ts
interface AiProvider {
  parseOnboarding(input: ParseOnboardingInput): Promise<ParsedOnboarding>;
  parseCommand(input: ParseCommandInput): Promise<ParsedCommand>;
  explainInsight(input: InsightExplanationInput): Promise<InsightExplanation>;
}
```

The initial adapter uses Gemini with a server-only API key.

### Initial provider configuration

- Default model: `gemini-2.5-flash-lite`
- `GEMINI_API_KEY`: server-only and never prefixed with `NEXT_PUBLIC_`
- `GEMINI_MODEL`: optional server-only override
- Structured JSON output validated again with local Zod schemas
- Short timeout and no automatic mutation retry

### Route handlers

- `POST /api/ai/parse-onboarding`
- `POST /api/ai/parse-command`
- `POST /api/ai/explain-insight`

Both routes validate input, minimize context, call the provider adapter, validate output, and return a typed envelope. Rate limiting is not required for the local demo but the boundary must make it addable later.

### Confidence policy

- `>= 0.85`: fully prefill the preview, still requiring confirmation.
- `0.60–0.84`: highlight uncertain fields for review.
- `< 0.60`: open the manual form with any safe partial extraction.

### Privacy policy for the MVP

- Use synthetic data during judging.
- Do not send the full local ledger to Gemini.
- Command parsing sends only the current user command, locale, and current date.
- Insight explanation sends aggregate amounts, ratios, status codes, and time remaining.
- Never send names, account numbers, bank details, or free-form historical transaction descriptions for insight generation.
- Display a short disclosure when AI is used.

### Local fallback

A rule-based parser supports simple Indonesian amount phrases and common transaction keywords. It exists for graceful degradation, not as a substitute for the mandatory AI demonstration.

## 10. Client state and storage architecture

Avoid adding a state-management package for the MVP. Use a focused `FinanceProvider` with `useReducer`, selectors, and a repository interface.

Layers:

1. `domain` — entities and Zod schemas.
2. `engine` — pure calculations and simulations.
3. `storage` — localStorage repository and migrations.
4. `state` — reducer, commands, selectors, hydration lifecycle.
5. `ai` — request contracts and client calls.
6. `sections` — UI composition following the skeleton's page → view → section rule.

Hydration behavior:

- Server renders a stable loading shell.
- Client hydrates and reads local state once.
- Valid data enters the reducer.
- Missing data launches onboarding.
- Invalid data is quarantined and offers reset/import recovery.
- Reducer changes persist through a debounced repository write.

## 11. Skeleton integration plan

### Keep and reuse

- Root provider stack.
- MUI 9 theme and CSS-variable mode.
- DM Sans and Barlow local fonts.
- Shared components and component gallery.
- React Hook Form and Zod conventions.
- Central route configuration and routing wrappers.
- ESLint, Prettier, TypeScript, Husky, Docker, and Jenkins gates.

### Add

```text
src/
├── app/
│   ├── (finance)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── plan/page.tsx
│   │   └── insights/page.tsx
│   └── api/ai/
│       ├── parse-onboarding/route.ts
│       ├── parse-command/route.ts
│       └── explain-insight/route.ts
├── features/finance/
│   ├── ai/
│   ├── domain/
│   ├── engine/
│   ├── state/
│   └── storage/
├── layouts/finance/
└── sections/
    ├── dashboard/
    ├── onboarding/
    ├── transactions/
    ├── plan/
    └── insights/
```

### Adapt

- Change app identity and metadata from Venturo marketing copy to SakuFlow.
- Add finance routes to `paths.ts`.
- Use a finance-specific navigation configuration.
- Extend `src/lib/env.ts` and `.env.example` with server-only Gemini variables.
- Replace the root marketing page with the dashboard/onboarding view.
- Update manifest, favicon, Open Graph assets, and PWA metadata only after core flows work.

### Do not delete initially

- Existing component gallery.
- Existing marketing sections and API modules.
- Existing layouts.

Unused marketing code may be removed only in a late cleanup checkpoint after the SakuFlow build, typecheck, lint, and demo flow all pass.

## 12. Visual direction

- Mobile-first financial dashboard.
- Retain the skeleton's teal primary palette initially; use success, warning, and error semantics for status.
- Use large numeric hierarchy and restrained charts.
- Avoid gamified guilt, red-heavy screens, or moralizing copy.
- Keep each screen focused on one decision.
- Ensure keyboard access, visible focus, semantic labels, and sufficient contrast.
- Support responsive desktop presentation without designing a separate desktop product.

## 13. Error handling

### AI errors

- Timeout or network error → retain typed text and offer manual parsing.
- Invalid structured output → reject it at the Zod boundary and show manual fields.
- Unsupported intent → show supported examples without saving anything.
- Retry must be user-initiated to avoid duplicate costs.

### Storage errors

- Missing data → onboarding.
- Invalid schema → quarantine raw value, show recovery UI, never partially hydrate.
- Storage quota failure → keep the current in-memory state, show a persistent warning, and offer JSON export only when the P1 backup feature is available.
- Reset → destructive confirmation dialog.

### Domain errors

- Negative or zero monetary input is rejected unless explicitly supported by the transaction type.
- Dates outside the active cycle require confirmation.
- Duplicate obligation payment produces a warning.
- Impossible allocation produces a shortfall state rather than negative budget buckets.

## 14. Testing and verification strategy

The skeleton currently has no test runner. Add Vitest and React Testing Library during the foundation checkpoint.

### Automated tests

1. Domain schema parsing and money invariants.
2. Every budgeting formula and boundary date.
3. Purchase simulation without state mutation.
4. Storage hydration, corruption handling, and migrations.
5. Reducer actions and persistence behavior.
6. AI request/response validation with a fake provider.
7. Confirmation-before-save UI behavior.
8. Critical onboarding and transaction components.

### Existing mandatory gates

- `yarn lint`
- `yarn fm:check`
- `yarn tsc:check`
- `yarn build`

### Manual demo gates

- Clean first-run onboarding.
- Reload persistence.
- Offline/manual transaction entry.
- Gemini happy path.
- Gemini failure fallback.
- Mobile viewport and desktop viewport.
- Full “Aman Nggak?” scenario.

## 15. Execution governance for AI agents

The implementation plan will be divided into numbered checkpoints. Gemini executes one checkpoint at a time and must stop after each checkpoint.

Every checkpoint contains:

- Objective and explicit non-goals.
- Exact files to inspect, create, or modify.
- Small ordered tasks.
- Tests written before or alongside implementation.
- Commands to run.
- Manual verification steps.
- Expected artifacts and acceptance criteria.
- Suggested commit message.
- Stop conditions and escalation questions.

Gemini agent rules:

1. Do not start a later checkpoint early.
2. Do not delete skeleton features unless the checkpoint explicitly authorizes it.
3. Do not change package manager, framework versions, theme architecture, or folder conventions.
4. Do not introduce cloud storage, authentication, bank integration, or investment advice.
5. Do not let AI output directly mutate financial state.
6. Report changed files and full verification results after each checkpoint.
7. Stop on ambiguous financial rules, contract drift, failing baseline gates, or required secrets.
8. Preserve user changes and unrelated files.

## 16. Planned checkpoint sequence

The detailed implementation plan will expand these into atomic tasks:

0. Repository and baseline verification.
1. Product identity, routes, test foundation, and finance module skeleton.
2. Domain schemas and deterministic budgeting engine.
3. Versioned local storage and client state.
4. Onboarding and extraction confirmation flow.
5. Finance layout and dashboard.
6. Transactions, obligations, goals, and plan screens.
7. Gemini adapter, structured command parser, and fallback parser.
8. “Aman Nggak?” simulator and AI explanation.
9. Insights, error recovery, backup, and accessibility polish.
10. Full verification, demo dataset, pitch flow, and release readiness.

No checkpoint is complete until its tests and required project gates pass.

## 17. Acceptance criteria for the finished MVP

- A new user can reach a useful dashboard from one natural-language onboarding message.
- No financial record is saved from AI output without confirmation.
- Every displayed monetary result comes from the deterministic engine.
- Safe-to-spend updates correctly after confirmed transactions.
- Purchase simulation never mutates state unless explicitly converted into a transaction.
- Reloading preserves valid local data.
- Corrupt storage does not crash the application.
- Core flows work when Gemini is unavailable.
- Gemini model and API key remain server-only and configurable.
- Mobile and desktop layouts are usable.
- Automated tests and all existing repository gates pass.
- The complete judging demo can be performed with synthetic data in under five minutes.

## 18. Deferred production roadmap

After the competition, and only after validating demand:

1. Cloud accounts and cross-device synchronization.
2. Encrypted backup and privacy controls.
3. Irregular-income budgeting for freelancers.
4. Recurring cycle rollover and longitudinal trends.
5. Notification and reminder support.
6. Optional financial-wellness distribution for campuses or employers.
7. Provider privacy upgrade and production observability.

Bank/e-wallet integrations remain a separate product and compliance project, not a routine extension of this MVP.
