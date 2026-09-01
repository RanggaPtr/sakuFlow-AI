import { it, expect, describe } from 'vitest';

import { formatRupiah, parseIndonesianMoney } from './money';

describe('money domain functions', () => {
  it('formats Rupiah correctly', () => {
    expect(formatRupiah(1500000)).toBe('Rp1.500.000');
  });

  it('parses Indonesian money string', () => {
    expect(parseIndonesianMoney('28 ribu')).toBe(28000);
    expect(parseIndonesianMoney('1,5 juta')).toBe(1500000);
    expect(parseIndonesianMoney('gratis')).toBeNull();
    expect(parseIndonesianMoney('28.000')).toBe(28000);
    expect(parseIndonesianMoney('2 juta')).toBe(2000000);
  });
});
