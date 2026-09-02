'use client';

import type { Transaction } from 'src/features/finance/domain';

import { useState, useEffect } from 'react';

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
import {
  toLocalYyyyMmDd,
  TRANSACTION_CATEGORIES,
  parseStrictIntegerMoney,
  transactionCategorySchema,
} from 'src/features/finance/domain';

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function isTransactionType(value: string): value is Transaction['type'] {
  return value === 'expense' || value === 'income';
}

export function TransactionDialog({ open, onClose, transaction = null }: Props) {
  const { dispatch } = useFinance();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Transaction['category']>('other');
  const [occurredOn, setOccurredOn] = useState(toLocalYyyyMmDd(new Date()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(transaction?.type ?? 'expense');
    setAmount(transaction ? String(transaction.amount) : '');
    setNote(transaction?.note ?? '');
    setCategory(transaction?.category ?? 'other');
    setOccurredOn(transaction?.occurredOn ?? toLocalYyyyMmDd(new Date()));
    setError('');
  }, [open, transaction]);

  const handleSave = () => {
    const val = parseStrictIntegerMoney(amount);
    if (val === null || !note.trim()) {
      setError('Masukkan nominal Rupiah bulat dan catatan.');
      return;
    }

    const tx: Transaction = {
      ...(transaction ?? {}),
      id: transaction?.id ?? crypto.randomUUID(),
      type,
      category: transactionCategorySchema.parse(category),
      amount: val,
      occurredOn,
      note: note.trim(),
      source: transaction?.source ?? 'manual',
      createdAt: transaction?.createdAt ?? new Date().toISOString(),
    };

    if (transaction) {
      dispatch({ type: 'update-transaction', transactionId: transaction.id, transaction: tx });
    } else {
      dispatch({ type: 'add-transaction', transaction: tx });
    }

    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
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
            select
            fullWidth
            label="Kategori"
            value={category}
            onChange={(event) => {
              const parsed = transactionCategorySchema.safeParse(event.target.value);
              if (parsed.success) setCategory(parsed.data);
            }}
          >
            {TRANSACTION_CATEGORIES.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Tanggal"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
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
