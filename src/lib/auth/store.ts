import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { Profile } from '@/lib/api/types';

/**
 * Where the person is in the app's front door:
 *  unconfigured → no backend set (dev without .env)
 *  loading → restoring the session
 *  signedOut → welcome / phone / social
 *  onboarding → signed in, name + role + legal consent missing
 *  ready → in the product
 */
export type AuthStatus = 'unconfigured' | 'loading' | 'signedOut' | 'onboarding' | 'banned' | 'ready';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  set: (patch: Partial<Omit<AuthState, 'set'>>) => void;
}

export const useAuth = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  profile: null,
  set: (patch) => set(patch),
}));

export function statusFor(session: Session | null, profile: Profile | null): AuthStatus {
  if (!session) return 'signedOut';
  if (!profile || profile.deleted_at) return 'loading';
  if (profile.is_banned) return 'banned';
  if (!profile.onboarded_at) return 'onboarding';
  return 'ready';
}
