'use client';

import type { Transaction } from 'src/features/finance/domain';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useFinance } from 'src/features/finance/state';
import { compareTransactionsByDateDesc } from 'src/features/finance/domain';

import { TransactionDialog } from './transaction-dialog';

export function TransactionList() {
  const { state, dispatch } = useFinance();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [query, setQuery] = useState('');

  const transactions = [...state.snapshot.transactions]
    .filter((transaction) => typeFilter === 'all' || transaction.type === typeFilter)
    .filter((transaction) => {
      const haystack = `${transaction.note} ${transaction.category}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    })
    .sort(compareTransactionsByDateDesc);

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus transaksi ini? Saldo dan proyeksi akan dihitung ulang.')) {
      dispatch({ type: 'delete-transaction', transactionId: id });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Riwayat Transaksi</Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            setEditingTransaction(null);
            setOpenDialog(true);
          }}
        >
          + Manual
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Select
          size="small"
          native
          aria-label="Filter jenis"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
        >
          <option value="all">Semua</option>
          <option value="income">Masuk</option>
          <option value="expense">Keluar</option>
        </Select>
        <TextField
          size="small"
          fullWidth
          placeholder="Cari transaksi"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Urutan: tanggal terbaru terlebih dahulu (tanggal dan waktu dibuat sebagai penentu kedua).
      </Typography>

      {transactions.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Belum ada transaksi.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2 }}>
          <List disablePadding>
            {transactions.map((t, idx) => (
              <Box key={t.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        aria-label={`Edit ${t.note}`}
                        onClick={() => {
                          setEditingTransaction(t);
                          setOpenDialog(true);
                        }}
                      >
                        <Typography variant="body2" color="primary.main">
                          Edit
                        </Typography>
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(t.id)}>
                        <Typography variant="body2" color="error.main">
                          Hapus
                        </Typography>
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={<Typography variant="subtitle2">{t.note}</Typography>}
                    secondary={
                      <Typography variant="caption">
                        {t.occurredOn} • {t.source}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="subtitle2"
                    color={t.type === 'expense' ? 'error.main' : 'success.main'}
                    sx={{ fontWeight: 'bold', mr: 2 }}
                  >
                    {t.type === 'expense' ? '-' : '+'}
                    {formatRp(t.amount)}
                  </Typography>
                </ListItem>
                {idx < transactions.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Card>
      )}

      <TransactionDialog
        open={openDialog}
        transaction={editingTransaction}
        onClose={() => {
          setOpenDialog(false);
          setEditingTransaction(null);
        }}
      />
    </Box>
  );
}
