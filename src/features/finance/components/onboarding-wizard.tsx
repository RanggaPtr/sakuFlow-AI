'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useFinance } from 'src/features/finance/state';
import { toLocalYyyyMmDd, buildOnboardingSnapshot } from 'src/features/finance/domain';

function tomorrowLocal(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalYyyyMmDd(tomorrow);
}

export function OnboardingWizard() {
  const { dispatch } = useFinance();
  const router = useRouter();
  const [currentBalance, setCurrentBalance] = useState('');
  const [recurringIncome, setRecurringIncome] = useState('');
  const [nextPayday, setNextPayday] = useState('');
  const [fixedBuffer, setFixedBuffer] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const snapshot = buildOnboardingSnapshot(
        { currentBalance, recurringIncome, nextPayday, fixedBuffer },
        new Date(),
        () => crypto.randomUUID()
      );
      dispatch({ type: 'complete-onboarding', snapshot });
      router.replace(paths.dashboard);
    } catch {
      setError('Periksa kembali nominal Rupiah bulat dan tanggal gajian berikutnya.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        p: 3,
        minHeight: '100vh',
        alignItems: 'center',
      }}
    >
      <Card sx={{ p: 4, maxWidth: 480, width: '100%' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Mulai SakuFlow
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Data baru dibuat hanya setelah kamu mengonfirmasi formulir ini. Pemasukan rutin tidak
          dihitung sebagai saldo saat ini.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleConfirm}>
          <Stack spacing={2.5}>
            <TextField
              required
              fullWidth
              type="number"
              label="Saldo saat ini (Rp)"
              value={currentBalance}
              onChange={(event) => setCurrentBalance(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <TextField
              required
              fullWidth
              type="number"
              label="Pemasukan rutin (Rp)"
              value={recurringIncome}
              onChange={(event) => setRecurringIncome(event.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <TextField
              required
              fullWidth
              type="date"
              label="Tanggal gajian berikutnya"
              value={nextPayday}
              onChange={(event) => setNextPayday(event.target.value)}
              slotProps={{ htmlInput: { min: tomorrowLocal() }, inputLabel: { shrink: true } }}
            />
            {nextPayday && recurringIncome && (
              <Typography variant="caption" color="text.secondary">
                Pemasukan berikutnya: {nextPayday} sebesar Rp
                {new Intl.NumberFormat('id-ID').format(Number(recurringIncome) || 0)}. Saldo saat
                ini tetap dihitung terpisah.
              </Typography>
            )}
            <TextField
              required
              fullWidth
              type="number"
              label="Dana jaga-jaga tetap (Rp)"
              value={fixedBuffer}
              onChange={(event) => setFixedBuffer(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              Konfirmasi & mulai
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
