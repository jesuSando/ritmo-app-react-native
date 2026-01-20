export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
    id: number;
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date: string;
    is_recurring: boolean;
    recurrence_pattern?: string;
    is_confirmed: boolean;
    created_at: string;
    updated_at: string;
    account_id: number;
    budget_id?: number;
    user_id: number;
}