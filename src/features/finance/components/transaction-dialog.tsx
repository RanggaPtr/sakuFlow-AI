'use client';

import type { Transaction } from 'src/features/finance/domain';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useFinance } from 'src/features/finance/state';
import { toLocalYyyyMmDd, parseStrictIntegerMoney } from 'src/features/finance/domain';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function isTransactionType(value: string): value is Transaction['type'] {
  return value === 'expense' || value === 'income';
}

export function TransactionDialog({ open, onClose }: Props) {
  const { dispatch } = useFinance();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const val = parseStrictIntegerMoney(amount);
    if (val === null || !note.trim()) {
      setError('Masukkan nominal Rupiah bulat dan catatan.');
      return;
    }

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      category: 'other',
      amount: val,
      occurredOn: toLocalYyyyMmDd(new Date()),
      note: note.trim(),
      source: 'manual',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'add-transaction', transaction: tx });

    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Tambah Transaksi</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            select
            fullWidth
            label="Jenis"
            value={type}
            onChange={(event) => {
              if (isTransactionType(event.target.value)) setType(event.target.value);
            }}
          >
            <MenuItem value="expense">Pengeluaran</MenuItem>
            <MenuItem value="income">Pemasukan</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Nominal"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextField
            fullWidth
            label="Catatan"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Batal
        </Button>
        <Button onClick={handleSave} variant="contained">
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
