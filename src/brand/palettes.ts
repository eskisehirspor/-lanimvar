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
  /** Night scheme for live, immersive moments (searching, tracking, offers, PIN). */
  night: {
    ink: { 900: string; 700: string; 500: string };
    paper: { base: string; grouped: string; field: string; fieldStrong: string; panel: string };
    brand: { fill: string; fillPressed: string; onFill: string; dot: string; tint: string; text: string };
    signal: { success: string; successTint: string; attention: string; attentionTint: string; critical: string; criticalPressed: string; criticalTint: string; onCritical: string };
    map: { land: string; block: string; road: string; water: string; park: string };
  };
  /** Warm monogram backgrounds for people (no photos yet). */
  avatarHues: string[];
}

const nightNeutrals = {
  ink: { 900: '#F5F6F8', 700: '#B9BDC6', 500: '#8E939E' },
  paper: { base: '#0A0D14', grouped: '#0A0D14', panel: '#141922', field: '#1C222C', fieldStrong: '#2A313C' },
  map: { land: '#0E121A', block: '#161B24', road: '#262C38', water: '#112A40', park: '#12261C' },
};

const nightSignal = {
  success: '#45D483',
  successTint: '#0F2A1D',
  attention: '#FFA25E',
  attentionTint: '#33200F',
  // Bright coral-red with dark text: legible as text on night AND as a fill.
  critical: '#FF6B66',
  criticalPressed: '#E85550',
  criticalTint: '#3A1515',
  onCritical: '#0A0D14',
};

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
    night: { ...nightNeutrals, brand: { fill: '#FFD12E', fillPressed: '#F2BF00', onFill: '#0A0D14', dot: '#FFD12E', tint: '#2B2610', text: '#FFD12E' }, signal: nightSignal },
    avatarHues: ['#FFD9A8', '#F7C6B5', '#CFE3C8', '#C9DDF0', '#E5D2F2'],
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
    night: { ...nightNeutrals, brand: { fill: '#3AD7B5', fillPressed: '#22C2A0', onFill: '#04140F', dot: '#3AD7B5', tint: '#0F2A24', text: '#4FE0C1' }, signal: { ...nightSignal, success: '#4FE0C1' } },
    avatarHues: ['#CDEBE2', '#F3D9B8', '#D5E1F2', '#EBD3C8', '#DDE8C7'],
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
    night: { ...nightNeutrals, brand: { fill: '#FF8259', fillPressed: '#F06C42', onFill: '#1A0A04', dot: '#FF8259', tint: '#331A12', text: '#FF9676' }, signal: { ...nightSignal, critical: '#FF6B8A', criticalPressed: '#EB5577' } },
    avatarHues: ['#F6D3C4', '#F3DFB5', '#D7E4CF', '#D3DDEE', '#EAD5E6'],
  },
};

export const paletteOrder: PaletteId[] = ['p1', 'p2', 'p3'];
