import { create } from 'zustand';

/** Sign-up answers kept across steps until the final submit (nothing is half-saved on the server). */
export interface OnboardingDraft {
  role: 'customer' | 'tasker';
  firstName: string;
  lastName: string;
  birth: { d: string; m: string; y: string };
  district: string;
  neighbourhood: string;
  address: string;
  details: string;
  lat: number | null;
  lng: number | null;
  nationalId: string;
  categories: string[];
  hasVehicle: boolean;
  bio: string;
  idFrontPath: string | null;
  idFrontPreview: string | null;
  selfiePath: string | null;
  selfiePreview: string | null;
  set: (patch: Partial<Omit<OnboardingDraft, 'set'>>) => void;
}

export const useDraft = create<OnboardingDraft>((set) => ({
  role: 'customer',
  firstName: '',
  lastName: '',
  birth: { d: '', m: '', y: '' },
  district: '',
  neighbourhood: '',
  address: '',
  details: '',
  lat: null,
  lng: null,
  nationalId: '',
  categories: [],
  hasVehicle: false,
  bio: '',
  idFrontPath: null,
  idFrontPreview: null,
  selfiePath: null,
  selfiePreview: null,
  set: (patch) => set(patch),
}));

/** ISO date if the three fields form a real calendar date, else null. */
export function birthDateIso(b: { d: string; m: string; y: string }): string | null {
  const d = Number(b.d);
  const m = Number(b.m);
  const y = Number(b.y);
  if (!d || !m || y < 1920) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function ageOn(iso: string, today = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

/** T.C. kimlik numarası checksum (same rule as the server's _valid_tckn). */
export function validTckn(v: string): boolean {
  if (!/^[1-9]\d{10}$/.test(v)) return false;
  const d = v.split('').map(Number);
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!;
  const even = d[1]! + d[3]! + d[5]! + d[7]!;
  return (((odd * 7 - even) % 10) + 10) % 10 === d[9] && (odd + even + d[9]!) % 10 === d[10];
}

export type StepKey = 'role' | 'name' | 'birth' | 'phone' | 'email' | 'address' | 'tasker' | 'consent';

export function stepsFor(role: 'customer' | 'tasker'): StepKey[] {
  return role === 'tasker' ? ['role', 'name', 'birth', 'phone', 'email', 'address', 'tasker', 'consent'] : ['role', 'name', 'birth', 'phone', 'email', 'address', 'consent'];
}
