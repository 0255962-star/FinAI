import { supabase } from '../lib/supabaseClient';
import type { Account, AccountWithBalance } from '../types/finia';

const INCOMING_TYPES = new Set(['ingreso', 'traspaso_entrada']);

const normalizeAccount = (acc: any): Account => ({
  ...acc,
  initial_balance: Number(acc.initial_balance ?? 0),
  credit_limit: acc.credit_limit !== undefined && acc.credit_limit !== null ? Number(acc.credit_limit) : null,
});

const computeBalance = (initial: number, transactions: Array<{ amount: any; type: string }>) => {
  return transactions.reduce((running, tx) => {
    const amt = Number(tx.amount ?? 0);
    return INCOMING_TYPES.has(tx.type) ? running + amt : running - amt;
  }, Number(initial ?? 0));
};

export async function getAccountBalance(accountId: string): Promise<number> {
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id, initial_balance, user_id')
    .eq('id', accountId)
    .single();

  if (accountError) throw accountError;
  if (!account) throw new Error('Account not found');

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('account_id', accountId);

  if (txError) throw txError;

  return computeBalance(account.initial_balance, transactions || []);
}

export async function getAccountsWithBalanceForUser(userId: string): Promise<AccountWithBalance[]> {
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (accError) throw accError;
  if (!accounts || accounts.length === 0) return [];

  const accountIds = accounts.map((a) => a.id);

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('account_id, amount, type')
    .eq('user_id', userId)
    .in('account_id', accountIds);

  if (txError) throw txError;

  const txByAccount = new Map<string, Array<{ amount: any; type: string }>>();
  (transactions || []).forEach((tx) => {
    const list = txByAccount.get(tx.account_id) || [];
    list.push(tx);
    txByAccount.set(tx.account_id, list);
  });

  return accounts.map((acc) => {
    const normalized = normalizeAccount(acc);
    const txList = txByAccount.get(acc.id) || [];
    const current_balance = computeBalance(normalized.initial_balance, txList);
    return { ...normalized, current_balance };
  });
}
