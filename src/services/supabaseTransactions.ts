import { supabase } from '../lib/supabaseClient';
import type { Transaction } from '../types/finia';

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error('User not authenticated');
  return data.user.id;
};

const normalizeTransaction = (tx: any): Transaction => ({
  ...tx,
  amount: Number(tx.amount ?? 0),
});

export async function createTransaction(
  payload: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
): Promise<Transaction> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...payload, user_id: userId, amount: Math.abs(payload.amount) }])
    .select()
    .single();

  if (error) throw error;
  return normalizeTransaction(data);
}

export async function bulkCreateTransactions(
  payloads: Array<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
): Promise<Transaction[]> {
  if (payloads.length === 0) return [];
  const userId = await requireUserId();
  const mapped = payloads.map((tx) => ({
    ...tx,
    user_id: userId,
    amount: Math.abs(tx.amount),
  }));

  const { data, error } = await supabase
    .from('transactions')
    .insert(mapped)
    .select();

  if (error) throw error;
  return (data || []).map(normalizeTransaction);
}

export async function listTransactionsForAccount(accountId: string): Promise<Transaction[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeTransaction);
}
