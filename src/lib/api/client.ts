import { getSupabase } from '@/lib/supabase/client';

import { AppError, toAppError } from './errors';

/** The configured client, or a typed error the UI can explain. */
export function db() {
  const s = getSupabase();
  if (!s) throw new AppError('unconfigured');
  return s;
}

/** Calls an RPC and turns server error codes into AppError. */
export async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().rpc(name, args);
  if (error) throw toAppError(error);
  return data as T;
}
