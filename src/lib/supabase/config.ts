/** Supabase configuration. Without these values the app shows a setup screen (and the Design Lab in development). */
export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

/** Public click-through demo: an in-browser fake backend (src/lib/demo). Never set for real builds. */
export const isDemo = process.env.EXPO_PUBLIC_DEMO === '1';

export const isSupabaseConfigured = isDemo || Boolean(supabaseConfig.url && supabaseConfig.anonKey);
