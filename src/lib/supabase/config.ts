/** Supabase configuration. Without these values the app shows a setup screen (and the Design Lab in development). */
export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
