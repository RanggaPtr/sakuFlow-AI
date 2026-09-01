import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface Props {
  safeToSpendPerDay: number;
  remainingDays: number;
}

export function DashboardOverview({ safeToSpendPerDay, remainingDays }: Props) {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(safeToSpendPerDay);

  return (
    <Card
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 2,
      }}
    >
      <Typography variant="overline" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
        JATAH HARI INI
      </Typography>
      <Typography variant="h2" sx={{ my: 2, fontWeight: '800' }}>
        {formattedAmount}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        Sisa {remainingDays} hari sampai siklus baru
      </Typography>
    </Card>
  );
}
