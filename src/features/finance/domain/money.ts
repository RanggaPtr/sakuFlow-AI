export function assertMoney(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Invalid money value');
  }
  return value;
}

export function formatRupiah(value: number): string {
  const parts = value.toString().split('');
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && i % 3 === 0) result = '.' + result;
    result = parts[parts.length - 1 - i] + result;
  }
  return 'Rp' + result;
}

export function parseIndonesianMoney(input: string): number | null {
  if (!input) return null;
  const normalized = input.toLowerCase().trim();

  if (normalized === 'gratis') return null;

  let multiplier = 1;
  if (normalized.includes('ribu')) {
    multiplier = 1000;
  } else if (normalized.includes('juta')) {
    multiplier = 1000000;
  }

  let numberPart = normalized.replace(/(ribu|juta|rp)/g, '').trim();
  numberPart = numberPart.replace(/\./g, '');
  numberPart = numberPart.replace(/,/g, '.');

  const parsed = parseFloat(numberPart);
  if (Number.isNaN(parsed)) return null;

  const result = parsed * multiplier;
  if (!Number.isSafeInteger(result) || result < 0) return null;

  return result;
}
