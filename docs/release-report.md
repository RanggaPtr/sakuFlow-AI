# SakuFlow AI release evidence

## Current checkpoint

- Round-three checkpoint: `2c833a1 fix(finance): close final review blockers`
- Round-four checkpoint: committed locally in the current HEAD (no push).
- Full automated gates: GREEN — 33 files/157 tests; lint; format; TypeScript;
  production build.

## Evidence to record

- [x] `yarn test:run`
- [x] `yarn lint`
- [x] `yarn fm:check`
- [x] `yarn tsc:check`
- [x] `yarn build`
- [ ] Clean-checkout `docker compose build`
- [ ] Browser/mobile/desktop smoke script (`docs/demo-script.md`)
- [ ] Secret/image-history inspection

## Deployment notes

Use `NEXT_PUBLIC_SITE_URL` as the build-time public origin. Keep
`AI_API_KEY` runtime-only. External AI is optional; local deterministic parsing
is the fallback. Do not mark browser or Docker items complete from unit tests
alone.
