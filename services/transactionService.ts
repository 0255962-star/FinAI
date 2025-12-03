import { supabase } from '../lib/supabaseClient';
import { NewTransactionPayload, TransactionDraft, TransactionType } from '../types';

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data?.user) throw new Error('User not authenticated');
  return data.user.id;
};

export const transactionService = {
  
  /**
   * Saves a list of transactions.
   * Handles "Transfer" logic by creating a corresponding transaction in the destination account.
   */
  async saveTransactions(transactions: NewTransactionPayload[]) {
    const userId = await requireUserId();

    const finalPayloads: any[] = [];

    for (const tx of transactions) {
      // 1. Prepare main transaction
      const baseTx = {
        user_id: userId,
        account_id: tx.account_id,
        related_account_id: tx.related_account_id || null,
        date: tx.date,
        description: tx.description,
        amount: Math.abs(tx.amount),
        type: tx.type,
        category_id: tx.category_id || null,
      };

      finalPayloads.push(baseTx);

      // 2. Handle Transfer Logic (Create the pair)
      if (tx.type === TransactionType.TRANSFER_OUT && tx.related_account_id) {
        // Automatically create the incoming transaction for the other account
        finalPayloads.push({
          user_id: userId,
          account_id: tx.related_account_id,
          related_account_id: tx.account_id, // Link back to origin
          date: tx.date,
          description: `Traspaso desde: ${tx.description}`, // Or keep same description
          amount: Math.abs(tx.amount),
          type: TransactionType.TRANSFER_IN,
        });
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(finalPayloads)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * STUB FOR CLAUDE API INTEGRATION
   * 
   * This function currently simulates processing an image.
   * In the future, replace the timeout with a fetch call to your API route
   * that sends the image to Claude/OpenAI.
   */
  async parseStatementImage(file: File): Promise<TransactionDraft[]> {
    console.log("Analyzing image...", file.name);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // STUBBED RESPONSE - Expected format from AI
    // The account_id is empty initially, user must select it in UI
    return [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: "OXXO EXPRESS GDL",
        amount: 158.50,
        type: TransactionType.EXPENSE,
        account_id: "", 
      },
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: "UBER TRIP HELP.UBER.COM",
        amount: 89.90,
        type: TransactionType.EXPENSE,
        account_id: "",
      },
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: "TRANSFERENCIA RECIBIDA NOMINA",
        amount: 12500.00,
        type: TransactionType.INCOME,
        account_id: "",
      }
    ];
  },

  async getRecentTransactions(limit = 10) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async listTransactionsForUser() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
