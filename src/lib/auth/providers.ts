import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { db } from '@/lib/api/client';
import { AppError, toAppError } from '@/lib/api/errors';

WebBrowser.maybeCompleteAuthSession();

/** +90 5XX XXX XX XX → 905XXXXXXXXX (E.164 without +, as Supabase stores it). */
export function normalizeTrPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^0090/, '').replace(/^90/, '').replace(/^0/, '');
  return /^5\d{9}$/.test(digits) ? `90${digits}` : null;
}

export async function sendPhoneCode(phone: string) {
  const { error } = await db().auth.signInWithOtp({ phone: `+${phone}` });
  if (error) throw toAppError(error);
}

export async function verifyPhoneCode(phone: string, token: string) {
  const { error } = await db().auth.verifyOtp({ phone: `+${phone}`, token, type: 'sms' });
  if (error) throw new AppError('invalid_input', error.message);
}

/** Sign in with Apple: native sheet on iOS (required look), web flow elsewhere. */
export async function signInWithApple() {
  if (Platform.OS !== 'ios') return signInWithOAuth('apple');
  const raw = Crypto.randomUUID();
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
    if (!credential.identityToken) throw new AppError('unknown', 'no identity token');
    const { error } = await db().auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken, nonce: raw });
    if (error) throw toAppError(error);
    // Apple only sends the name the first time: keep it for onboarding.
    const name = credential.fullName ? AppleAuthentication.formatFullName(credential.fullName) : '';
    if (name.trim()) await db().auth.updateUser({ data: { full_name: name.trim() } });
  } catch (e) {
    if (typeof e === 'object' && e && 'code' in e && (e as { code: string }).code === 'ERR_REQUEST_CANCELED') return;
    throw toAppError(e);
  }
}

export function signInWithGoogle() {
  return signInWithOAuth('google');
}

/** PKCE OAuth in the system browser; works in Expo Go, dev builds and on the web. */
async function signInWithOAuth(provider: 'google' | 'apple') {
  const client = db();
  const redirectTo = Linking.createURL('auth-callback');
  const { data, error } = await client.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' } });
  if (error) throw toAppError(error);
  if (Platform.OS === 'web' || !data.url) return;
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;
  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new AppError('unknown', 'no auth code');
  const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
  if (exchangeError) throw toAppError(exchangeError);
}

/** What auth itself has verified (never trusted from the client for anything server-side). */
export async function getVerification() {
  const { data } = await db().auth.getUser();
  const u = data.user;
  return {
    phone: u?.phone ?? null,
    phoneVerified: !!u?.phone && !!u?.phone_confirmed_at,
    email: u?.email ?? null,
    emailVerified: !!u?.email && !!u?.email_confirmed_at,
  };
}

/** Add/confirm a phone on an account that signed in with Apple or Google. */
export async function requestPhoneLink(phone: string) {
  const { error } = await db().auth.updateUser({ phone: `+${phone}` });
  if (error) throw toAppError(error);
}

export async function confirmPhoneLink(phone: string, token: string) {
  const { error } = await db().auth.verifyOtp({ phone: `+${phone}`, token, type: 'phone_change' });
  if (error) throw new AppError('invalid_input', error.message);
}

/** E-mail verification by 6-digit code (the e-mail template carries {{ .Token }}). */
export async function requestEmailCode(email: string) {
  const { error } = await db().auth.updateUser({ email: email.trim().toLowerCase() });
  if (error) throw toAppError(error);
}

export async function confirmEmailCode(email: string, token: string) {
  const { error } = await db().auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email_change' });
  if (error) throw new AppError('invalid_input', error.message);
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export async function signOut() {
  await db().auth.signOut();
}

export async function deleteAccount() {
  const { error } = await db().functions.invoke('delete-account', { method: 'POST' });
  if (error) throw toAppError(error);
  await db().auth.signOut();
}
