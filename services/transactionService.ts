import { supabase, isMockMode } from '../lib/supabaseClient';
import { NewTransactionPayload, Transaction, TransactionDraft, TransactionDirection } from '../types';

export const transactionService = {
  
  /**
   * Saves a list of transactions.
   * Handles "Transfer" logic by creating a corresponding transaction in the destination account.
   */
  async saveTransactions(transactions: NewTransactionPayload[]) {
    if (isMockMode) {
      console.log("MOCK: Saving transactions", transactions);
      return transactions;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const finalPayloads: any[] = [];

    for (const tx of transactions) {
      // 1. Prepare main transaction
      const baseTx = {
        user_id: user.id,
        account_id: tx.account_id,
        related_account_id: tx.related_account_id || null,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        direction: tx.direction,
      };

      finalPayloads.push(baseTx);

      // 2. Handle Transfer Logic (Create the pair)
      if (tx.direction === TransactionDirection.TRANSFER_OUT && tx.related_account_id) {
        // Automatically create the incoming transaction for the other account
        finalPayloads.push({
          user_id: user.id,
          account_id: tx.related_account_id,
          related_account_id: tx.account_id, // Link back to origin
          date: tx.date,
          description: `Traspaso desde: ${tx.description}`, // Or keep same description
          amount: tx.amount,
          direction: TransactionDirection.TRANSFER_IN,
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
        direction: TransactionDirection.EXPENSE,
        account_id: "", 
      },
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: "UBER TRIP HELP.UBER.COM",
        amount: 89.90,
        direction: TransactionDirection.EXPENSE,
        account_id: "",
      },
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: "TRANSFERENCIA RECIBIDA NOMINA",
        amount: 12500.00,
        direction: TransactionDirection.INCOME,
        account_id: "",
      }
    ];
  },

  async getRecentTransactions(limit = 10) {
     if (isMockMode) {
       return this._getMockTransactions();
     }

     const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name)
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // --- MOCK DATA ---
  _getMockTransactions() {
    return [
      {
        id: 'tx_1',
        date: new Date().toISOString().split('T')[0],
        description: 'Supermercado Walmart',
        amount: 1250.00,
        direction: TransactionDirection.EXPENSE,
        accounts: { name: 'BBVA Nómina' }
      },
      {
        id: 'tx_2',
        date: new Date().toISOString().split('T')[0],
        description: 'Pago de Spotify',
        amount: 129.00,
        direction: TransactionDirection.EXPENSE,
        accounts: { name: 'Banamex Oro' }
      },
      {
        id: 'tx_3',
        date: new Date().toISOString().split('T')[0],
        description: 'Depósito Cliente A',
        amount: 3500.00,
        direction: TransactionDirection.INCOME,
        accounts: { name: 'BBVA Nómina' }
      },
      {
        id: 'tx_4',
        date: new Date().toISOString().split('T')[0],
        description: 'Traspaso a Ahorro',
        amount: 500.00,
        direction: TransactionDirection.TRANSFER_OUT,
        accounts: { name: 'BBVA Nómina' }
      }
    ];
  }
};