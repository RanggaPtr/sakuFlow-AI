'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useFinance, selectProjection } from 'src/features/finance/state';
import {
  DashboardBudget,
  AiChatInterface,
  DashboardOverview,
} from 'src/features/finance/components';

export default function DashboardPage() {
  const { state } = useFinance();

  // Safe to use Date inside because FinanceGuard blocks SSR/hydration mismatch rendering
  const today = new Date().toISOString().substring(0, 10);
  const projection = selectProjection(state, today);

  if (!projection) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Beranda
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

        <AiChatInterface />
      </Stack>
    </Box>
  );
}
