import type { FinanceSnapshot } from 'src/features/finance/domain';
import type { FinanceProjection } from 'src/features/finance/engine/projection';

export interface FinancialInsight {
  id: string;
  severity: 'positive' | 'attention' | 'risk';
  title: string;
  body: string;
  actionLabel?: string;
  actionTarget?: '/dashboard' | '/transactions' | '/plan';
}

export function buildInsights(
  snapshot: FinanceSnapshot,
  projection: FinanceProjection,
  today: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  // 1. Overdue unpaid obligation
  const overdue = snapshot.obligations.filter((o) => {
    if (o.status === 'paid' || !o.dueOn) return false;
    return o.dueOn < today;
  });
  if (overdue.length > 0) {
    insights.push({
      id: 'overdue-obligation',
      severity: 'risk',
      title: 'Tanggungan Terlambat',
      body: `Ada ${overdue.length} tanggungan yang sudah melewati batas waktu bayar.`,
      actionLabel: 'Lihat Rencana',
      actionTarget: '/plan',
    });
  }

  // 2. Reserves exceed liquid
  if (
    projection.unpaidObligationReserve + projection.remainingGoalReserve >
    projection.liquidBalance
  ) {
    insights.push({
      id: 'reserves-exceed',
      severity: 'risk',
      title: 'Kekurangan Saldo Tunai',
      body: 'Saldo tunai saat ini tidak cukup untuk menutupi seluruh rencana tabungan dan tanggungan yang dialokasikan.',
    });
  }

  // 3. Safe-to-spend is zero
  if (projection.safeToSpendPerDay <= 0) {
    insights.push({
      id: 'no-safe-to-spend',
      severity: 'risk',
      title: 'Batas Harian Habis',
      body: 'Kamu sudah tidak memiliki jatah pengeluaran aman hari ini. Hati-hati mengambil dana dari alokasi tanggungan.',
      actionLabel: 'Cek Transaksi',
      actionTarget: '/transactions',
    });
  }

  // 4. Positive buffer and no risks
  if (insights.length === 0 && projection.safePool > 0) {
    insights.push({
      id: 'positive-health',
      severity: 'positive',
      title: 'Kondisi Keuangan Sehat',
      body: 'Semua tanggungan aman, saldo mencukupi, dan kamu masih berada di batas pengeluaran harian.',
    });
  }

  return insights.slice(0, 5);
}
