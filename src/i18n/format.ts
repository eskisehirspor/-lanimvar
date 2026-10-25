/** Turkish formatting, explicit (Hermes Intl data varies by platform). 1250 → "1.250", 2.1 → "2,1". */
export function groupThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  return sign + Math.abs(Math.trunc(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDecimal(n: number, fractionDigits = 1): string {
  const [int, frac] = Math.abs(n).toFixed(fractionDigits).split('.');
  return (n < 0 ? '-' : '') + groupThousands(Number(int)) + (frac ? ',' + frac : '');
}

export function formatTL(amount: number): string {
  return `${groupThousands(Math.round(amount))} TL`;
}

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${formatDecimal(km, 1)} km`;
}

/** 462 → "07:42"; 3930 → "1:05:30". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "482716" → ["482", "716"]. Read aloud in two groups of three. */
export function groupPin(pin: string): [string, string] {
  return [pin.slice(0, 3), pin.slice(3, 6)];
}

export const PIN_LENGTH = 6;

/** 905551234567 → +90 555 123 45 67 (falls back to +digits). */
export function formatPhone(e164: string | null | undefined): string {
  const d = String(e164 ?? '').replace(/\D/g, '');
  const m = d.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : d ? `+${d}` : '—';
}
