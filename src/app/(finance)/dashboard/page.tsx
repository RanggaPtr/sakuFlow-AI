'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import { useFinance, selectProjection } from 'src/features/finance/state';
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
        />
        <DashboardBudget
          liquidBalance={projection.liquidBalance}
          safePool={projection.safePool}
          spent={projection.spent}
        />
        <PurchaseSimulator />
        <AiChatInterface />
      </Stack>
    </Box>
  );
}
