/**
 * Palette primitives. Raw colour values live ONLY here.
 * Components never read these — theme/color.ts maps them to semantic roles.
 *
 * Three candidates are under evaluation in the Design Lab. None is final.
 * Neutrals do most of the work: white surfaces, a warm grouped grey and a
 * deep ink. The brand colour is a signal, not a wallpaper.
 */
export type PaletteId = 'p1' | 'p2' | 'p3';

export interface PalettePrimitives {
  id: PaletteId;
  code: string;
  name: string;
  idea: string;
  ink: { 900: string; 700: string; 500: string };
  paper: { base: string; grouped: string; field: string; fieldStrong: string };
  brand: {
    fill: string;
    fillPressed: string;
    onFill: string;
    /** The İ-dot. Tuned so it holds 3:1 on ink as well as on paper (with outline if needed). */
    dot: string;
    tint: string;
    /** Brand colour usable as text on paper (AA). null → it cannot carry text; ink is used. */
    text: string | null;
  };
  signal: {
    success: string;
    successTint: string;
    attention: string;
    attentionTint: string;
    critical: string;
    criticalPressed: string;
    criticalTint: string;
  };
  map: { land: string; block: string; road: string; water: string; park: string };
}

export const palettes: Record<PaletteId, PalettePrimitives> = {
  p1: {
    id: 'p1',
    code: 'P1',
    name: 'Sinyal',
    idea: 'Taksi sarısı tek sinyal, gerisi derin lacivert ve beyaz. “Şimdi” hissi, tabela netliği.',
    ink: { 900: '#0A1124', 700: '#454C61', 500: '#636A7E' },
    paper: { base: '#FFFFFF', grouped: '#F4F3EF', field: '#F1F0EC', fieldStrong: '#E4E2DB' },
    brand: { fill: '#FFD12E', fillPressed: '#F2BF00', onFill: '#0A1124', dot: '#FFD12E', tint: '#FFF4CC', text: null },
    signal: {
      success: '#13714A',
      successTint: '#E3F1E9',
      attention: '#B23F0B',
      attentionTint: '#FDEDE4',
      critical: '#C42626',
      criticalPressed: '#A31E1E',
      criticalTint: '#FCE8E8',
    },
    map: { land: '#EDECE6', block: '#E2E0D8', road: '#FFFFFF', water: '#CADCE4', park: '#D9E5D2' },
  },
  p2: {
    id: 'p2',
    code: 'P2',
    name: 'Porsuk',
    idea: 'Porsuk Çayı’ndan derin yeşil-turkuaz. Sakin, güven veren, yerel.',
    ink: { 900: '#0A1922', 700: '#3F4D58', 500: '#5F6B75' },
    paper: { base: '#FFFFFF', grouped: '#F1F4F3', field: '#EDF1EF', fieldStrong: '#DCE3E0' },
    brand: { fill: '#006E5B', fillPressed: '#005A4A', onFill: '#FFFFFF', dot: '#009A80', tint: '#DCF0EA', text: '#006453' },
    signal: {
      // Success rides the brand colour: a second green would compete.
      success: '#006453',
      successTint: '#DCF0EA',
      attention: '#A44D00',
      attentionTint: '#FCEFDF',
      critical: '#C42626',
      criticalPressed: '#A31E1E',
      criticalTint: '#FCE8E8',
    },
    map: { land: '#EAEEEC', block: '#DEE4E1', road: '#FFFFFF', water: '#C3DDE0', park: '#D3E5D6' },
  },
  p3: {
    id: 'p3',
    code: 'P3',
    name: 'Kiremit',
    idea: 'Odunpazarı çatılarından kiremit turuncusu. Sıcak, enerjik, yerel.',
    ink: { 900: '#111729', 700: '#464A5E', 500: '#64687B' },
    paper: { base: '#FFFFFF', grouped: '#F6F2EE', field: '#F3EEE8', fieldStrong: '#E6DDD2' },
    brand: { fill: '#B4452A', fillPressed: '#963820', onFill: '#FFFFFF', dot: '#B4452A', tint: '#F8E3DA', text: '#A23E25' },
    signal: {
      success: '#1A7348',
      successTint: '#E2F1E8',
      attention: '#8F5200',
      attentionTint: '#FBEFD9',
      // Crimson, pulled away from terracotta so safety never reads as brand.
      critical: '#AD103E',
      criticalPressed: '#8C0C32',
      criticalTint: '#FBE4EB',
    },
    map: { land: '#EFEBE5', block: '#E4DED5', road: '#FFFFFF', water: '#CBDCE2', park: '#DCE5D1' },
  },
};

export const paletteOrder: PaletteId[] = ['p1', 'p2', 'p3'];
