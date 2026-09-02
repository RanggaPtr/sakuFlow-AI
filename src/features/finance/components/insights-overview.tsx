'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import { useFinance } from 'src/features/finance/state';
import { toLocalYyyyMmDd } from 'src/features/finance/domain';
import { projectBudget } from 'src/features/finance/engine/projection';
import { buildInsights } from 'src/features/finance/insights/build-insights';

export function InsightsOverview() {
  const { state } = useFinance();
  const router = useRouter();

  const insights = useMemo(() => {
    if (!state.snapshot.cycle) return [];
    const today = toLocalYyyyMmDd(new Date());
    const projection = projectBudget(state.snapshot, today);
    return buildInsights(state.snapshot, projection, today);
  }, [state.snapshot]);

  if (!insights.length) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Belum ada insight yang dapat ditampilkan saat ini.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {insights.map((insight) => (
        <Alert
          key={insight.id}
          severity={
            insight.severity === 'positive'
              ? 'success'
              : insight.severity === 'risk'
                ? 'error'
                : 'warning'
          }
        >
          <AlertTitle>{insight.title}</AlertTitle>
          <Box sx={{ mb: insight.actionLabel ? 1 : 0 }}>{insight.body}</Box>
          {insight.actionLabel && insight.actionTarget && (
            <Button
              size="small"
              color="inherit"
              onClick={() => router.push(insight.actionTarget!)}
              sx={{ mt: 1 }}
            >
              {insight.actionLabel}
            </Button>
          )}
        </Alert>
      ))}
    </Stack>
  );
}
