'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import { useFinance, selectProjection, selectRecentTransactions } from 'src/features/finance/state';
import {
  DashboardBudget,
  AiChatInterface,
  DashboardOverview,
  PurchaseSimulator,
} from 'src/features/finance/components';

export default function DashboardPage() {
  const { state } = useFinance();
  const projection = selectProjection(state, toLocalYyyyMmDd(new Date()));

  if (!projection) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dasbor
      </Typography>
      <Stack spacing={3}>
        <DashboardOverview
          safeToSpendPerDay={projection.safeToSpendPerDay}
          remainingDays={projection.remainingDays}
          health={projection.health}
          reasonCodes={projection.reasonCodes}
          nextIncomeOn={projection.nextIncomeOn}
          projectedRecurringIncome={projection.projectedRecurringIncome}
        />
        <DashboardBudget
          liquidBalance={projection.liquidBalance}
          safePool={projection.safePool}
          spent={projection.spent}
          unpaidObligationReserve={projection.unpaidObligationReserve}
          remainingGoalReserve={projection.remainingGoalReserve}
          bufferReserve={projection.bufferReserve}
        />
        <Button href="#aman-nggak" variant="contained" color="secondary">
          Aman Nggak? Cek pembelian
        </Button>
        <Box id="aman-nggak">
          <PurchaseSimulator />
        </Box>
        <AiChatInterface />
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Transaksi terbaru
          </Typography>
          {state.snapshot.transactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Belum ada transaksi.
            </Typography>
          ) : (
            selectRecentTransactions(state, 5).map((transaction) => (
              <Typography key={transaction.id} variant="body2">
                {transaction.note} · {transaction.type === 'expense' ? '-' : '+'}
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(transaction.amount)}
              </Typography>
            ))
          )}
        </Box>
      </Stack>
    </Box>
  );
}
