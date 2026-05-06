import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Typed helper that throws on error (drop-in for old fetchWithAuth)
export async function query<T = any>(
  fn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await fn();
  if (error) throw new Error(error.message || 'Supabase query failed');
  return data as T;
}
