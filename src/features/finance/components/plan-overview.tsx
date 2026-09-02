'use client';

import type { ObligationCategory } from 'src/features/finance/domain';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { useFinance } from 'src/features/finance/state';
import {
  buildGoal,
  toLocalYyyyMmDd,
  buildObligation,
  goalCategorySchema,
  obligationCategorySchema,
  obligationCategoryToTransactionCategory,
} from 'src/features/finance/domain';

type DialogMode = 'obligation' | 'goal' | null;

export function PlanOverview() {
  const { state, dispatch } = useFinance();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('other');
  const [error, setError] = useState('');

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handlePayObligation = (
    id: string,
    dueAmount: number,
    dueName: string,
    dueCategory: ObligationCategory
  ) => {
    if (window.confirm(`Catat pembayaran untuk ${dueName} sebesar ${formatRp(dueAmount)}?`)) {
      dispatch({
        type: 'mark-obligation-paid',
        obligationId: id,
        transaction: {
          id: crypto.randomUUID(),
          type: 'expense',
          category: obligationCategoryToTransactionCategory(dueCategory),
          amount: dueAmount,
          occurredOn: toLocalYyyyMmDd(new Date()),
          note: `Bayar ${dueName}`,
          source: 'manual',
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleContribute = (id: string, goalName: string, maxAmount: number) => {
    const input = window.prompt(
      `Masukkan nominal tabungan untuk ${goalName} (Maks ${formatRp(maxAmount)}):`
    );
    if (!input) return;
    const contributionAmount = Number(input);
    if (
      !Number.isSafeInteger(contributionAmount) ||
      contributionAmount <= 0 ||
      contributionAmount > maxAmount
    ) {
      alert('Nominal tidak valid atau melebihi target.');
      return;
    }

    dispatch({
      type: 'contribute-to-goal',
      goalId: id,
      amount: contributionAmount,
      transaction: {
        id: crypto.randomUUID(),
        type: 'expense',
        category: 'savings',
        amount: contributionAmount,
        occurredOn: toLocalYyyyMmDd(new Date()),
        note: `Nabung untuk ${goalName}`,
        source: 'manual',
        createdAt: new Date().toISOString(),
      },
    });
  };

  const openCreateDialog = (mode: Exclude<DialogMode, null>) => {
    setDialogMode(mode);
    setName('');
    setAmount('');
    setDate(mode === 'obligation' ? toLocalYyyyMmDd(new Date()) : '');
    setCategory('other');
    setError('');
  };

  const closeCreateDialog = () => setDialogMode(null);

  const handleCreate = () => {
    try {
      if (dialogMode === 'obligation') {
        dispatch({
          type: 'add-obligation',
          obligation: buildObligation(
            { name, amount, dueOn: date, category: obligationCategorySchema.parse(category) },
            new Date(),
            () => crypto.randomUUID()
          ),
        });
      } else if (dialogMode === 'goal') {
        dispatch({
          type: 'add-goal',
          goal: buildGoal(
            {
              name,
              targetAmount: amount,
              targetDate: date,
              category: goalCategorySchema.parse(category),
            },
            new Date(),
            () => crypto.randomUUID()
          ),
        });
      }
      closeCreateDialog();
    } catch {
      setError('Lengkapi nama, nominal Rupiah bulat, dan tanggal yang valid.');
    }
  };

  const { obligations, goals } = state.snapshot;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Tanggungan (Tagihan & Cicilan)</Typography>
        <Button size="small" variant="outlined" onClick={() => openCreateDialog('obligation')}>
          Tambah tanggungan
        </Button>
      </Box>
      <Card sx={{ mb: 4 }}>
        {obligations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Tidak ada tanggungan tercatat.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {obligations.map((ob, idx) => (
              <Box key={ob.id}>
                <ListItem
                  secondaryAction={
                    ob.status === 'unpaid' ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePayObligation(ob.id, ob.amount, ob.name, ob.category)}
                      >
                        Bayar
                      </Button>
                    ) : (
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Lunas
                      </Typography>
                    )
                  }
                >
                  <ListItemText
                    primary={ob.name}
                    secondary={
                      ob.dueOn
                        ? `Jatuh tempo: ${ob.dueOn} • ${formatRp(ob.amount)}`
                        : formatRp(ob.amount)
                    }
                  />
                </ListItem>
                {idx < obligations.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Tujuan Tabungan</Typography>
        <Button size="small" variant="outlined" onClick={() => openCreateDialog('goal')}>
          Tambah tujuan
        </Button>
      </Box>
      <Card>
        {goals.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Belum ada target tabungan.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {goals.map((goal, idx) => {
              const progress = (goal.contributedAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.contributedAmount;
              return (
                <Box key={goal.id}>
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'stretch', py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{goal.name}</Typography>
                      {goal.status === 'completed' ? (
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ fontWeight: 'bold' }}
                        >
                          Tercapai!
                        </Typography>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleContribute(goal.id, goal.name, remaining)}
                        >
                          Nabung
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatRp(goal.contributedAmount)} / {formatRp(goal.targetAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.floor(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} />
                  </ListItem>
                  {idx < goals.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Card>

      <Dialog open={dialogMode !== null} onClose={closeCreateDialog} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialogMode === 'obligation' ? 'Tambah tanggungan' : 'Tambah tujuan tabungan'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'grid', gap: 2 }}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              required
              label={dialogMode === 'obligation' ? 'Nama tanggungan' : 'Nama tujuan'}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              required
              type="number"
              label={dialogMode === 'obligation' ? 'Nominal tanggungan' : 'Target nominal'}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            {dialogMode === 'obligation' ? (
              <TextField
                required
                type="date"
                label="Jatuh tempo"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            ) : (
              <TextField
                type="date"
                label="Target selesai (opsional)"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
            <TextField
              select
              label="Kategori"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <MenuItem value="other">Lainnya</MenuItem>
              {dialogMode === 'obligation'
                ? [
                    <MenuItem key="housing" value="housing">
                      Tempat tinggal
                    </MenuItem>,
                    <MenuItem key="utilities" value="utilities">
                      Utilitas
                    </MenuItem>,
                    <MenuItem key="debt" value="debt">
                      Utang
                    </MenuItem>,
                    <MenuItem key="subscription" value="subscription">
                      Langganan
                    </MenuItem>,
                    <MenuItem key="education" value="education">
                      Pendidikan
                    </MenuItem>,
                  ]
                : [
                    <MenuItem key="emergency" value="emergency">
                      Dana darurat
                    </MenuItem>,
                    <MenuItem key="education" value="education">
                      Pendidikan
                    </MenuItem>,
                    <MenuItem key="device" value="device">
                      Perangkat
                    </MenuItem>,
                    <MenuItem key="travel" value="travel">
                      Perjalanan
                    </MenuItem>,
                    <MenuItem key="lifestyle" value="lifestyle">
                      Gaya hidup
                    </MenuItem>,
                  ]}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>Batal</Button>
          <Button variant="contained" onClick={handleCreate}>
            {dialogMode === 'obligation' ? 'Simpan tanggungan' : 'Simpan tujuan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
