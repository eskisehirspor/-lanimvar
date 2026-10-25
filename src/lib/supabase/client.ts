import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { createDemoClient } from '@/lib/demo/client';

import { isDemo, isSupabaseConfigured, supabaseConfig } from './config';

let client: SupabaseClient | null = null;

/** Lazily created; null until EXPO_PUBLIC_SUPABASE_* is set. Product writes go through server RPCs. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (client) return client;
  if (isDemo) {
    client = createDemoClient() as unknown as SupabaseClient;
    return client;
  }
  client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Web (admin panel) completes OAuth from the URL; native exchanges the code itself.
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  });
  const auth = client.auth;
  AppState.addEventListener('change', (state) => (state === 'active' ? auth.startAutoRefresh() : auth.stopAutoRefresh()));
  return client;
}
