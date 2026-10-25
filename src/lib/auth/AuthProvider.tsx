import { useEffect, type ReactNode } from 'react';

import { db } from '@/lib/api/client';
import type { Profile } from '@/lib/api/types';
import { queryClient } from '@/lib/query/queryClient';
import { isSupabaseConfigured } from '@/lib/supabase/config';

import { statusFor, useAuth } from './store';

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await db().from('profiles').select('id, role, full_name, phone, onboarded_at, is_banned, deleted_at, legal_version').eq('id', userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

/** Re-reads the profile (after onboarding, role changes) and updates the gate. */
export async function refreshProfile() {
  const { session } = useAuth.getState();
  if (!session) return;
  const profile = await loadProfile(session.user.id);
  useAuth.getState().set({ profile, status: statusFor(session, profile) });
}

/** Keeps the auth store in sync with Supabase; the root layout gates routes on it. */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const store = useAuth.getState();
    if (!isSupabaseConfigured) {
      store.set({ status: 'unconfigured' });
      return;
    }
    const client = db();
    let cancelled = false;
    const apply = async (session: Awaited<ReturnType<typeof client.auth.getSession>>['data']['session']) => {
      if (!session) {
        queryClient.clear();
        useAuth.getState().set({ session: null, profile: null, status: 'signedOut' });
        return;
      }
      useAuth.getState().set({ session });
      const profile = await loadProfile(session.user.id).catch(() => null);
      if (cancelled) return;
      useAuth.getState().set({ profile, status: statusFor(session, profile) });
    };
    client.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = client.auth.onAuthStateChange((event, session) => {
      // Profile loads outside the callback (Supabase recommends not awaiting inside it).
      if (event === 'TOKEN_REFRESHED') return;
      setTimeout(() => apply(session), 0);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);
  return children;
}
