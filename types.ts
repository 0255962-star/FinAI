import type {
  Account as SupabaseAccount,
  AccountWithBalance as SupabaseAccountWithBalance,
  Category as SupabaseCategory,
  Transaction as SupabaseTransaction,
} from './src/types/finia';

export const AccountType = {
  DEBIT: 'debito',
  CREDIT: 'credito',
  SAVINGS: 'ahorro',
  CASH: 'efectivo',
  OTHER: 'otro',
} as const;
export type AccountType = typeof AccountType[keyof typeof AccountType];

export const CategoryType = {
  EXPENSE: 'gasto',
  INCOME: 'ingreso',
  MIXED: 'mixto',
} as const;
export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export const TransactionType = {
  EXPENSE: 'gasto',
  INCOME: 'ingreso',
  TRANSFER_OUT: 'traspaso_salida',
  TRANSFER_IN: 'traspaso_entrada',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export type Account = SupabaseAccount;
export type Category = SupabaseCategory;
export type Transaction = SupabaseTransaction;
export type AccountWithBalance = SupabaseAccountWithBalance;

export interface NewTransactionPayload {
  date: string;
  description?: string;
  amount: number;
  type: TransactionType;
  account_id: string;
  category_id?: string;
  related_account_id?: string;
}

export interface TransactionDraft {
  id: string; // temporary ID for UI rows
  date: string;
  description?: string;
  amount: number;
  type: TransactionType;
  account_id: string;
  category_id?: string;
  related_account_id?: string;
}
