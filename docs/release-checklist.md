# SakuFlow AI Release Checklist

Sebelum menyatakan rilis siap, pastikan semua gate berikut lulus secara berurutan dan reproduksibel pada lingkungan CI atau mesin clean clone:

## 1. Reproducible Baseline

- [ ] Node.js v22.12.0+ dan Yarn Classic 1.22.22 digunakan.
- [ ] Checkout kode dari repositori tanpa `node_modules` atau `.next` yang tersisa.
- [ ] `yarn install --frozen-lockfile` berjalan sukses tanpa error.

## 2. Automated Quality Gates

- [ ] **Test**: `yarn test:run` lulus 100%.
- [ ] **Lint**: `yarn lint` lulus dengan 0 warning.
- [ ] **Format**: `yarn fm:check` lulus.
- [ ] **Typecheck**: `yarn tsc:check` lulus.

## 3. Build & Security Gates

- [ ] **Clean Build**: `yarn clean && yarn build` menghasilkan build production yang sukses.
- [ ] **Secret Scan**: Pindai repositori untuk secret (`docker run --rm -v "$PWD:/path" zricethezav/gitleaks:latest detect --source="/path" -v` atau sejenisnya) dan pastikan tidak ada secret keys, api keys, atau kredensial nyata yang hardcoded/committed.
- [ ] **Docker**: `docker compose build --no-cache` lulus tanpa error.

## 4. Manual / Smoke Testing

- [ ] Jalankan environment secara lokal dengan `docker compose up -d` atau `yarn start`.
- [ ] Verifikasi rute berikut menghasilkan respons 200 OK (atau redirect yang valid), bukan 404/500:
  - `/`
  - `/onboarding`
  - `/dashboard`
  - `/transactions`
  - `/plan`
  - `/insights`
  - `/settings`
  - `/manifest.webmanifest`
  - `/robots.txt`
- [ ] Uji interaksi pengguna dasar, preview mutasi dengan/tanpa Gemini, export/import data.

Jika semua hal di atas tercentang hijau, maka rilis dianggap **READY TO USE**.
