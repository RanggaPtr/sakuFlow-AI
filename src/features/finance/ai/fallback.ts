import type { FinanceIntent } from './schema';

import { toLocalYyyyMmDd } from 'src/features/finance/domain';

import { financeIntentSchema } from './schema';

export function fallbackInterpretation(text: string): FinanceIntent {
  const lower = text.toLowerCase();
  if (/(ringkas|summary|kondisi keuangan|berapa sisa)/.test(lower)) {
    return financeIntentSchema.parse({ type: 'ask_summary', question: text });
  }
  let amount = 0;

  const jtMatch = lower.match(/(\d+(?:\.\d+)?)\s*(jt|juta)/);
  const rbMatch = lower.match(/(\d+(?:\.\d+)?)\s*(k|rb|ribu)/);
  const numMatch = lower.match(/(\d{1,3}(?:\.\d{3})+|\d+)/);

  if (jtMatch && jtMatch[1]) {
    amount = parseFloat(jtMatch[1]) * 1000000;
  } else if (rbMatch && rbMatch[1]) {
    amount = parseFloat(rbMatch[1]) * 1000;
  } else if (numMatch && numMatch[1]) {
    amount = parseInt(numMatch[1].replace(/\./g, ''), 10);
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { type: 'unknown', reason: 'Could not extract amount' };
  }

  if (/(tagihan|tanggungan|cicilan)/.test(lower)) {
    const due = new Date();
    due.setDate(due.getDate() + 1);
    const name = text
      .replace(
        /tagihan|tanggungan|cicilan|listrik|air|sebesar|\d+(?:[.,]\d+)?\s*(?:jt|juta|k|rb|ribu)?/gi,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();
    return financeIntentSchema.parse({
      type: 'add_obligation',
      name: name || 'Tanggungan baru',
      amount,
      dueOn: toLocalYyyyMmDd(due),
      category: lower.includes('listrik') || lower.includes('air') ? 'utilities' : 'other',
    });
  }

  if (/(target|tujuan tabungan|nabung)/.test(lower)) {
    const name = text
      .replace(
        /target|tujuan tabungan|nabung|sebesar|\d+(?:[.,]\d+)?\s*(?:jt|juta|k|rb|ribu)?/gi,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();
    return financeIntentSchema.parse({
      type: 'create_goal',
      name: name || 'Tujuan baru',
      targetAmount: amount,
      category: lower.includes('laptop') || lower.includes('perangkat') ? 'device' : 'other',
    });
  }

  if (/(simulasi|simulasikan)/.test(lower)) {
    return financeIntentSchema.parse({ type: 'simulate_purchase', amount, note: text });
  }

  if (/(tandai|tandain|bayar).*(lunas|sudah dibayar)/.test(lower)) {
    const name = text
      .replace(
        /tandai|tandain|bayar|lunas|sudah dibayar|sebesar|\d+(?:[.,]\d+)?\s*(?:jt|juta|k|rb|ribu)?/gi,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();
    return financeIntentSchema.parse({
      type: 'mark_obligation_paid',
      obligationName: name || 'Tanggungan',
      amount,
    });
  }

  const isIncome = lower.includes('gaji') || lower.includes('dapat') || lower.includes('bonus');
  const type = isIncome ? 'income' : 'expense';

  return financeIntentSchema.parse({
    type,
    amount,
    category: 'other',
    note: text.substring(0, 50).trim(),
  });
}
