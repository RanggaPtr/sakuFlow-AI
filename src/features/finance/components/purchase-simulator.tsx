'use client';

import type { PurchaseSimulationResult } from 'src/features/finance/engine/simulate-purchase';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';

import { useFinance } from 'src/features/finance/state';
import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import { simulatePurchase } from 'src/features/finance/engine/simulate-purchase';

export function PurchaseSimulator() {
  const { state, dispatch } = useFinance();
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [result, setResult] = useState<PurchaseSimulationResult | null>(null);

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handleSimulate = () => {
    const amount = Number(amountInput);
    if (!Number.isSafeInteger(amount) || amount <= 0) return;

    const today = toLocalYyyyMmDd(new Date());
    const simResult = simulatePurchase({
      snapshot: state.snapshot,
      today,
      amount,
    });
    setResult(simResult);
  };

  const handleSave = () => {
    const amount = Number(amountInput);
    if (!Number.isSafeInteger(amount) || amount <= 0) return;

    dispatch({
      type: 'add-transaction',
      transaction: {
        id: crypto.randomUUID(),
        type: 'expense',
        category: 'other',
        amount,
        occurredOn: toLocalYyyyMmDd(new Date()),
        note: noteInput.trim() || 'Simulasi Pembelian',
        source: 'manual',
        createdAt: new Date().toISOString(),
      },
    });

    setAmountInput('');
    setNoteInput('');
    setResult(null);
    alert('Tersimpan!');
  };

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Simulasi &quot;Aman Nggak?&quot;
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cek apakah pengeluaran ini aman untuk keuanganmu sebelum dibeli.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Nominal Pengeluaran"
          type="number"
          value={amountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            setResult(null); // Reset when user types
          }}
          fullWidth
        />
        <TextField
          label="Barang / Keterangan (opsional)"
          value={noteInput}
          onChange={(e) => {
            setNoteInput(e.target.value);
            setResult(null);
          }}
          fullWidth
        />
        <Button
          variant="outlined"
          size="large"
          onClick={handleSimulate}
          disabled={!Number.isSafeInteger(Number(amountInput)) || Number(amountInput) <= 0}
        >
          Cek Dulu
        </Button>
      </Stack>

      {result && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity={
              result.verdict === 'safe'
                ? 'success'
                : result.verdict === 'tight'
                  ? 'warning'
                  : 'error'
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {result.verdict === 'safe' && 'Masih aman'}
              {result.verdict === 'tight' && 'Bisa, tapi bakal ketat'}
              {result.verdict === 'unsafe' && 'Sebaiknya jangan dulu'}
            </AlertTitle>
            Sisa jatah harian: {formatRp(result.after.safeToSpendPerDay)}
            (berkurang {formatRp(Math.abs(result.impact.dailyLimitChange))})
          </Alert>

          <Button variant="contained" fullWidth onClick={handleSave}>
            Catat sebagai pengeluaran
          </Button>
        </Box>
      )}
    </Card>
  );
}
