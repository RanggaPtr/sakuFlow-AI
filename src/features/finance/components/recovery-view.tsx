'use client';

import type { PersistenceEnvelope } from 'src/features/finance/domain';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useFinance } from 'src/features/finance/state';
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

export function RecoveryView() {
  const { state, persistence } = useFinance();
  const [resetConfirm, setResetConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingImport, setPendingImport] = useState<PersistenceEnvelope | null>(null);

  const handleDownload = () => {
    const url = URL.createObjectURL(
      new Blob([state.corruptRawValue ?? ''], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sakuflow-corrupt-backup-${new Date().toISOString().substring(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (resetConfirm === 'HAPUS DATA') persistence.reset();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setErrorMessage('');
    setPendingImport(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setErrorMessage('File cadangan melebihi batas 1 MiB.');
      return;
    }

    try {
      setPendingImport(persistence.parseImport(await file.text()));
    } catch {
      setErrorMessage('Gagal mengimpor file: format, versi, atau data tidak valid.');
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    persistence.confirmImport(pendingImport);
    setPendingImport(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Card sx={{ p: 4, maxWidth: 480, width: '100%' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Mode Pemulihan Data
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Data lokal tidak dapat dibaca dan tetap ditahan agar tidak tertimpa tanpa konfirmasi.
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={handleDownload}>
            Unduh data mentah (.json)
          </Button>
          <Button component="label" variant="contained">
            Impor cadangan
            <VisuallyHiddenInput
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
            />
          </Button>
        </Stack>
        {pendingImport && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Periksa ringkasan cadangan</Typography>
            <Typography variant="body2">
              {pendingImport.data.transactions.length} transaksi,{' '}
              {pendingImport.data.obligations.length} tanggungan, {pendingImport.data.goals.length}{' '}
              tujuan.
            </Typography>
            <Button size="small" color="warning" onClick={handleConfirmImport} sx={{ mt: 1 }}>
              Ganti dengan data ini
            </Button>
          </Alert>
        )}
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Mulai Ulang (Hapus Data)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Tulis &quot;HAPUS DATA&quot; untuk menghapus termasuk data mentah yang rusak.
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
        </Box>
      </Card>
    </Box>
  );
}
