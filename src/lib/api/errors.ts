import { t, type CopyKey } from '@/i18n';

/** Server error codes (RAISE EXCEPTION '<code>' in the RPCs) → copy. */
const codes = ['not_signed_in', 'not_onboarded', 'banned', 'not_allowed', 'invalid_state', 'invalid_input', 'offer_expired', 'already_taken', 'pin_locked', 'too_early', 'underage', 'phone_unverified', 'email_unverified', 'invalid_national_id', 'duplicate_national_id', 'contact_info_not_allowed'] as const;
export type ServerCode = (typeof codes)[number];

export class AppError extends Error {
  constructor(
    public code: ServerCode | 'network' | 'unconfigured' | 'unknown',
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  const code = codes.find((c) => msg.includes(c));
  if (code) return new AppError(code, msg);
  if (/network|fetch|timeout/i.test(msg)) return new AppError('network', msg);
  return new AppError('unknown', msg);
}

export function errorText(e: unknown): string {
  return t(`errors.${toAppError(e).code}` as CopyKey);
}
