'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useFinance } from 'src/features/finance/state';

import { TransactionDialog } from './transaction-dialog';

export function TransactionList() {
  const { state, dispatch } = useFinance();
  const [openDialog, setOpenDialog] = useState(false);

  const transactions = [...state.snapshot.transactions].sort((a, b) => {
    const diff = b.occurredOn.localeCompare(a.occurredOn);
    if (diff !== 0) return diff;
    return b.createdAt.localeCompare(a.createdAt);
  });

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
        <Button variant="contained" size="small" onClick={() => setOpenDialog(true)}>
          + Manual
        </Button>
      </Box>

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
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(t.id)}>
                      <Typography variant="body2" color="error.main">
                        Hapus
                      </Typography>
                    </IconButton>
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

      <TransactionDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </Box>
  );
}
