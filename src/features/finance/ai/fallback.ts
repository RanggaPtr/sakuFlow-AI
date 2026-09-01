import type { FinanceIntent } from './interpreter';

export function fallbackInterpretation(text: string): FinanceIntent {
  const lower = text.toLowerCase();
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

  if (amount === 0 || Number.isNaN(amount)) {
    return { type: 'unknown', reason: 'Could not extract amount' };
  }

  const isIncome = lower.includes('gaji') || lower.includes('dapat') || lower.includes('bonus');
  const type = isIncome ? 'income' : 'expense';

  return {
    type,
    amount,
    category: 'other',
    note: text.substring(0, 50).trim(),
  };
}
