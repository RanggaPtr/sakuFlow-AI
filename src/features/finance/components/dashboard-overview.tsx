import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface Props {
  safeToSpendPerDay: number;
  remainingDays: number;
  health: 'safe' | 'watch' | 'risk';
  reasonCodes: string[];
  nextIncomeOn: string | null;
  projectedRecurringIncome: number;
}

const healthCopy = {
  safe: { label: 'Aman', icon: '✓' },
  watch: { label: 'Perlu perhatian', icon: '!' },
  risk: { label: 'Berisiko', icon: '×' },
} as const;

const reasonCopy: Record<string, string> = {
  'daily-limit-low': 'Batas harian cukup rendah untuk sisa siklus ini.',
  'reserves-exceed-liquid': 'Cadangan yang direncanakan melebihi saldo cair.',
  'overdue-obligation': 'Ada tanggungan yang sudah melewati jatuh tempo.',
  'missing-cycle-data': 'Lengkapi rencana pemasukan untuk hasil yang lebih akurat.',
  'cycle-stale': 'Siklus pemasukan berikutnya sudah tiba.',
  'healthy-buffer': 'Cadangan dan jatah harian masih terjaga.',
};

function formatDate(value: string | null) {
  if (!value) return 'belum diatur';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function DashboardOverview({
  safeToSpendPerDay,
  remainingDays,
  health,
  reasonCodes,
  nextIncomeOn,
  projectedRecurringIncome,
}: Props) {
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
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        <span aria-hidden="true">{healthCopy[health].icon}</span> {healthCopy[health].label}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
        {reasonCopy[reasonCodes[0] ?? ''] ?? 'Pantau pengeluaran agar rencana tetap terjaga.'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
        {projectedRecurringIncome > 0
          ? `Perkiraan pemasukan mendatang (belum masuk): ${formatDate(nextIncomeOn)} · Rp${new Intl.NumberFormat('id-ID').format(projectedRecurringIncome)}`
          : `Belum ada pemasukan mendatang yang diproyeksikan (tanggal berikutnya: ${formatDate(nextIncomeOn)}).`}
      </Typography>
    </Card>
  );
}
