import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

interface Props {
  liquidBalance: number;
  safePool: number;
  spent: number;
  unpaidObligationReserve: number;
  remainingGoalReserve: number;
  bufferReserve: number;
}

export function DashboardBudget({
  liquidBalance,
  safePool,
  spent,
  unpaidObligationReserve,
  remainingGoalReserve,
  bufferReserve,
}: Props) {
  const format = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const total = liquidBalance + spent;
  const spendPercent = total > 0 ? (spent / total) * 100 : 0;

  return (
    <Card sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ringkasan Anggaran
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Pengeluaran
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {format(spent)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={spendPercent}
          color="error"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Saldo cair
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {format(liquidBalance)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Cadangan tanggungan
        </Typography>
        <Typography variant="body2">{format(unpaidObligationReserve)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Cadangan tujuan
        </Typography>
        <Typography variant="body2">{format(remainingGoalReserve)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Dana jaga-jaga
        </Typography>
        <Typography variant="body2">{format(bufferReserve)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Dana aman
        </Typography>
        <Typography variant="subtitle2" color="primary.main">
          {format(safePool)}
        </Typography>
      </Box>
    </Card>
  );
}
