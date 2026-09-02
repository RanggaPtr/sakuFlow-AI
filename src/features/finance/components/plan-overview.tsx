'use client';

import type { ObligationCategory } from 'src/features/finance/domain';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { useFinance } from 'src/features/finance/state';
import {
  toLocalYyyyMmDd,
  obligationCategoryToTransactionCategory,
} from 'src/features/finance/domain';

export function PlanOverview() {
  const { state, dispatch } = useFinance();

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const handlePayObligation = (
    id: string,
    amount: number,
    name: string,
    category: ObligationCategory
  ) => {
    if (window.confirm(`Catat pembayaran untuk ${name} sebesar ${formatRp(amount)}?`)) {
      dispatch({
        type: 'mark-obligation-paid',
        obligationId: id,
        transaction: {
          id: crypto.randomUUID(),
          type: 'expense',
          category: obligationCategoryToTransactionCategory(category),
          amount,
          occurredOn: toLocalYyyyMmDd(new Date()),
          note: `Bayar ${name}`,
          source: 'manual',
          createdAt: new Date().toISOString(),
        },
      });
    }
  };

  const handleContribute = (id: string, name: string, maxAmount: number) => {
    const input = window.prompt(
      `Masukkan nominal tabungan untuk ${name} (Maks ${formatRp(maxAmount)}):`
    );
    if (!input) return;
    const amount = Number(input);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > maxAmount) {
      alert('Nominal tidak valid atau melebihi target.');
      return;
    }

    dispatch({
      type: 'contribute-to-goal',
      goalId: id,
      amount,
      transaction: {
        id: crypto.randomUUID(),
        type: 'expense',
        category: 'savings',
        amount,
        occurredOn: toLocalYyyyMmDd(new Date()),
        note: `Nabung untuk ${name}`,
        source: 'manual',
        createdAt: new Date().toISOString(),
      },
    });
  };

  const { obligations, goals } = state.snapshot;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tanggungan (Tagihan & Cicilan)
      </Typography>
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

      <Typography variant="h6" gutterBottom>
        Tujuan Tabungan
      </Typography>
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
    </Box>
  );
}
