import { supabase } from '../lib/supabaseClient';
import type { Account } from '../types/finia';
import { requireUserId } from '../lib/userSession';

const normalizeAccount = (acc: any): Account => ({
  ...acc,
  initial_balance: Number(acc.initial_balance ?? 0),
  credit_limit: acc.credit_limit !== undefined && acc.credit_limit !== null ? Number(acc.credit_limit) : null,
});

export async function createAccount(
  payload: Omit<Account, 'id' | 'user_id' | 'created_at'>
): Promise<Account> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...payload, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return normalizeAccount(data);
}

export async function updateAccount(
  id: string,
  updates: Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>
): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeAccount(data);
}

export async function deactivateAccount(id: string): Promise<Account> {
  return updateAccount(id, { is_active: false });
}

export async function listAccountsForCurrentUser(): Promise<Account[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeAccount);
}
