import { supabase, isMockMode } from '../lib/supabaseClient';
import { Account, TransactionDirection, AccountType } from '../types';

export const accountService = {
  /**
   * Fetches all accounts for the current user.
   */
  async getAccounts(): Promise<Account[]> {
    if (isMockMode) {
      return this._getMockAccounts();
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches accounts and calculates their real-time balance
   * Balance = Initial + (Income + TransferIn) - (Expense + TransferOut)
   */
  async getAccountsWithBalance(): Promise<Account[]> {
    if (isMockMode) {
      return this._getMockAccounts();
    }

    // 1. Get Accounts
    const { data: accounts, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true);

    if (accError) throw accError;
    if (!accounts || accounts.length === 0) return [];

    // 2. Get All Transactions for these accounts
    // Note: In a large scale app, this should be a Database View or RPC function
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('account_id, amount, direction');

    if (txError) throw txError;

    // 3. Calculate Balances
    const accountsWithBalance = accounts.map((acc) => {
      const accountTx = transactions?.filter((tx) => tx.account_id === acc.id) || [];
      
      const totalMovement = accountTx.reduce((accBalance, tx) => {
        if (
          tx.direction === TransactionDirection.INCOME ||
          tx.direction === TransactionDirection.TRANSFER_IN
        ) {
          return accBalance + Number(tx.amount);
        } else {
          return accBalance - Number(tx.amount);
        }
      }, 0);

      return {
        ...acc,
        current_balance: Number(acc.initial_balance) + totalMovement,
      };
    });

    return accountsWithBalance;
  },

  async createAccount(account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'current_balance'>) {
    if (isMockMode) {
      console.log("MOCK: Creating account", account);
      return { ...account, id: crypto.randomUUID() };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAccount(id: string, updates: Partial<Account>) {
    if (isMockMode) {
      console.log("MOCK: Updating account", id, updates);
      return { id, ...updates };
    }

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
  },

  // --- MOCK DATA GENERATOR ---
  _getMockAccounts(): Account[] {
    return [
      {
        id: 'acc_1',
        user_id: 'demo',
        name: 'BBVA Nómina',
        bank: 'BBVA',
        type: AccountType.DEBIT,
        initial_balance: 5000,
        is_active: true,
        created_at: new Date().toISOString(),
        current_balance: 12450.50
      },
      {
        id: 'acc_2',
        user_id: 'demo',
        name: 'Banamex Oro',
        bank: 'Citibanamex',
        type: AccountType.CREDIT,
        initial_balance: 0,
        credit_limit: 50000,
        is_active: true,
        created_at: new Date().toISOString(),
        current_balance: -4500.00
      },
      {
        id: 'acc_3',
        user_id: 'demo',
        name: 'Ahorro Meta',
        bank: 'Hey Banco',
        type: AccountType.SAVINGS,
        initial_balance: 10000,
        is_active: true,
        created_at: new Date().toISOString(),
        current_balance: 15200.00
      }
    ];
  }
};