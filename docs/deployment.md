# Deployment SakuFlow AI

SakuFlow adalah aplikasi finance local-first. Ledger dan profil disimpan di
browser; endpoint AI eksternal bersifat opsional dan hanya menerima teks
perintah aktif pengguna.

## Environment

`NEXT_PUBLIC_*` dibekukan ketika `yarn build` berjalan. `AI_API_URL`,
`AI_API_KEY`, `AI_MODEL`, `API_URL`, dan `REVALIDATE_TOKEN` hanya dibaca saat
runtime server. Jangan commit atau memasukkan file `.env*` ke Docker context.

| Variable | Required | Phase | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | production | build | canonical, sitemap, robots |
| `NEXT_PUBLIC_ASSETS_DIR` | no | build | optional public asset prefix |
| `NEXT_PUBLIC_SHOW_COMPONENTS` | no | build | internal component gallery flag |
| `AI_API_URL` | no | runtime | OpenAI-compatible endpoint |
| `AI_API_KEY` | no | runtime | provider credential; never client-side |
| `AI_MODEL` | no | runtime | provider model, defaults to `default` |
| `API_URL` | no | runtime | optional internal API override |
| `REVALIDATE_TOKEN` | no | runtime | optional revalidation webhook secret |

## Local

```sh
cp .env.example .env
yarn install --frozen-lockfile
yarn dev
```

## Docker

`Dockerfile` uses a multi-stage standalone build. Public values are supplied as
safe build arguments with defaults. `.dockerignore` excludes every `.env*`
file, so `.env.prod` and `AI_API_KEY` cannot be copied into an image layer.
Runtime secrets are passed only through Compose environment substitution:

```sh
NEXT_PUBLIC_SITE_URL=https://finance.example.com \
  AI_API_URL=https://provider.example/v1 \
  AI_API_KEY='set-at-runtime' \
  docker compose up -d --build
```

The compose build also works from a clean checkout with no `.env.prod`; it
defaults to the local site URL and disabled external AI. The runner is
non-root and listens on port 80.

## CI/Jenkins

Jenkins runs frozen install, tests, lint, format, typecheck, production build,
secret scan, and a clean `docker compose build`. It creates only a temporary
`.env` from `.env.example`; production secrets are never needed by CI.

## Release checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin before build.
- [ ] Set `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` only as runtime secrets if
      external AI is enabled.
- [ ] Verify `/robots.txt` is noindex/nofollow and `/sitemap.xml` uses the
      production origin.
- [ ] Run browser/device smoke tests and inspect the mobile/desktop navigation.
- [ ] Build the Docker image from a clean checkout and inspect the image history
      for absence of `.env*` and secrets.
