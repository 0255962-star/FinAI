import { supabase } from '../lib/supabaseClient';
import { Account, AccountWithBalance, TransactionType } from '../types';
import { requireUserId } from '../src/lib/userSession';

const normalizeAccount = (acc: any): Account => ({
  ...acc,
  initial_balance: Number(acc.initial_balance ?? 0),
  credit_limit: acc.credit_limit !== undefined && acc.credit_limit !== null ? Number(acc.credit_limit) : undefined,
});

export const accountService = {
  /**
   * Fetches all accounts for the current user.
   */
  async getAccounts(): Promise<Account[]> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeAccount);
  },

  /**
   * Fetches accounts and calculates their real-time balance
   * Balance = Initial + (Income + TransferIn) - (Expense + TransferOut)
   */
  async getAccountsWithBalance(): Promise<AccountWithBalance[]> {
    const userId = await requireUserId();

    // 1. Get Accounts
    const { data: accounts, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .eq('user_id', userId);

    if (accError) throw accError;
    if (!accounts || accounts.length === 0) return [];

    // 2. Get All Transactions for these accounts
    // Note: In a large scale app, this should be a Database View or RPC function
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('account_id, amount, type')
      .eq('user_id', userId);

    if (txError) throw txError;

    // 3. Calculate Balances
    const accountsWithBalance = accounts.map((acc) => {
      const normalized = normalizeAccount(acc);
      const accountTx = transactions?.filter((tx) => tx.account_id === normalized.id) || [];
      
      const totalMovement = accountTx.reduce((accBalance, tx) => {
        if (
          tx.type === TransactionType.INCOME ||
          tx.type === TransactionType.TRANSFER_IN
        ) {
          return accBalance + Number(tx.amount);
        } else {
          return accBalance - Number(tx.amount);
        }
      }, 0);

      return {
        ...normalized,
        current_balance: normalized.initial_balance + totalMovement,
      };
    });

    return accountsWithBalance as AccountWithBalance[];
  },

  async createAccount(account: Omit<Account, 'id' | 'user_id' | 'created_at'>) {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return normalizeAccount(data);
  },

  async updateAccount(id: string, updates: Partial<Account>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleAccountStatus(id: string, isActive: boolean) {
    return this.updateAccount(id, { is_active: isActive });
  }
};
