export function isIsoDate(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/.test(input);
}

export function isYyyyMmDd(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

export function daysUntilIncome(todayStr: string, nextIncomeOnStr: string): number {
  const today = parseYyyyMmDd(todayStr);
  const nextIncomeOn = parseYyyyMmDd(nextIncomeOnStr);

  const diffTime = nextIncomeOn.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 1);
}

export function clampIncomeDay(year: number, monthIndex: number, requestedDay: number): number {
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Math.max(1, Math.min(requestedDay, daysInMonth));
}

function parseYyyyMmDd(str: string): Date {
  const [y = 0, m = 1, d = 1] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
