export type AccountType = 'debito' | 'credito' | 'ahorro' | 'efectivo' | 'otro';
export type CategoryType = 'gasto' | 'ingreso' | 'mixto';
export type TransactionType = 'gasto' | 'ingreso' | 'traspaso_salida' | 'traspaso_entrada';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  bank?: string;
  type: AccountType;
  currency: string;
  credit_limit?: number;
  initial_balance: number;
  is_active: boolean;
  color?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  date: string; // YYYY-MM-DD
  description?: string | null;
  amount: number;
  type: TransactionType;
  category_id?: string | null;
  related_account_id?: string | null;
  created_at: string;
}

export interface AccountWithBalance extends Account {
  current_balance: number;
}
