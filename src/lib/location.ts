import * as Location from 'expo-location';

import { isDemo } from '@/lib/supabase/config';

const DEMO_HERE = { lat: 39.7767, lng: 30.5206, label: 'Hoşnudiye, Eskişehir', street: 'Ahmet Kanatlı Cad. No: 24' };

export interface Here {
  lat: number;
  lng: number;
  /** Neighbourhood/district label for the approximate location. */
  label: string;
  /** Best-effort street line to prefill the exact address. */
  street: string;
}

/** Foreground location only (no background tracking anywhere in the app). */
export async function ensureLocationPermission(): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Location.requestForegroundPermissionsAsync()).granted;
}

export async function whereAmI(): Promise<Here | null> {
  if (isDemo) return DEMO_HERE;
  if (!(await ensureLocationPermission())) return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude: lat, longitude: lng } = pos.coords;
  let label = '';
  let street = '';
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (a) {
      label = [a.district || a.subregion, a.city].filter(Boolean).join(', ');
      street = [a.street, a.streetNumber].filter(Boolean).join(' No: ');
    }
  } catch {
    // Geocoding is a convenience; the person can type the address.
  }
  return { lat, lng, label, street };
}

export async function currentCoords(): Promise<{ lat: number; lng: number } | null> {
  if (isDemo) return { lat: DEMO_HERE.lat, lng: DEMO_HERE.lng };
  if (!(await ensureLocationPermission())) return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** Tasker heartbeat while online: every ~30 s or 100 m, foreground only. */
export function watchCoords(onFix: (c: { lat: number; lng: number }) => void) {
  if (isDemo) return Promise.resolve({ remove: () => undefined });
  return Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 30_000, distanceInterval: 100 }, (p) =>
    onFix({ lat: p.coords.latitude, lng: p.coords.longitude }),
  );
}
