export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Budget {
    id: number;
    name: string;
    amount: number;
    category?: string;
    period: BudgetPeriod;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    spent_amount: number;
    created_at: string;
    updated_at: string;
    account_id?: number;
    user_id: number;
}