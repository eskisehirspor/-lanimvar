import { formatClock, formatKm, formatTL, groupPin, groupThousands } from '../format';

describe('Turkish number formatting', () => {
  it('groups thousands with a dot', () => {
    expect(groupThousands(650)).toBe('650');
    expect(groupThousands(1250)).toBe('1.250');
    expect(groupThousands(1250000)).toBe('1.250.000');
  });
  it('puts the currency after the amount', () => expect(formatTL(12500)).toBe('12.500 TL'));
  it('uses a decimal comma for distance', () => {
    expect(formatKm(2.1)).toBe('2,1 km');
    expect(formatKm(0.45)).toBe('450 m');
  });
  it('formats clocks', () => {
    expect(formatClock(462)).toBe('07:42');
    expect(formatClock(3930)).toBe('1:05:30');
    expect(formatClock(-3)).toBe('00:00');
  });
  it('groups a 6-digit PIN as 3 + 3', () => expect(groupPin('482716')).toEqual(['482', '716']));
});
