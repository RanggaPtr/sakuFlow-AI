# SakuFlow AI

SakuFlow AI adalah asisten keuangan pribadi local-first. Aplikasi membantu
pengguna menetapkan rencana, mencatat transaksi, melihat proyeksi uang aman,
dan menguji rencana pembelian sebelum melakukan transaksi.

## Fitur utama

- Dashboard ringkasan dengan saldo cair, uang aman, dan alokasi rencana.
- Onboarding untuk saldo awal, pemasukan berulang, tanggungan, dan tujuan.
- Pencatatan transaksi manual maupun melalui AI yang dapat diganti endpointnya.
- Perencanaan tanggungan dan tujuan dengan validasi, konfirmasi, serta simpan lokal.
- Simulasi pembelian yang tidak mengubah data sebelum dikonfirmasi.
- Backup, restore, reset dengan peringatan kegagalan, dan migrasi snapshot berversi.
- PWA metadata, sitemap, robots, dan image production standalone melalui Docker.

## Stack

Next.js 16 App Router · React 19 · TypeScript strict · MUI 9 · Zod · Vitest.

## Prasyarat

- Node.js >= 22.12
- Yarn 1.22

## Menjalankan lokal

```sh
cp .env.example .env
yarn install
yarn dev
```

Buka `http://localhost:8002`. Untuk memakai AI eksternal, isi `AI_API_URL`,
`AI_API_KEY`, dan `AI_MODEL` di environment server. Jika endpoint tidak diisi,
parser lokal tetap digunakan.

## Pemeriksaan kualitas

```sh
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
```

## Docker production

Salin `.env.example` menjadi `.env.prod`, isi nilai production, kemudian jalankan:

```sh
docker compose up -d --build
```

Container berjalan di port 80. Nilai `NEXT_PUBLIC_*` dibekukan ketika image
dibangun; ubah nilainya lalu build ulang image.

## Struktur penting

```text
src/app/(finance)/       route dashboard, transaksi, rencana, wawasan, settings
src/app/onboarding/      alur onboarding pengguna baru
src/features/finance/    domain, reducer, storage, engine, UI, dan AI adapter
src/routes/paths.ts      registry URL produk
src/lib/env.ts            validasi environment satu pintu
docs/                     panduan deployment dan keputusan arsitektur
```

Data keuangan disimpan di browser pengguna melalui repository local-first.
Server AI hanya menerima teks yang dikirim pengguna dan hasilnya selalu tampil
sebagai pratinjau sebelum mutasi state.
