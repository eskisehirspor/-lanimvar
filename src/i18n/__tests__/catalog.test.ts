import { identity } from '@/brand/identity';

import { interpolate, t } from '..';
import { tr } from '../tr';

function leaves(node: unknown, prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

describe('copy catalog', () => {
  const all = leaves(tr);
  it('never hard-codes the brand name', () => {
    for (const [key, value] of all) expect({ key, brand: /ilanım var/i.test(value) || value.includes(identity.nameUpper) }).toEqual({ key, brand: false });
  });
  it('injects the brand from the identity layer', () => expect(t('holding.body')).toContain(identity.name));
  it('interpolates params and leaves unknown placeholders visible', () => {
    expect(t('pin.attemptsLeft', { count: 2 })).toBe('2 deneme hakkın kaldı.');
    expect(interpolate('{{nope}}')).toBe('{{nope}}');
  });
  it('never promises absolute safety', () => {
    for (const [, value] of all) expect(value).not.toMatch(/%100|100% güvenli|tamamen güvenli/i);
  });
});
