export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Budget {
    id: number;
    name: string;
    amount: number;
    spent_amount: number;
    category: string | null;
    period: BudgetPeriod;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    account_id: number | null;
    user_id: number;
    created_at: string;
    updated_at: string;
}