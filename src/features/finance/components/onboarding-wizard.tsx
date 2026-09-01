'use client';

import type { FinanceSnapshot } from 'src/features/finance/domain';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useFinance } from 'src/features/finance/state';

export function OnboardingWizard() {
  const { state, dispatch } = useFinance();
  const router = useRouter();

  const [baseSalary, setBaseSalary] = useState('');
  const [baseSavings, setBaseSavings] = useState('');
  const [cycleType, setCycleType] = useState('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const salary = parseInt(baseSalary.replace(/\D/g, ''), 10) || 0;
    const savings = parseInt(baseSavings.replace(/\D/g, ''), 10) || 0;

    const todayIso = new Date().toISOString();
    const todayYmd = todayIso.substring(0, 10);

    const newSnapshot: FinanceSnapshot = {
      ...state.snapshot,
      profile: {
        id: crypto.randomUUID(),
        incomeDay: 25,
        currency: 'IDR' as const,
        onboardingCompletedAt: todayIso,
      },
      cycle: {
        id: crypto.randomUUID(),
        startsOn: todayYmd,
        nextIncomeOn: todayYmd,
        openingBalance: savings,
        bufferAmount: salary * 0.1, // 10% defaults
      },
    };

    dispatch({
      type: 'complete-onboarding',
      snapshot: newSnapshot,
    });
    router.replace('/dashboard');
  };

  const handleCycleChange = (event: React.MouseEvent<HTMLElement>, newCycle: string | null) => {
    if (newCycle !== null) {
      setCycleType(newCycle);
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
          Selamat Datang!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Mari atur profil keuangan dasarmu agar SakuFlow bisa menghitung anggaran dengan akurat.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Gaji/Pemasukan Rutin (Rp)"
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Total Tabungan Saat Ini (Rp)"
              type="number"
              value={baseSavings}
              onChange={(e) => setBaseSavings(e.target.value)}
              required
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Siklus Pengelolaan
              </Typography>
              <ToggleButtonGroup
                color="primary"
                value={cycleType}
                exclusive
                onChange={handleCycleChange}
                fullWidth
              >
                <ToggleButton value="monthly">Bulanan</ToggleButton>
                <ToggleButton value="payday">Gajian</ToggleButton>
                <ToggleButton value="manual">Manual</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Button type="submit" variant="contained" size="large" fullWidth>
              Mulai SakuFlow
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
