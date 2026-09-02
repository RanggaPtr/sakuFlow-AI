'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import {
  DashboardBudget,
  AiChatInterface,
  DashboardOverview,
  PurchaseSimulator,
} from 'src/features/finance/components';
import {
  useFinance,
  selectProjection,
  selectRecentTransactions,
  calculateCycleCarryForward,
} from 'src/features/finance/state';

export default function DashboardPage() {
  const { state, dispatch } = useFinance();
  const [recordRecurringIncome, setRecordRecurringIncome] = useState(true);
  const today = toLocalYyyyMmDd(new Date());
  const projection = selectProjection(state, today);

  if (!projection) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dasbor
      </Typography>
      <Stack spacing={3}>
        {projection.nextIncomeOn &&
          today >= projection.nextIncomeOn &&
          (() => {
            const carry = calculateCycleCarryForward(state.snapshot, today);
            const blocked = carry === null || carry < 0;
            return (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recordRecurringIncome}
                      onChange={(event) => setRecordRecurringIncome(event.target.checked)}
                    />
                  }
                  label="Catat pemasukan rutin"
                />
                {blocked && (
                  <Typography color="error" variant="body2">
                    Saldo carry-forward negatif. Kurangi pengeluaran sebelum memulai siklus baru.
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  disabled={blocked}
                  onClick={() => {
                    if (!window.confirm('Mulai siklus baru dan catat pemasukan rutin sekarang?'))
                      return;
                    const now = new Date();
                    dispatch({
                      type: 'advance-cycle',
                      cycleId: crypto.randomUUID(),
                      today,
                      recordRecurringIncome,
                      ...(recordRecurringIncome
                        ? {
                            transaction: {
                              id: crypto.randomUUID(),
                              type: 'income' as const,
                              category: 'salary' as const,
                              amount: state.snapshot.cycle?.recurringIncome ?? 0,
                              occurredOn: today,
                              note: 'Pemasukan rutin',
                              source: 'system' as const,
                              createdAt: now.toISOString(),
                            },
                          }
                        : {}),
                    });
                  }}
                >
                  Mulai siklus baru / Catat pemasukan rutin
                </Button>
              </Box>
            );
          })()}
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
