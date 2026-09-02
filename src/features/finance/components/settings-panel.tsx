'use client';

import type { PersistenceEnvelope } from 'src/features/finance/domain';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useFinance } from 'src/features/finance/state';
import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import { MAX_IMPORT_BYTES } from 'src/features/finance/storage/repository';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function downloadJson(data: string, filename: string) {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SettingsPanel() {
  const { persistence } = useFinance();
  const router = useRouter();
  const [resetConfirm, setResetConfirm] = useState('');
  const [pendingImport, setPendingImport] = useState<PersistenceEnvelope | null>(null);
  const [message, setMessage] = useState('');

  const handleDownload = () => {
    downloadJson(persistence.exportJson(), `sakuflow-backup-${toLocalYyyyMmDd(new Date())}.json`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setMessage('');
    setPendingImport(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage('File cadangan melebihi batas 1 MiB.');
      return;
    }

    try {
      setPendingImport(persistence.parseImport(await file.text()));
    } catch {
      setMessage('Format cadangan, versi, atau data di dalam file tidak valid.');
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    persistence.confirmImport(pendingImport);
    setPendingImport(null);
    setMessage('Data cadangan berhasil diterapkan.');
  };

  const handleReset = async () => {
    if (resetConfirm !== 'HAPUS DATA') return;
    const succeeded = await persistence.reset();
    if (succeeded) {
      router.replace(paths.onboarding);
    } else {
      setMessage(
        'Data lama dipertahankan karena penghapusan gagal. Coba lagi setelah memeriksa penyimpanan.'
      );
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Pengaturan
      </Typography>
      <Stack spacing={4}>
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Data & privasi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ekspor dan impor memakai format cadangan SakuFlow yang sama dengan penyimpanan lokal.
          </Typography>
          {message && (
            <Alert severity={message.includes('berhasil') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          <Stack spacing={2} direction="row">
            <Button variant="outlined" onClick={handleDownload}>
              Unduh .json
            </Button>
            <Button component="label" variant="contained">
              Impor .json
              <VisuallyHiddenInput
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
              />
            </Button>
          </Stack>
          {pendingImport && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="subtitle2">Periksa ringkasan sebelum mengganti data</Typography>
              <Typography variant="body2">
                {pendingImport.data.transactions.length} transaksi,{' '}
                {pendingImport.data.obligations.length} tanggungan,{' '}
                {pendingImport.data.goals.length} tujuan.
              </Typography>
              <Button size="small" color="warning" onClick={handleConfirmImport} sx={{ mt: 1 }}>
                Ganti dengan data ini
              </Button>
            </Alert>
          )}
        </Card>

        <Card sx={{ p: 3, border: 1, borderColor: 'error.main', borderRadius: 2 }}>
          <Typography variant="h6" color="error.main" sx={{ mb: 1 }}>
            Hapus Semua Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ketik &quot;HAPUS DATA&quot; untuk menghapus profil dan seluruh riwayat lokal.
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              value={resetConfirm}
              onChange={(event) => setResetConfirm(event.target.value)}
              placeholder="HAPUS DATA"
              fullWidth
            />
            <Button
              color="error"
              variant="contained"
              disabled={resetConfirm !== 'HAPUS DATA'}
              onClick={handleReset}
            >
              Hapus
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
