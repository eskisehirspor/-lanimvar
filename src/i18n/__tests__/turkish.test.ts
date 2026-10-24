import { trCapitalize, trLower, trUpper } from '../turkish';

describe('Turkish casing', () => {
  it.each([
    ['istanbul', 'İSTANBUL'],
    ['ışık', 'IŞIK'],
    ['iş ilanı', 'İŞ İLANI'],
    ['eskişehir', 'ESKİŞEHİR'],
    ['yaklaşık konum', 'YAKLAŞIK KONUM'],
  ])('trUpper(%s) → %s', (input, expected) => expect(trUpper(input)).toBe(expected));

  it('differs from naive toUpperCase where Turkish needs it', () => expect('istanbul'.toUpperCase()).not.toBe(trUpper('istanbul')));

  it.each([
    ['İSTANBUL', 'istanbul'],
    ['IŞIK', 'ışık'],
  ])('trLower(%s) → %s', (input, expected) => expect(trLower(input)).toBe(expected));

  it('capitalizes with Turkish rules', () => {
    expect(trCapitalize('istanbul')).toBe('İstanbul');
    expect(trCapitalize('ılgaz')).toBe('Ilgaz');
  });
});
