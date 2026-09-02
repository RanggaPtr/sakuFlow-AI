import type { Transaction, FinanceSnapshot } from './schemas';

export interface TransactionMutationPolicy {
  allowed: boolean;
  reason?: string;
}

function reasonFor(transaction: Transaction, snapshot: FinanceSnapshot): string | undefined {
  if (snapshot.obligations.some((obligation) => obligation.paidTransactionId === transaction.id)) {
    return 'Pembayaran tanggungan yang sudah lunas tidak dapat diubah atau dihapus.';
  }
  if (
    transaction.category === 'savings' &&
    transaction.type === 'expense' &&
    snapshot.goals.some((goal) => goal.contributedAmount > 0)
  ) {
    return 'Transaksi tabungan dilindungi karena sudah terkait kontribusi tujuan.';
  }
  return undefined;
}

export function canModifyTransaction(
  transaction: Transaction,
  snapshot: FinanceSnapshot
): TransactionMutationPolicy {
  const reason = reasonFor(transaction, snapshot);
  return reason ? { allowed: false, reason } : { allowed: true };
}

export function canDeleteTransaction(
  transaction: Transaction,
  snapshot: FinanceSnapshot
): TransactionMutationPolicy {
  const reason = reasonFor(transaction, snapshot);
  return reason ? { allowed: false, reason } : { allowed: true };
}
