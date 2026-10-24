import { paletteOrder, palettes } from '@/brand/palettes';

import { buildColorRoles } from '../color';
import { contrastRatio } from '../contrast';
import { createTheme } from '../createTheme';

describe.each(paletteOrder)('palette %s', (id) => {
  const c = buildColorRoles(palettes[id]);
  it('text roles pass AA (4.5:1)', () => {
    const pairs: [string, string, string][] = [
      ['ink.primary/base', c.ink.primary, c.surface.base],
      ['ink.secondary/grouped', c.ink.secondary, c.surface.grouped],
      ['ink.tertiary/base', c.ink.tertiary, c.surface.base],
      ['ink.tertiary/field', c.ink.tertiary, c.surface.field],
      ['ink.tertiary/grouped', c.ink.tertiary, c.surface.grouped],
      ['brand.onFill/fill', c.brand.onFill, c.brand.fill],
      ['brand.text/tint', c.brand.text, c.tint.brand],
      ['status.live/base', c.status.live, c.surface.base],
      ['status.success/base', c.status.success, c.surface.base],
      ['status.success/tint', c.status.success, c.tint.success],
      ['status.attention/tint', c.status.attention, c.tint.attention],
      ['critical/tint.safety', c.safety.critical, c.tint.safety],
      ['onCritical/critical', c.safety.onCritical, c.safety.critical],
      ['onInverse/inverse', c.ink.onInverse, c.surface.inverse],
      ['link/base', c.link.color, c.surface.base],
    ];
    for (const [name, fg, bg] of pairs) expect({ name, ok: contrastRatio(fg, bg) >= 4.5 }).toEqual({ name, ok: true });
  });
  it('graphic roles pass 3:1', () => {
    expect(contrastRatio(c.focus.ring, c.surface.panel)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(c.brand.dot, c.surface.inverse)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(c.brand.dotOutline, c.surface.base)).toBeGreaterThanOrEqual(3);
  });
  it('keeps safety red distinct from the brand colour', () => expect(c.safety.critical.toLowerCase()).not.toBe(c.brand.fill.toLowerCase()));
});

describe.each(paletteOrder)('night scheme %s', (id) => {
  const c = buildColorRoles(palettes[id], 'night');
  it('text roles pass AA (4.5:1) on night surfaces', () => {
    const pairs: [string, string, string][] = [
      ['ink.primary/base', c.ink.primary, c.surface.base],
      ['ink.secondary/panel', c.ink.secondary, c.surface.panel],
      ['ink.tertiary/panel', c.ink.tertiary, c.surface.panel],
      ['ink.tertiary/field', c.ink.tertiary, c.surface.field],
      ['brand.onFill/fill', c.brand.onFill, c.brand.fill],
      ['brand.text/panel', c.brand.text, c.surface.panel],
      ['status.success/panel', c.status.success, c.surface.panel],
      ['status.attention/tint', c.status.attention, c.tint.attention],
      ['critical/tint.safety', c.safety.critical, c.tint.safety],
      ['onCritical/critical', c.safety.onCritical, c.safety.critical],
      ['onInverse/inverse', c.ink.onInverse, c.surface.inverse],
    ];
    for (const [name, fg, bg] of pairs) expect({ name, ok: contrastRatio(fg, bg) >= 4.5 }).toEqual({ name, ok: true });
  });
  it('the route and dot glow against the night map', () => {
    expect(contrastRatio(c.map.route, c.map.land)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(c.brand.dot, c.surface.base)).toBeGreaterThanOrEqual(3);
  });
});

describe('createTheme', () => {
  it('builds every Design Lab combination', () => {
    for (const palette of paletteOrder)
      for (const typeDirection of ['condensed', 'standard'] as const)
        for (const buttonShape of ['pill', 'slab'] as const) {
          const th = createTheme({ palette, typeDirection, buttonShape, textScale: 1 });
          expect(th.radii.button).toBe(buttonShape === 'pill' ? 999 : 14);
          expect(Object.keys(th.type)).toHaveLength(16);
        }
  });
  it('keeps meta text at the minimum size', () => {
    const th = createTheme({ palette: 'p1', typeDirection: 'standard', buttonShape: 'slab', textScale: 1 });
    expect(th.type.meta.fontSize).toBeGreaterThanOrEqual(th.a11y.minMetaSize);
  });
});
