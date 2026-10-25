import { ageOn, birthDateIso, validTckn } from '../draft';

describe('sign-up validation', () => {
  it('accepts real dates only', () => {
    expect(birthDateIso({ d: '14', m: '5', y: '1990' })).toBe('1990-05-14');
    expect(birthDateIso({ d: '31', m: '2', y: '1990' })).toBeNull();
    expect(birthDateIso({ d: '1', m: '1', y: '1900' })).toBeNull();
  });
  it('computes age with the birthday boundary', () => {
    const today = new Date(2026, 9, 26);
    expect(ageOn('2008-10-26', today)).toBe(18);
    expect(ageOn('2008-10-27', today)).toBe(17);
  });
  it('checks T.C. kimlik numbers like the server', () => {
    expect(validTckn('10000000146')).toBe(true);
    expect(validTckn('11111111110')).toBe(true);
    expect(validTckn('12345678901')).toBe(false);
    expect(validTckn('01234567890')).toBe(false);
  });
});
