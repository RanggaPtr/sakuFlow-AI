# SakuFlow AI release evidence

Date: 2026-09-02

## Release candidate

- Commit: `a0272a7 fix(finance): carry deficits across cycle rollover`
- Branch: `production`
- External AI: optional; local deterministic fallback remains available.

## Automated verification

- Fresh `yarn install --frozen-lockfile`: passed with the locked dependency graph.
- `yarn test:run`: passed — 35 files, 167 tests.
- `yarn lint`: passed with zero warnings/errors.
- `yarn fm:check`: passed.
- `yarn tsc:check`: passed.
- `yarn build`: passed; all seven product routes, AI route, manifest, robots, and sitemap were generated.
- Source, Git history, and production JS/HTML secret scans found no Gemini/OpenAI-style API keys.

## Browser verification

Production server: `http://127.0.0.1:8003`

- Desktop 1280×720: passed.
- Mobile 390×844: passed with no horizontal overflow; bottom navigation remained visible.
- First run redirected to onboarding and persisted the confirmed snapshot.
- Dashboard rendered reserves, safe pool, daily allowance, health, future recurring-income forecast, simulator, and recent transactions.
- Purchase simulation produced a non-mutating verdict and separate record action.
- Local AI fallback produced a validated preview labeled `Fallback lokal`; cancel caused no mutation.
- Manual transaction creation succeeded and survived page reload.
- Transactions, Plan, Insights, and Settings routes rendered with correct active navigation.
- Plan create dialog opened and cancelled safely.
- Settings disclosed local-first storage and AI command-text privacy behavior.
- No relevant browser console warnings, errors, framework overlay, blank page, or product-route 404 were observed.

## Docker verification

- `docker compose config`: passed without `.env.prod` and without embedding an AI secret in build arguments.
- Dockerfile and `.dockerignore` keep `.env*` out of the build context; AI credentials are runtime-only.
- Image build and container healthcheck were not executable on this laptop because the Docker Desktop Windows service was stopped and the automation session was not allowed to start it. Run `docker compose build --no-cache` and `docker compose up -d` once Docker Desktop is running before deployment.

## Deployment notes

Set `NEXT_PUBLIC_SITE_URL` to the public origin at build time. Set `AI_API_URL`,
`AI_API_KEY`, and `AI_MODEL` only when connecting the desired OpenAI-compatible
provider. Without them, the core application and deterministic command parser
continue to work locally.

Rollback: redeploy the previous known-good image/commit. User data is stored in
the browser; export a JSON backup from Settings before destructive recovery or
schema-changing maintenance.
