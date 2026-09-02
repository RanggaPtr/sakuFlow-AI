# Model rilis SakuFlow AI

Dokumen ini menjelaskan alur rilis aplikasi SakuFlow AI dan cara menjaga
checkpoint yang dapat diverifikasi.

## Branch

| Branch | Peran |
|---|---|
| `production` | branch rilis aplikasi |
| feature branch | perubahan terisolasi sebelum divalidasi |

Setiap perubahan rilis harus memiliki test yang relevan dan hasil gate yang
tercatat di report checkpoint.

## Menyiapkan deployment

1. Salin `.env.example` menjadi `.env.prod`.
2. Isi `NEXT_PUBLIC_SITE_URL` dan kredensial AI bila endpoint eksternal dipakai.
3. Jalankan seluruh pemeriksaan kualitas pada README.
4. Bangun dan jalankan image dengan `docker compose up -d --build`.
5. Uji onboarding, tambah rencana, transaksi, simulasi, backup, dan restore.

## Alur perubahan

Perubahan dikerjakan pada branch kerja, lalu digabung ke `production` setelah:

```sh
git diff --check
yarn test:run
yarn lint
yarn fm:check
yarn tsc:check
yarn build
```

Gunakan commit conventional yang kecil dan jelaskan concern tersisa di report.

## Data deployment

- `.env` / `.env.prod` selalu lokal per-deploy dan tidak dikomit.
- Endpoint AI dapat diganti tanpa mengubah domain atau UI finance.
- Backup finance adalah data pengguna; jangan menaruhnya di image atau log.
