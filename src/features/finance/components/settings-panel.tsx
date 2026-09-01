'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useFinance } from 'src/features/finance/state';

export function SettingsPanel() {
  const { dispatch } = useFinance();
  const router = useRouter();

  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('gemini_api_key') || '';
    setApiKey(existing);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'PERINGATAN: Semua data keuangan, riwayat, dan profil Anda akan dihapus permanen. Lanjutkan?'
      )
    ) {
      dispatch({ type: 'reset' });
      // Clear localStorage artifacts manually just to be safe
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('saku_flow_snapshot');
      router.replace('/onboarding');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Pengaturan
      </Typography>

      <Stack spacing={4}>
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Konfigurasi AI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            SakuFlow menggunakan Gemini AI untuk menebak pengeluaran dari teks Anda. Masukkan API
            Key (opsional). Jika kosong, sistem otomatis beralih ke pembacaan kata kunci dasar.
          </Typography>

          <Stack
            spacing={2}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ alignItems: 'flex-start' }}
          >
            <TextField
              fullWidth
              size="small"
              type="password"
              label="Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
            />
            <Button
              variant="contained"
              onClick={handleSaveApiKey}
              sx={{ minWidth: 100, height: 40 }}
            >
              Simpan
            </Button>
          </Stack>

          {saved && (
            <Alert severity="success" sx={{ mt: 2 }}>
              API Key berhasil disimpan di peramban ini.
            </Alert>
          )}
        </Card>

        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            borderColor: 'error.main',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        >
          <Typography variant="h6" color="error.main" sx={{ mb: 1 }}>
            Zona Berbahaya
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tindakan ini akan menghapus seluruh profil dan riwayat keuangan Anda secara permanen.
          </Typography>

          <Button variant="contained" color="error" onClick={handleReset}>
            Hapus Semua Data
          </Button>
        </Card>
      </Stack>
    </Box>
  );
}
