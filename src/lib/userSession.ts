import { supabase } from './supabaseClient';

let cachedUserId: string | null = null;
let lastFetch = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function requireUserId(): Promise<string> {
  const now = Date.now();
  if (cachedUserId && now - lastFetch < CACHE_TTL_MS) {
    return cachedUserId;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const userId = sessionData.session?.user?.id;
  if (userId) {
    cachedUserId = userId;
    lastFetch = now;
    return userId;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error('User not authenticated');

  cachedUserId = data.user.id;
  lastFetch = now;
  return data.user.id;
}
