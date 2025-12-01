export enum AccountType {
  DEBIT = 'debito',
  CREDIT = 'credito',
  SAVINGS = 'ahorro',
  OTHER = 'otro'
}

export enum TransactionDirection {
  EXPENSE = 'gasto',
  INCOME = 'ingreso',
  TRANSFER_OUT = 'traspaso_salida',
  TRANSFER_IN = 'traspaso_entrada'
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  type: AccountType;
  credit_limit?: number;
  initial_balance: number;
  is_active: boolean;
  created_at: string;
  // Computed on client/service side
  current_balance?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  related_account_id?: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  direction: TransactionDirection;
  created_at?: string;
}

export interface NewTransactionPayload {
  date: string;
  description: string;
  amount: number;
  direction: TransactionDirection;
  account_id: string;
  related_account_id?: string;
}

export interface TransactionDraft {
  id: string; // Temporary ID for UI
  date: string;
  description: string;
  amount: number;
  direction: TransactionDirection;
  account_id: string;
  related_account_id?: string;
}